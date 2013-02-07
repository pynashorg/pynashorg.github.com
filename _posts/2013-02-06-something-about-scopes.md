---
layout: post
title: Something about Scopes
author: Scot Clausing
comments: true
---

The following code is tested with Python 2.7.x. Please fill me in on any differences in Python 3.x or earlier versions!

What do you think will happen when `print_foo()` is called below?

    >>> foo = 'foo'

    >>> def print_foo():
    ...     print(foo)
    ...     foo = 'bar'
    ...     print(foo)
    ...

Open up an interpreter and try it out. Unless you already know. In which case, please help me correct any issues in this post.

    >>> print_foo()
    Traceback (most recent call last):
        ...
    UnboundLocalError: local variable 'foo' referenced before assignment

BOOM. And this error is where the journey begins.

Watch and read these:
---------------------

* [Python Epiphanies](http://www.youtube.com/watch?v=Pi9NpxAvYSs) (a PyCon talk, ~2hr)
* [Understanding Python](http://www.youtube.com/watch?v=E_kZDvwofHY) (Google tech talk, ~1hr)
* [Why does Python run faster in a function?](http://stackoverflow.com/questions/11241523/why-does-python-code-run-faster-in-a-function) (StackOverflow question)
* [Python Scopes and Namespaces](http://docs.python.org/2/tutorial/classes.html#python-scopes-and-namespaces)

So, what happened?
------------------

It's tempting to think that the first `print(foo)` will resolve `foo` in the global namespace and that the second, after
`foo = 'bar'`, will resolve to the function's local namespace. Clearly, this isn't the case.

In short, if a name is bound to a value, like `foo = 'bar'`, anywhere within a function, when the function is compiled,
the name `foo` will always be looked up in the function's local scope. This is why the first `print(foo)` fails: it's
trying to look up foo in print_foo's local scope, but foo isn't assigned until the next line.

So, what to do about it?
------------------------

Well, you could do something like ...

    >>> def print_foo():
    ...     print(globals()['foo'])
    ...     foo = 'bar'
    ...     print(foo)
    ...
    >>> print_foo()
    foo
    bar

Which brings up an interesting point. The Python docs state that "all variables found outside of the innermost scope
are read-only" - except that the global namespace is implemented as a dictionary, so you can do this:

    >>> def print_foo():
    ...     foo = 'foo'
    ...     print(foo)
    ...     globals()['foo'] = 'bar'
    ...
    >>> print_foo()
    foo
    >>> print(foo)
    bar

If the global (module) namespace is implemented as a dictionary, what about the function's local namespace?

    >>> def print_foo():
    ...     foo = 'foo'
    ...     print(foo)
    ...
    ...     locals()['foo'] = 'bar'
    ...     print(foo)
    ...
    >>> print_foo()
    foo
    foo

Nope. Inside a function, `locals()` does return a dictionary, but it's only a representation of the namespace.

But, don't. Don't do any of these things, please. We're just having fun here.

Next?
-----

Maybe next Wednesday I'll talk about stuff you can do with `import`.
