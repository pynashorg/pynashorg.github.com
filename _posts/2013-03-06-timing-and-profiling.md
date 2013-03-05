---
layout: post
title: Timing and Profiling in IPython
author: Scot Clausing
comments: true
---

Timing and profiling code is all sorts of useful, but it's also just good ol' fashioned fun (and sometimes surprising!).
In this post we'll look at how to do the following through IPython's magic functions that make life easier:

* `%time` & `%timeit`: See how long a script takes to run (one time, or averaged over a bunch of runs).
* `%prun`: See how long it took each function in a script to run.
* `%lprun`: See how long it took each line in a function to run.
* `%mprun` & `%memit`: See how much memory a script uses (one time, or averaged over a bunch of runs).

Setup
===

Please make sure you're running IPython 0.11 or greater to follow along.

    $ pip install ipython
    $ ipython --version

Most of the functionality we'll work with at is part of the standard library, but if you're interested in line-by-line
profiling or memory profiling, go ahead and run through this setup:

    $ pip install line-profiler
    $ pip install memory_profiler
    $ pip install psutil

Now, we'll create a profile and configure IPython's magic functions:

    $ ipython profile create
    [ProfileCreate] Generating default config file: u'/Users/tsclausing/.ipython/profile_default/ipython_config.py'

    $ mkdir ~/.ipython/extensions/

Create the following files with the contents below:

* `~/.ipython/extensions/line_profiler_ext.py`

    import line_profiler

    def load_ipython_extension(ip):
        ip.define_magic('lprun', line_profiler.magic_lprun)

* `~/.ipython/extensions/memory_profiler_ext.py`

    import memory_profiler

    def load_ipython_extension(ip):
        ip.define_magic('memit', memory_profiler.magic_memit)
        ip.define_magic('mprun', memory_profiler.magic_mprun)

Register the extension modules you just created with the IPython profile we made earlier:

* Edit `~/.ipython/profile_default/ipython_config.py`, search for, **uncomment**, and modify these lists to include:

    c.TerminalIPythonApp.extensions = [
        'line_profiler_ext',
        'memory_profiler_ext',
    ]
    c.InteractiveShellApp.extensions = [
        'line_profiler_ext',
        'memory_profiler_ext',
    ]

And that's it! We're all set to time and profile to our hearts content. Run `ipython` and make sure there's no errors.

    $ ipython

Read:
===

* [Profiling Python Code](http://scikit-learn.org/dev/developers/performance.html#profiling-python-code)
