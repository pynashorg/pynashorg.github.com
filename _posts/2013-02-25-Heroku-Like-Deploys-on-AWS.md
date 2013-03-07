---
layout: post
title: Quick Hit&#58; Build a Heroku Like AWS Instance
author: Jason Myers
comments: true
---

One of my favorite things about heroku is their simplicity to get up and running on a new app. 
I've recently been trying to replicate parts of their setup that I really like on my AWS servers. 
So I wanted to share where I'm at so far, and to start off we need a blank EC2 ubuntu instance.  In 
this example, I'm also using RDS, but a quick edit of the connection string and you can use whatever you 
like. As this example is using nginx and gunicorn to serve a flask application, you might need to 
make changes to serve pyramid or django applications. (Not many though)

To start off let's get our new host added to our ssh config file. I'm on a Mac but in any 
\*nix OS, your ssh config is in ~/.ssh/config.  Open that file in your favorite editor. `vim ~/.ssh/config`

    Host hostname
      User ubuntu
      HostName ec2-XX-XXX-XX-XXX.compute-1.amazonaws.com
      IdentityFile ~/.ssh/key.pem

Now we can connect to the instance with a simple name and not worry about keys.  For example:

    ssh hostname


##Base OS and Environment Setup
On first things first let's get all our packages up to date on the instance. So start an SSH 
session as shown in the command above, then type:

    sudo apt-get update && sudo apt-get upgrade

This updates the package listing and resposity, and then installs any packages that have pending 
updates.  This is not always safe due to OS release cycles; however, on Ubuntu 12.04.01+ it's 
safe until we move to the next LTS of Ubuntu.

Now we're ready to start getting our python, ubuntu, and web serving applications installed. 
We're also going to upgrade distribute from pip since MySQL-python requires a newer version. 
I like to use virtualenvwrapper to setup my environments.

    sudo apt-get install python-dev make python-pip nginx libevent-dev git libmysqlclient-dev
    sudo easy_install -U distribute


Onward to setting up the tools to run our Flask application. We'll be using gunicorn to serve 
the application, watchdog to watch for file changes, and supervisor to manage the processes. 
Some people prefer to use virtualenvs, but my endgoal is to use OpsWorks to spin up and down at 
will.

    sudo pip install gunicorn
    sudo pip install watchdog
    sudo pip install supervisor


In my case I'm gonna be serving via SSL, so time to setup the certificates. I always put my 
certificates in /opt/ssl.  The domainname.com.chained.crt contains the entire certificate chain, 
and domainname.com.key contains the private key used with the certificate.

    sudo chgrp admin /opt
    sudo chmod 775 /opt
    mkdir /opt/ssl
    vim /opt/ssl/domainname.com.chained.crt
    vim /opt/ssl/domainname.com.key


##Setup Git Hosting
Now let's setup a git repo to recieve our application.  This setups a bare git repo that we can 
push data into.  This is what enables us to deploy our application via git. The directory 
created last is where our app is going to be copied to for the active running copy.

    mkdir appname.git
    cd appname.git
    git init --bare
    mkdir /opt/appname


Next, we're gonna setup a git post-receive hook.  This will copy every push to the git repo 
over to our /opt/appname directory.

    vim hooks/post-receive

Put in the following:

    #!/bin/sh
    GIT_WORK_TREE=/opt/appname git checkout -f

Now make it executable:

    chmod +x hooks/post-receive


##Setup Nginx
Now we need to build an nginx configuration file for our applications. `sudo vim /etc/nginx/sites-available/appname `
I'm gonna step through this file a bit at a time to explain it.  First we're going to setup the reference to 
our gunicorn server.  We're going to be running it on localhost port 5000.

    upstream appname {
     #server unix:/tmp/gunicorn.sock fail_timeout=0;
     # For a TCP configuration:
     server 127.0.0.1:5000 fail_timeout=0;
    }

Next I want to setup a listener to redirect all HTTP requests to HTTPS:

    server {
           listen 80;
           server_name www.appname.com;
           rewrite ^ https://$server_name$request_uri? permanent;
    }

Next we're going to setup the ssl listener.

    server {
     listen 443 ssl;

     client_max_body_size 4G;
     server_name www.appname.com;

     keepalive_timeout 300;

     ssl_certificate /opt/appname/appname.com.chained.crt;
     ssl_certificate_key /opt/appname/appname.com.key;
     ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;
     ssl_ciphers HIGH:!aNULL:!MD5;

We're going to setup a directory where we can put temporary files to override the gunicorn proxy. 
Very useful for scheduled maintenance.

     # path for static files
     root /opt/appname/nginx-static;

     location / {
         # checks for static file, if not found proxy to app
         try_files $uri @proxy_to_app;
     }

Now let's setup the actually proxying piece for gunicorn.  The proxy_pass directive must match 
the upstream name we defined earlier.

     location @proxy_to_app {
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header Host $http_host;
         proxy_redirect off;

         proxy_pass http://appname;
     }

Lastly, we need to define a location for server based error pages.

     error_page 500 502 503 504 /500.html;
     location = /500.html {
         root /opt/appname/nginx-static;
     }
    }


