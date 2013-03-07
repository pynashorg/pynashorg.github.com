---
layout: post
title: Comprehensions and Generators
author: Scot Clausing
comments: true
---

Comprehensions are easy ways to build new lists, sets, and dicts. Generators are an easy way to make lazy iterators.
I'll be discussing both because the syntax is so similar (at first). The examples below all follow the same basic
formula of `expression for item in iterator [if test]` wrapped in `[]`, `{}`, and finally `()`. In the end, we'll
discuss `yield`, but we're getting ahead of ourselves already.

This is not a discussion on *what* an iterator, comprehension, or generator *is* - it's a quickstart to recognizing and
using them.

List Comprehension with "\[]"
---

Create simple lists is with list comprehensions:

    >>> [char for char in 'hello']
    ['h', 'e', 'l', 'l', 'o']

    >>> [char for char in 'hello' if char not in 'oh']
    ['e', 'l', 'l']

Set Comprehension with "{}"
---

Create simple sets is with set comprehensions:

    >>> {char for char in 'hello'}
    set(['h', 'e', 'l', 'o'])

    >>> {char for char in 'hello' if char not in 'oh'}
    set(['e', 'l'])

Dictionary Comprehension with "{}"
---

Create simple dictionaries is with dictionary comprehensions:

    >>> {i: char for i, char in enumerate('hello')}
    {0: 'h', 1: 'e', 2: 'l', 3: 'l', 4: 'o'}

    >>> {i: char for i, char in enumerate('hello') if char not in 'oh'}
    {1: 'e', 2: 'l', 3: 'l'}

Dictionary comprehensions diverge from the others because of the need to specify a `key: value` pair. The iterator
shoud provide items that can unpack into two variables (the key and value), like:

    >>> for pair in [('key','value'), ('key2','value2')]:
    ...     key, value = pair  # <- unpacking going on here!
    ...     print('%s: %s' % (key, value))
    key: value
    key2: value2

So, what was `enumerate('hello')` all about?

    >>> enumerate('hello')
    <enumerate at 0x...>

