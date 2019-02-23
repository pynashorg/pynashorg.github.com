---
layout: post
title: Logging Intro
author: Ryan Macy
comments: true
---

# Logging

Few languages come with logging primitives built in, and luckily Python is one of them (you have Vinay Sajip to thank for that)... Our talk today is going to focus on the basic aspects of the logging package and how to interact with it.

##Loggers
The logging package in Python has this really neat concept of *loggers*. Basically the idea here is that you can instantiate many different loggers, with different handlers, filters, formatters, and even have these loggers follow a hierarchy. What's even cooler, is the fact that the logging package keeps a tab on all of these handlers so you can *get* them from anywhere, without any direct imports.


    >>> import logging
    >>> logger = logging.getLogger('myLogger')
    >>> logger.name
    'myLogger'
    >>> logger2 = logging.getLogger('myLogger')
    >>> logger2.name
    'myLogger'


Neat huh? Logging hierarchy is just as simple using the dot notation.


    >>> import logging
    >>> logger = logger.getLogger('myLogger.otherFile')
    >>> logger.name
    'myLogger.otherFile'
    >>> logger.parent.name
    'myLogger'


You can even access the parent logger from the child or the children from the parent.


    >>> import logging
    >>> logger.name
    'myLogger'
    >>> logger.getChild('myLogger').name
    'myLogger.otherFile'


It can get a little more complicated when we talk about log propagation and message rules, so we'll leave that for a later post when we break the logger object down even more. The big question at this point is, "how do I actually log stuff?"; well its super simple! Just call *.log*.


    >>> logger.name
    'myLogger.otherFile'
    >>> logger.log(10, 'logging is really dandy')


Snap, it didn't actually do anything. Well, that's because we didn't specify a *handler* to handle the message; more about that later. Notice how we passed an integer in as the first argument? That is the level. The logging package comes with 5 predefined levels, all with numerical values. You can *setLevel* on loggers, handlers, etc, and they will ignore message that don't meet that threshold appropriately. You can even define your own levels, but that's beyond the scope of this post.


    >>> logger.name
    'myLogger.otherFile'
    >>> logger.setLevel(20)
    >>> logger.level
    20
    >>> logger.log(10, 'This will be ignored')


Again, it gets more involved when you have a hierarchy of loggers.


    >>> logger.name
    'myLogger'
    >>> logger.setLevel(30)
    >>> logger2.name
    'myLogger.otherFile'
    >>> logger2.getEffectiveLevel()
    30


You can also check to see if a level is enabled for a logger.


    >>> logger.name
    'myLogger.otherFile'
    >>> logger.isEnabledFor(10)
    True


Here's a list of the various levels.

* Debug (Level 10)
* Info (Level 20)
* Warning (Level 30)
* Error (Level 40)
* Critical (Level 50)
* Exception (special, has an Error level of 30)

I'm sure you noticed "Exception", this is a special level you can call in a try, except block. It has the same level of ERROR and will only log when an exception is thrown. I believe the main purpose of this level is to be more succulent and readable.

You can also use more readable level names from the logging package.


    >>> logging.DEBUG
    10


Finally there are some methods that automatically pass in the correct level and make the whole *log* process even more readable.


    >>> logger.debug('Holla!')


We are going to leave the logger object at that!


##Handlers

Handlers are incredibly important to a logger. They direct the logged messages to output at the appropriate places! Output can be anywhere, email, stdout, logs, etc, and the logging package conveniently provides a few predefined handlers for your use! You can even roll your own handler!

* StreamHandler
* FileHandler
* NullHandler
* WatchedFileHandler
* RotatingFileHandler
* TimedRotatingFileHandler
* SocketHandler
* DatagramHandler
* SysLogHandler
* NTEventLogHandler
* SMTPHandler
* MemoryHandler
* HTTPHandler

I could write a book about these different handlers, and the tasks they perform, but instead I'd suggest you look [here](http://docs.python.org/2/library/logging.handlers.html#module-logging.handlers) if you have any questions.


    >>> import logging, sys
    >>> logger = logging.getLogger('myLogger')
    >>> handler = logging.StreamHandler(sys.stdout)


We've created a StreamHandler, that'll output its messages to stdout, and we've got a logger object!


    >>> logger.addHandler(handler)
    >>> logger.handlers
    [<logging.StreamHandler object at 0x105f4bc90>]


Cool! We also added our handler to the logger. You can set Filters, and Levels on the handler.


    >>> handler.setLevel(30)
    >>> handler.level
    30


I'm jumping ahead of myself a little, but you can also add a formatter to a handler. It's common to format an email differently than you would for log output.


    >>> handler.setFormatter(Formatter('''
    ...    ---------------------------------------------------------------------------
    ...    %(asctime)s %(levelname)s: %(message)s IN %(pathname)s:%(lineno)d
    ...    ---------------------------------------------------------------------------'''))


##Filters
Filters are generally subclassed *Filter* objects. Out of the box they allow for the filtering of messages based on level. Filters function slightly different depending on the object they are applied to (handlers vs loggers). When applied to a Handler, they filter records on emits. When applied to a Logger, they filter the message entirely.

When subclassing you'll want to modify the *filter* method. That is where you'll inject logic to determine if a record should be filtered or not.

Subclassing Filter isn't necessarily required, taken from the docs; "You don’t actually need to subclass Filter: you can pass any instance which has a filter method with the same semantics".

I'm not going into too much detail here. Checkout [Filters](http://docs.python.org/2/library/logging.html#filter-objects), if you want more information.

##Formatters
Formatters are dead simple. They take the message data and interpolate it into a format string.

Formatters take two optional arguments, a format string (as previously mentioned), and a datetime format.


    >>> import logging
    >>> format = logging.Formatter('''
    ...    ---------------------------------------------------------------------------
    ...    %(asctime)s %(levelname)s: %(message)s IN %(pathname)s:%(lineno)d
    ...    ---------------------------------------------------------------------------'''))


You can get a list of the formatter/record variables [here](http://docs.python.org/2/library/logging.html#logrecord-attributes).

##More?
The Python documentation on logging really is great.

I completely suggest you checkout the following portions:

* http://docs.python.org/2/library/logging.html
* http://docs.python.org/2/howto/logging.html#logging-basic-tutorial
* http://docs.python.org/2/howto/logging.html#logging-advanced-tutorial
* http://docs.python.org/2/howto/logging-cookbook.html#logging-cookbook
