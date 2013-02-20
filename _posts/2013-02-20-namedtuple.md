---
layout: post
title: Named Tuple
author: Scot Clausing
comments: true
---

I'm on vacation so I picked a short and sweet, but extremely useful topic to write about: [namedtuple](http://docs.python.org/2/library/collections.html#collections.namedtuple)

    >>> from collections import namedtuple
    >>> help(namedtuple) # <- example usage

If you're not familliar with the [collections module](http://docs.python.org/2/library/collections.html), set aside some time to familiarize yourself. It's full of ridiculously useful goodies. Of these, I find myself using `namedtuple` regularly.

Example
---

    >>> Character = namedtuple('Character', 'name home')
    >>> characters = [
    ...     Character('Arthur Dent', home='Earth'),
    ...     Character('Ford Prefect', home='Betelgeuse Seven'),
    ...     Character('Marvin', home='Sirius Cybernetics Corporation'),
    >>> ]
    [Character(name='Arthur Dent', home='Earth'), Character(name='Ford Prefect', home='Betelgeuse Seven'), Character(name='Marvin', home='Sirius Cybernetics Corporation')]

So, what is `Character`? It's a subclass of the built-in `tuple`.

    >>> issubclass(Character, tuple)
    True

Awesome! It's a tuple ... with names!

    >>> for character in characters:
    >>>     print(character.name)
    Arthur Dent
    Ford Prefect
    Marvin

Pros and Cons
---

There are pros and cons to everything, including `namedtuple`. The big pro is that we have a really simple way to write an immutable mapping between names and values. The big con is that we lose pretty much all of the performance benefits of creating normal tuples. I'll try to demonstrate this:

    >>> from timeit import Timer

Creating tuple instance is super fast, but there's no mapping to names:

    >>> Timer('(1,2,3,4,5)').timeit()
    0.054419994354248047

Creating a namedtuple instance in this case takes almost 30 times longer than the built-in tuple:

    >>> Timer('t(1,2,3,4,5)', setup='from collections import namedtuple as nt; t=nt("t", "a b c d e")').timeit()
    1.5577950477600098

So, if you need to create millions of tuples, you should probably just use `tuple`. Otherwise, `namedtuple` is a super handy way to label and access values.

Where the magic happens
---

One of the coolest features of `namedtuple` is the `verbose` argument, which defaults to `False`. Flip that to `True` and see what happens:

    >>> namedtuple('Character', 'name home', verbose=True)
    class Character(tuple):
        'Character(name, home)' 

        __slots__ = () 

        _fields = ('name', 'home') 

        def __new__(cls, name, home):
            return tuple.__new__(cls, (name, home)) 

        @classmethod
        def _make(cls, iterable, new=tuple.__new__, len=len):
            'Make a new Character object from a sequence or iterable'
            result = new(cls, iterable)
            if len(result) != 3:
                raise TypeError('Expected 3 arguments, got %d' % len(result))
            return result 

        def __repr__(self):
            return 'Character(name=%r, home=%r)' % self 

        def _asdict(t):
            'Return a new dict which maps field names to their values'
            return {'name': t[0], 'home': t[1]} 

        def _replace(self, **kwds):
            'Return a new Character object replacing specified fields with new values'
            result = self._make(map(kwds.pop, ('name', 'home'), self))
            if kwds:
                raise ValueError('Got unexpected field names: %r' % kwds.keys())
            return result 

        def __getnewargs__(self):
            return tuple(self) 

        name = property(itemgetter(0))
        home = property(itemgetter(1))

    <class '__main__.Character'>

Which reminds me, I highly recommend watching the following:

* [Stop Writing Classes](http://www.youtube.com/watch?v=o9pEzgHorH0) - PyCon 2012
* [Don't Overuse Objects](http://www.youtube.com/watch?v=mWB3oh1GPdo&t=3m42s) - Guido 2012

Need MOAR?
---

There's plenty of good related stuff here if you need more, like: 

* Immutability: Why `__slots__ = ()`?
* Constructors vs. Initializers: How is `__new__` different from `__init__`?
* Properties: What's going on with `property(itemgetter(0))`?
* `dict` methods with default values: Understand the implementation of ` _replace` with `pop`.  Also, check out dict methods `get` and `setdefault`.

Wait ... default ... dict methods??? 

    >>> from collections import defaultdict

So, go try out `namedtuple` and learn more about [`defaultdict`](http://docs.python.org/2/library/collections.html#collections.defaultdict); two really simple and *incredibly* useful tools in the standard library.
