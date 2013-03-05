---
layout: post
title: Timing and Profiling in IPython
author: Scot Clausing
comments: true
---

Timing and profiling code is all sorts of useful, and it's also just good ol' fashioned fun (and sometimes surprising!).
In this post, I'll introduce how to do the following through IPython's magic functions:

* `%time` & `%timeit`: See how long a script takes to run (one time, or averaged over a bunch of runs).
* `%prun`: See how long it took each function in a script to run.
* `%lprun`: See how long it took each line in a function to run.
* `%mprun` & `%memit`: See how much memory a script uses (one time, or averaged over a bunch of runs).

Installation & Setup
===

Please make sure you're running IPython 0.11 or greater to follow along. This post was authored against Python 2.7 and
IPython 0.13.1.

    $ pip install ipython
    $ ipython --version
    0.13.1

Most of the functionality we'll work with at is part of the standard library, but if you're interested in line-by-line
profiling or memory profiling, go ahead and run through this setup. First, install the following:

    $ pip install line-profiler
    $ pip install memory_profiler
    $ pip install psutil

Next, create an IPython profile and extensions directory where we'll configure a couple of missing magic functions:

    $ ipython profile create
    [ProfileCreate] Generating default config file: u'/Users/tsclausing/.ipython/profile_default/ipython_config.py'

    $ mkdir ~/.ipython/extensions/

Create the following IPython extention files with the contents below to define the magic functions:

`~/.ipython/extensions/line_profiler_ext.py`

    import line_profiler

    def load_ipython_extension(ip):
        ip.define_magic('lprun', line_profiler.magic_lprun)

`~/.ipython/extensions/memory_profiler_ext.py`

    import memory_profiler

    def load_ipython_extension(ip):
        ip.define_magic('memit', memory_profiler.magic_memit)
        ip.define_magic('mprun', memory_profiler.magic_mprun)

Finally, register the extension modules you just created with the default IPython profile we made earlier:

Edit `~/.ipython/profile_default/ipython_config.py`, search for, **uncomment**, and modify these lists to include:

    c.TerminalIPythonApp.extensions = [
        'line_profiler_ext',
        'memory_profiler_ext',
    ]
    c.InteractiveShellApp.extensions = [
        'line_profiler_ext',
        'memory_profiler_ext',
    ]

And that's it! We're ready to time and profile to our hearts content. Start `ipython` and test for the following:

    $ ipython
    Python 2.7.2 (default, Jun 20 2012, 16:23:33)
    Type "copyright", "credits" or "license" for more information.

    IPython 0.13.1 -- An enhanced Interactive Python.
    ?         -> Introduction and overview of IPython's features.
    %quickref -> Quick reference.
    help      -> Python's own help system.
    object?   -> Details about 'object', use 'object??' for extra details.

    In [1]: %time?

    In [2]: %timeit?

    In [3]: %prun?

    In [4]: %lprun?

    In [5]: %mprun?

    In [6]: %memit?

    In [7]: from time import sleep  # <- will be used in the time profiling examples

Time Profiling
===

Time profiling does exactly what it sounds like - it tells you how much time it took to execute a script, which may be
a simple one-liner or a whole module.

%time
---

See how long it takes a script to run.

    In [8]: %time {1 for i in xrange(10*1000000)}
    CPU times: user 0.72 s, sys: 0.16 s, total: 0.88 s
    Wall time: 0.75 s

%timeit
---

See how long a script takes to run averaged over a bunch of runs.

    In [9]: %timeit 10*1000000
    10000000 loops, best of 3: 38.2 ns per loop

Notice that by default `%timeit` runs your code millions of times before returning. Timing long running scripts this way
may leave you waiting forever. In this case, either use `%time` instead, or limit the number of loops with `-n 1000` for
example which will limit `%timeit` to a thousand iterations, like this:

    In [9]: %timeit -n 1000 10*1000000
    1000 loops, best of 3: 67 ns per loop

Also note that the run-time reported will vary more wildly when limited to fewer loops.

%prun
---

See how long it took each function in a script to run.

    In [10]: def foo(): sleep(1)

    In [11]: def bar(): sleep(2)

    In [12]: def baz(): foo(), bar()

    In [13]: %prun baz()
    7 function calls in 3.001 seconds

    Ordered by: internal time

    ncalls  tottime  percall  cumtime  percall filename:lineno(function)
         2    3.001    1.500    3.001    1.500 {time.sleep}
         1    0.000    0.000    3.001    3.001 <ipython-input-17-c32ce4852c7d>:1(baz)
         1    0.000    0.000    2.000    2.000 <ipython-input-11-2689ca7390dc>:1(bar)
         1    0.000    0.000    1.001    1.001 <ipython-input-10-e11af1cc2c91>:1(foo)
         1    0.000    0.000    3.001    3.001 <string>:1(<module>)
         1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}


%lprun
---
See how long it took each line in a function to run.

Create and edit a new module named `foo.py` in the same directory where you started IPython. Paste the following code
in the file and jump back to IPython.

    def foo(x):
        x + 10
        x**2
        [x for x in xrange(x)]
        list(x for x in xrange(x))
        tuple(x for x in xrange(x))

Import the function and profile it line by line with `%lprun`. Functions to profile this way must be passed by name with
`-f`.

    In [14]: from foo import foo

    In [15]: %lprun -f foo foo(10)
    Timer unit: 1e-06 s

    File: /Users/tsclausing/foo.py
    Function: foo at line 1
    Total time: 6.7e-05 s

    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
         1                                           def foo(x):
         2         1            4      4.0      6.0      x + 10
         3         1            3      3.0      4.5      x**2
         4        11           27      2.5     40.3      [x for x in xrange(x)]
         5         1           17     17.0     25.4      list(x for x in xrange(x))
         6         1           16     16.0     23.9      tuple(x for x in xrange(x))

Memory Profiling
===

* `%mprun`: See how much memory a script uses line by line.

* `%memit`: See how much memory a script uses overall.

Read:
===

* Help for each function, by running `%magicfunctionname?` as we did after the setup steps above.
* [Profiling Python Code](http://scikit-learn.org/dev/developers/performance.html#profiling-python-code)
* [Chapter 3 of Python Data Analysis](http://www.amazon.com/Python-Data-Analysis-Wes-McKinney/dp/1449319793)
