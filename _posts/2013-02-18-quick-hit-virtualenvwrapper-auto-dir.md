---
layout: post
title: Quick Hit&#58; Virtualenvwrapper Auto Directory Tips
author: Jason Myers
comments: true
---


I use [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest) to manage my virtual environments, 
and I store everything in a projects folder in my home directory.  Thanks to a tip on the virtualenvwrapper site, 
I can have it automatically create directories for my projects when I do a mkvirtualenv.  I can also have it 
automatically change to the project directory when I use work on.

To set this up I have to edit two scripts in the ``VIRTUALENVWRAPPER_HOOK_DIR``, which defaults to the ``$WORKON_HOME``.  
For me I have it set via ``export WORKON_HOME=$HOME/.virtualenv`` in my ``.bashrc`` file, which means the following two 
scripts are in ``~/.virtualenv/``.

In the ``postmkvirtualenv`` script I have the following to create a directory based on the project name, add that 
directory to the python path and then cd into it:

    proj_name=$(echo $VIRTUAL_ENV|awk -F'/' '{print $NF}')
    mkdir $HOME/projects/$proj_name
    add2virtualenv $HOME/projects/$proj_name
    cd $HOME/projects/$proj_name

In the ``postactivate script`` I have it set to automatically change to the project directory when I use the ``workon`` command:

    proj_name=$(echo $VIRTUAL_ENV|awk -F'/' '{print $NF}')
    cd ~/projects/$proj_name

The follow is the result of the two commands after the changes above:

    $ mkvirtualenv test
    New python executable in test/bin/python
    Installing setuptools............done.
    Installing pip...............done.
    virtualenvwrapper.user_scripts creating /home/jason/.virtualenv/test/bin/predeactivate
    virtualenvwrapper.user_scripts creating /home/jason/.virtualenv/test/bin/postdeactivate
    virtualenvwrapper.user_scripts creating /home/jason/.virtualenv/test/bin/preactivate
    virtualenvwrapper.user_scripts creating /home/jason/.virtualenv/test/bin/postactivate
    virtualenvwrapper.user_scripts creating /home/jason/.virtualenv/test/bin/get_env_details
    (test)jason@bettlebop in ~/projects/test

    $ workon test
    (test)jason@bettlebop in ~/projects/test
