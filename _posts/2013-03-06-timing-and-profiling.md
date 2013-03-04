---
layout: post
title: Timing and Profiling
author: Scot Clausing
comments: true
---

Timing and profiling code is all sorts of useful, but it's also just good ol' fashioned fun (and sometimes surprising!).
In this post we'll look at how to:

* See how long a script takes to run (one time, or averaged over a bunch of runs).
* See how long it took each function in a script to run.
* See how long it took each line in a function to run.

And for each section, we'll look at IPython's magic functions `%time`, `%timeit`, `%prun`, and `%lprun`.

Read:

* [Profiling Python Code](http://scikit-learn.org/dev/developers/performance.html#profiling-python-code)
