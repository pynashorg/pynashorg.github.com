---
layout: post
title: Comprehensions and Generators
author: Scot Clausing
comments: true
---

list comprehension
    with conditional
set comprehension
    ** look up frozenset
dictionary comprehension
    enumerate()
generator comprehension/expression
    with conditional
nested comprehensions
comprehension scope [You should use map and filter instead of list comprehensions.](http://stackoverflow.com/a/13483314)
    introduces variable(s) into local scope
    do not use as shorthand for a loop
passing generator expressions to functions:
    tuple from generator expression
    to custom function


List Comprehension
---

The Pythonic way to create simple lists is with list comprehensions:

    >>> [char for char in 'hello']
    ['h', 'e', 'l', 'l', 'o']

    >>> [char for char in 'hello' if char not in 'oh']
    ['e', 'l', 'l']

Set Comprehension
---

The Pythonic way to create simple sets is with set comprehensions:

    >>> {char for char in 'hello'}
    set(['h', 'e', 'l', 'o'])

    >>> set('hello')
    set(['h', 'e', 'l', 'o'])

    >>> {char for char in 'hello' if char not in 'oh'}
    set(['e', 'l'])

Dictionary Comprehension
---

The Pythonic way to create simple dictionaries is with dictionary comprehensions:

    >>> {index: char for index, char in enumerate('hello')}
    {0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o'}

    >>> {index: char for index, char in enumerate('hello') if char not in 'oh'}
    {1: 'e', 2: 'l', 3: 'l'}

Generators
---

Generators are all about lazy evaluation.

    >>> chars = (char for char in 'hello')
    >>> chars
    <generator object <genexpr> at 0x...>

    >>> next(chars)
    'h'

    >>> ''.join(chars)
    'ello'

    >>> next(chars)
    Traceback (most recent call last):
        ...
    StopIteration

    >>> next(chars, 'default')
    'default'