The complete nginx conf file as a gist is available [here](https://gist.github.com/jasonamyers/5024959). We need 
to turn off the default site, and enable the one for our app.

    sudo ln -s /etc/nginx/sites-available/appname /etc/nginx/sites-enabled/appname


##Setup Gunicorn
Next let's setup an app config for gunicorn.  This will bind gunicorn to the proper interface and port. 
It also sets up logs in the /opt/appname directory.  It creates workers based on the number of processors, 
and is great for autoscaling on Amazon instances.  We also set the timeout to 5 minutes.  This file goes in 
``/opt/appname/gunicorn.conf.py``.


    import multiprocessing

    bind = '127.0.0.1:5000'
    accesslog = 'access.log'
    errorlog = 'error.log'
    workers = multiprocessing.cpu_count() * 2 + 1
    timeout = 300


##Setup Supervisord
Now we need to switch to the root user and setup supervisord. I've setup a [gist](https://gist.github.com/jasonamyers/5024988) 
with a common supervisord init script. This was lifted from a stackoverflow [post](http://serverfault.com/questions/96499/how-to-automatically-start-supervisord-on-linux-ubuntu). 
We need to make the script executable and then update the system rc.d process to utilize the scripts. 

    sudo su
    curl https://gist.github.com/jasonamyers/5024988/raw/88d0d68c4af22a7474ad1d011659ea2d27e35b8d/supervisord.sh > /etc/init.d/supervisord
    cd /etc/init.d
    sudo chmod +x supervisord
    sudo update-rc.d supervisord defaults


Next we need to setup a conf file for supervisord that will point to our gunicorn process and setup watchmedo to restart 
the process when we push new files.  First let's start with the general configuration values for supervisord.

    [unix_http_server]
    file=/tmp/supervisor.sock ; (the path to the socket file)
     
    [supervisord]
    logfile=/tmp/supervisord.log ; (main log file;default $CWD/supervisord.log)
    logfile_maxbytes=50MB ; (max main logfile bytes b4 rotation;default 50MB)
    logfile_backups=10 ; (num of main logfile rotation backups;default 10)
    loglevel=info ; (log level;default info; others: debug,warn,trace)
    pidfile=/var/run/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
    nodaemon=false ; (start in foreground if true;default false)
    minfds=1024 ; (min. avail startup file descriptors;default 1024)
    minprocs=200 ; (min. avail process descriptors;default 200)
     
    ; the below section must remain in the config file for RPC
    ; (supervisorctl/web interface) to work, additional interfaces may be
    ; added by defining them in separate rpcinterface: sections
    [rpcinterface:supervisor]
    supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
     
    [supervisorctl]
    serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL for a unix socket
     
    ; The below sample program section shows all possible program subsection values,
    ; create one or more 'real' program: sections to be able to control them under
    ; supervisor.


Now we need to setup the gunicorn directive.  We specify the command to execute gunicorn, and the process name 
to watch for. Next we specify the directory we want to run the command in, and then the user we want the process 
to run on. Followed by directives about whether or not we excute the command on server start, and if it dies do 
we want to restart it. Finally, we specify environment variables in key/value pairs that we use in our app 
environment.

    [program:gunicorn]
    command=/usr/local/bin/gunicorn appname:app -c /opt/appname/gunicorn.conf.py
    process_name=%(program_name)s
    directory=/opt/appname
    user=ubuntu
    autostart=true
    autorestart=true
    redirect_stderr=true
    environment=DATABASE_URL='mysql://user:password@rds.amazonaws.com/appname',ANOTHER_ENV_VARL='http://api.url.com'


Finally we setup watchmedo to monitor file changes. It watches /opt/appname recursively for any file changes, 
and will restart gunicorn via supervisord.

    [program:watchmedo]
    command=/usr/local/bin/watchmedo shell-command --patterns "*.py;*.txt" --recursive --command='/
    usr/local/bin/supervisorctl restart gunicorn' /opt/appname
    process_name=%(program_name)s
    directory=/var/www/html
    autostart=true
    autorestart=true
    redirect_stderr=true


##Push to Git
Now back on our desktop let's push our app via git to the server:

    git remote add prod ubuntu@hostname:appname.git
    git push prod master


You should now see files under /opt/appname relating to your application on the EC2 instance. Now lets install 
all the requirements.  Some people like to add this to the watchmedo directive in ``/etc/supervisord.conf``.

    sudo pip install -r /opt/appname/requirements.txt


Perform any application setup you need.  For example, create the database or if you have any background processes that run as part of the application, you'll want to make sure you put
any required environment variables such as database connection strings in the /etc/environment file. 

Restart the server with the follow:

    sudo shutdown -r now


Now check that supervisord started our processes correctly.

    sudo supervisorctl status


We can also check both the gunicorn and supervisord logs in /tmp

Let me know what problems you run into!



Additional Django Resources
- [Django Gunicorn and Nginx Setup](http://ijcdigital.com/blog/django-gunicorn-and-nginx-setup/)
- [Graphite on Ubuntu 12.04 LTS – Part II: gunicorn, nginx and supervisord](http://www.kinvey.com/blog/108/graphite-on-ubuntu-1204-lts-8211-part-ii-gunicorn-nginx-and-supervisord)
