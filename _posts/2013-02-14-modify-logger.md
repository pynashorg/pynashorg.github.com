---
layout: post
title: Modify Logger Output
author: Ryan Macy
comments: true
---

I'm a fan of the internal [Python logging module](http://docs.python.org/2.7/library/logging.html) and recently I've run into the need to remove some information from all log output in a system at work, and a custom Handler or a Filter just wouldn't do.

Fortunately it's rather easy to modify the behavior of logging.Logger.

    >>> import logging
    >>> import sys
    >>> class CustomLogger(logging.getLoggerClass()):
    ...     def makeRecord(self, name, level, fn, lno, msg, args, exc_info, func=None, extra=None):
    ...         msg += ' adding stuff'
    ...         return super(CustomLogger, self).makeRecord(name, level, fn, lno, msg, args, exc_info, func=func, extra=extra)
    ... 
    >>> logger = CustomLogger(__name__)
    >>> handler = logging.StreamHandler(sys.stdout)
    >>> logger.addHandler(handler)
    >>> logger.error('Halp')
    Halp adding stuff
    >>>

Notice we subclass from logging.getLoggerClass() as this will return the most recently modified instance of Logger -- otherwise the base Logger class; that's important if you want to allow other libraries, or the framework you may be using, to also modify its behavior.

I'll let this be a teaser. Next post will be a tutorial type post on the logging module in Python -- to warm you up a bit to the concept, posts afterwards will hack up logging in ever useful ways.
