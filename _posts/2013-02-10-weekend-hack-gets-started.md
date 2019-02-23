---
layout: post
title: Weekend Hacks
author: Whit Morris
comments: true
---

## Who & What

Howdy, my name is Whit and I work for SurveyMonkey, who is kind enough
to let me work from right here in the Nashdiggity.  I'm one of those
programmers who came to talking to the machine through trying to say
things on the web. I built my first website in 1996. Just for fun,
here's an early site I did both design and programming on:
[Charlottesville Airport circa 1997](http://bit.ly/Z1QSwN)).  That fat stack ran a perl CGI
backed by MSQL (no Y) on AIX. Quicktime panoramas and animated gifs were
cutting edge back then.

At that time, hacks were all I knew: photoshop effects and table layouts,
duck tape and bailing wire.  I dug ungodly things out of the Camel book and put them right into production.

  Though I've come a long way since, I
still appreciate a good hack.  Dirty or elegant, quick or involved,
ugly or inspire, a hack is a heuristic or intuition based
implementation that makes what previously was an impediment into a
step, a fulcrum, a tool, an anvil, a parachute, an ax to make more
hacks.

These days I do most of my hacking in python and I'm honored to be
invited to contribute to the pynash blog.  My columns will
focus on hacks using python as duck tape and super glue.



## Hack #0: stream a url into s3

### The problem

Hacking is best when you have something you want to do.  So here is my
problem: I have a band, and we post our practice sessions to
soundcloud.  Soundcloud has a 2hr limit for uploaded music, and well,
our band is kinda jammy.  

I want to replicate all the recordings into
an S3 bucket for safe keeping and hacking ease (say with echonest).

### TL;DR

This will be a 3 part hack:

 - get the data (today)
 - stream it to S3 
 - make it concurrent


Here, we'll walk through the process of properly getting started hacking
with python IMH&HO.

Once we have a sandbox, we'll use the python http client library
[requests](http://docs.python-requests.org) to get data from
Soundcloud. We'll talk a bit about the design of what we will do next
week using the
[AWS python api library](http://aws.amazon.com/sdkforpython/) to stream files from soundcloud to S3.

### Venv Up! Pip and Paste! Git'r started

No project starts without a sandbox (ie a virtualenv). You may say "but
it's just a hack", but setting up a proper sandbox is pretty
easy. Suave operators use
[virtualenv-wrapper](http://www.doughellmann.com/projects/virtualenvwrapper/)
so in the interest of being classy, so will we.

This is how I roll when I want to get started (presuming I think it
will be more than a gist of code).  After creating a github repo::

    $ cd /to/the/folder/where/the-magic-happens
    $ mkvirtualenv sc2s3
    (sc2s3)$ pip install pastescript
    (sc2s3)$ paster create sc2s3
    ... answer a bunch of questions about my package
    (sc2s3)$ cd ./sc2s3 && wget -O .gitignore http://bit.ly/Z1Tn2e \
                 && git init \ 
                 && git remote add origin git@github.com:whitmo/sc2s3.git
    (sc2s3)$ git add ./ && git commit -m 'gitty up' && git push -u origin master
    (sc2s3)$ pip install -e ./

The last step puts your new package onto the python path so you can start
executing it.

### Technical investigation

We live in the age of P.roggramming B.y G.oogling. Ever watch someone
build a webapp with RoR? In this case, I need to know a bit about
soundcloud and S3.  There is a soundcloud
[actual python library](http://bit.ly/XuMjUU), but I notice that
soundcloud has a fairly rich
[REST/http API](http://developers.soundcloud.com/docs/api/reference#users)
that will give me JSON.  All I need to do is
[set up an application](http://soundcloud.com/you/apps) w/ soundcloud,
and they will give me a client id and an access token.


As all I need is a list of links, I think simply doing some http will
be easiest.  I have a good hammer for this, the
[requests](http://docs.python-requests.org) library by Kenneth
"Kraftwerkzeung" Reitz.

Let's grab it::


    (sc2s3)$ pip install requests


Now, lets get prompt.  The python REPL (and it's mutant children like
ipython notebook) rule.  Let's load up our 


    (sc2s3)$ python
    >>> import requests
    >>> import sc2s3
    >>> help(requests)
    ... # whole lotta on nice documentation
    >>> help(sc2s3)
    ... # whole lotta nada


Now we can start to play

    >>> clid = 'reallysupersecret123'
    >>> res = requests.get('http://api.soundcloud.com/users/whitmo/tracks.json?client_id=%s' %client_id) 
    >>> res.status_code
    200
    >>> res.json()
    [{...lots of data...}]

Using a simple list comprehension I can extract the urls::

    >>> data = res.json()
    >>> urls = [x['download_url'] for x in res.json() if 'downloadable' in x] 

So that works.  I've stuck this into a [function in sc2s3](https://github.com/whitmo/sc2s3/blob/master/sc2s3/cli.py#L11). Now I can import this function and tweak it if I like:

    >>> from sc2s3 import cli
    >>> data, response = cli.trackdata('whit', clid)
I want to change this function and test it, I can use the `reload` function::

    >>> reload(cli)
    >>> data, response = cli.trackdata('whit', clid)

This is a quick and easy way to iterate and test your code at the early design stage.  



So, now all we have to do is get those files from point A (sound cloud) to
point B (S3).



### What's next

We've got our data from soundcloud, now we need to get those files and
push them into S3.

Eventually I want this to be fairly fast. I want to run the script and see
if worked without alot of waiting.  I also don't want to manage
file downloads locally.  Copying down to a temp dir would be fine but I
think we can do better).

Requests supports streaming requests which will let you iterate
through a download in blocks.  Symetrically boto supports a multipart
upload which allows you to upload a file piece by piece by
monotonically numbering it's parts (nice since it allows a user to
send up parts willy nilly).

Ideally, the script will do nothing but hand off blocks from the
sound cloud server to s3.  We'll tackle this next time.

Most of the execution time will likely be
spent inside network IO. This problem is a good fit for using a
library like gevent to enables use to do asyncronous network
communication.  The final post for this hack will cover making it as concurrent as possible.


## In conclusion

Thanks for reading this far and tune in 2 weeks for the next episode!
I'll be blogging every other friday (or saturday).  If you have a fun
problem you want to solve using python, tweet it to me
[@whitmo](https://twitter.com/whitmo) and maybe I'll a crack at it. If
you have a great (or awesomely horrible) hack, send me a gist and
maybe I'll write about it. If you want to hack with other, contact me
or [@firas](https://twitter.com/firas) about Nashdiggity Hacknight(not
limited to hacking computers).