Run `help(enumerate)` and read the description. Here's the important part: "The enumerate object yields pairs ..." When
we're talking about yielding values, we're talking about generators ... (Well, I mean, here we're actually talking about
iterators, but we're getting to generators - I promise!)

    >>> import inspect
    >>> inspect.isgenerator(enumerate(''))
    False

Run `help(inspect.isgenerator)` for hints on what makes a generator more than just an iterator. And make sure to read up
on `send()`, which we won't cover in this post, if you want to be a total generator hipster.

* Read: [Generators are iterators, iterators aren't necessarily generators.](http://stackoverflow.com/questions/2776829/difference-between-python-generators-vs-iterators)

Generator Expressions with "()"
---

Here we go. Generators are all about being lazy.

    >>> chars = (char for char in 'hello')
    >>> chars
    <generator object <genexpr> at 0x...>

    >>> import inspect
    >>> inspect.isgenerator(chars)
    True

Instead of immediately operating over each item in `'hello'`, we got back a generator object. Generator objects are
iterators, and each iteration yields the next value until there are no more values to yield!

    >>> next(chars)
    'h'
    >>> chars.next()
    'e'
    >>> ''.join(chars)
    'llo'

    # did you know next could take a default value?
    >>> next(chars, 'default')
    'default'

* For info on slicing and dicing iterators, look at the "i" prefixed functions in [`itertools`](http://docs.python.org/2/library/itertools.html).

OK. Let's go all the way back to our first example `[char for char in 'hello']` and pretend we actually want to end up with
upper case letters ...

List Comprehension:

    >>> [char.upper() for char in 'hello']
    ['H', 'E', 'L', 'L', 'O']

Generator:

    (char.upper() for char in 'hello')
    <generator object <genexpr> at 0x...>

The benefit of the generator is that there's no need to operate over every value and build a list. Instead, we just get
the values we want from the generator without the overhead. This is generally preferable, especially when dealing with
lots of items.

Yielding values
---

Everything we've looked at so far fits nicely into a single line with a single expression and maybe a condition. But,
life isn't always that simple. Fortunately, building complex generators *is* simple - as simple as defining a function using
`yield` instead of `return`.

Let's start slow, because most resources online dive in without any good intuition up-front:

    >>> def fib():
    ...     yield 1
    ...     yield 1
    ...     yield 2
    ...     yield 3
    ...     yield 5

    >>> fib_values = fib()
    >>> fib_values
    <generator object fib at 0x...>

    >>> next(fib_values), next(fib_values), next(fib_values)
    (1, 1, 2)

    >>> for value in fib_values: print(value)
    3
    5

    >>> import inspect
    >>> inspect.isgeneratorfunction(fib)
    True

Hopefully this gives you an intuition for two things:

* `yield` in a function instead of `return` creates a generator function which returns a generator object.
* `yield` essentially pauses execution in a generator function and returns some value at that point.

Knowing that, let's work on our `fib()` generator a bit ...

    >>> def fib(n):
    ...     """ Generate the first `n` fibonacci numbers """
    ...     a, b = 0, 1
    ...     for n in xrange(n):
    ...         a, b = b, a + b
    ...         yield a

    >>> tuple(fib(20))
    (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765)

Check it out:

* We're limiting the number of iterations to `n`, but removing this limitation could create a generator that yields values forever!
* We passed a generator object to `tuple()` and got back a tuple of each fib value! (Just don't combine this revelation with the previous point or you'll be waiting a long time.)

Tuple Comprehension?
---

Not really, but passing a generator expression to `tuple()` is elegant way to create a tuple (even though it appears
that evaluating a list comprehension to pass to `tuple()` may perform faster in some cases - like this one).

    >>> tuple(char for char in 'hello')
    ('h', 'e', 'l', 'l', 'o')

In this case, `tuple([char for char in 'hello'])` runs almost 30% faster. Oh well. As you see above, you don't even need
the enclosing `()` around the generator expression if the generator is the only argument to the function. It's pretty.

Here's some stuff to keep in mind
===

Scopes
---

Comprehensions run in the local scope. This means that the name(s) you create in the comprehension must not collide
with a name in your local scope or your the value bound to your local name will be overwritten.

    >>> char = 'x'
    >>> chars = [char for char in 'hello']
    >>> char
    'o'

This issue has been addressed in Python 3. Link below.

Since comprehensions run in the local scope, you may be tempted to use them as a shorthand for a loop. Don't do this.
It's confusing and annoying. Use list comprehensions to make lists.

    >>> def foo(bar):
    ...     # do stuff
    ...     print(bar)

    >>> [foo(bar) for bar in range(3)]  # <- throwing this away. just wanted to run foo().
    0
    1
    2
    [None, None, None]

Nesting
---

Comprehensions are just expressions, and they can be nested like anything else. But don't do it. If you're not doing
something simple, go ahead and write the equivalent loop:

    >>> [sum(t) for t in [[(x+y)**2 for y in range(3)] for x in range(3)]]
    [5, 14, 29]

    # ... vs ...

    >>> tripples = []
    >>> for x in range(3):
    ...     tripples.append([(x+y)**2 for y in range(3)])
    >>> map(sum, tripples)
    [5, 14, 29]

Yes, it's four lines of code vs one, but it's a world of difference to follow along.

Python 3
---

Iterators are favored in Python 3, so it's good to get used to them now. Functions like `range`, `map`, and `zip` will
return iterators instead of requiring the use of `xrange` and `itertools` `.imap` and `.izip`.

* Generator Delegation: [`yield from`](http://docs.python.org/3.3/whatsnew/3.3.html#pep-380) is awesome.
* Scope issue fixed: ['... the comprehension is executed in a separate scope, so names assigned to in the target list don’t “leak”'](http://docs.python.org/3/reference/expressions.html#displays-for-lists-sets-and-dictionaries)

That's it
===

Hopefully that was a valuable, quick intro to Comprehensions and Generators. If you're interested in a deeper knowledge
about the inner workings of iterators and generators, I'd recommend starting here:

* [Iterators](http://docs.python.org/2/tutorial/classes.html#iterators)
* [Generators](http://docs.python.org/2/tutorial/classes.html#generators)
* [The yield expression](http://docs.python.org/2/reference/expressions.html#yieldexpr)
* [Generator-Iterator Methods](http://docs.python.org/2/reference/expressions.html#generator-iterator-methods)
