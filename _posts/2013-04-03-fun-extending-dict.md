---
layout: post
title: Fun Extending Dict
author: Scot Clausing
comments: true
---

I've been [curious](http://stackoverflow.com/questions/1452995/why-doesnt-a-python-dict-update-return-the-object) about
and [disappointed](http://stackoverflow.com/questions/5352546/best-way-to-extract-subset-of-key-value-pairs-from-python-dictionary-object)
with the limited ability to update, combine, split, and otherwise have my way with the built-in Python `dict`, so I set
out to have some fun and try to enhance the `dict` object.

Have a look at `builtout`:
[builtout/dictb.py](https://github.com/tsclausing/builtout/blob/master/src/builtout/dictb.py).

    >>> from builtout import dictb
    >>> map = dictb(a=1, b=2, c=3)

`dictb` is just a `dict` subclass and it behaves pretty much just like any other `dict`:

    >>> map == {'a': 1, 'b': 2, 'c': 3}
    True

    >>> isinstance(map, dict)
    True

But, there are so many things I *want* to do with `dict` that I can't ...

Getting, Setting & Deleting Multiple Items
---

Items in a `dict` are accessed by passing a key in square brackets like so:

    >>> map['a']
    1

Now, what if I want the values for keys `'a'` *and* `'c'`? Just pass a list of keys!

    >>> keys = ['a', 'c']

    >>> tuple( map[keys] )
    (1, 3)
    >>> tuple( map[keys + keys] )
    (1, 3, 1, 3)

That's awesome! Instances of `list` are not hashable, so they fail for use as `dict` keys which gives us the opportunity
to use them for another purpose here.

But, actually, I want a subset of `map` containing only those keys (not just the values). Just pass a `set` of keys!

    >>> map[set(keys)] == {'a': 1, 'c': 3}
    True

And what about the subset of `map` minus those keys?

    >>> map - keys == {'b': 2}
    True

So, you can get multiple values from, or a subset of, `map` ... what about setting and deleting values and keys?

    >>> map[keys] = 11, 33
    >>> map == {'a': 11, 'b': 2, 'c': 33}
    True

    # or set all keys to the same value
    >>> map[set(keys)] = 0
    >>> map == {'a': 0, 'b': 2, 'c': 0}
    True


Nice. And deleting keys?

    >>> del map[keys]
    >>> map == {'b': 2}
    True

I'm starting to get excited. But this is only the beginning. Moving on ...

Subsetting & Combining Dictionaries
---

Wait. I thought we just saw how to get a subset of `map` up above? Sure, but item access *must* fail if the key is
missing. Remember that `map` is currently just `{'b': 2}`:

    >>> map[keys]
    Traceback (most recent call last):
        ...
    KeyError: ['a', 'c']

Clearly that only works if we know ahead of time that the keys we're requesting are present. But, what if I don't konw?

    >>> map & keys == {}
    True

Ah, that's more like it. How about a logical `or`?

    >>> map | keys == {'a': None, 'b': 2, 'c': None}
    True

Sweet! What happens if we `or` with two maps?

    >>> map = map | {'a': 1, 'b': 'in left map so ignored', 'c': 3}
    >>> map == {'a': 1, 'b': 2, 'c': 3}
    True

Now `map` is back where it started. Let's try the logical `and` again:

    >>> map & keys == {'a': 1, 'c': 3}
    True

That works swimmingly. Let's try `xor`.

    >>> map ^ {'b': 2, 'c': 3, 'd': 4} == {'a': 1, 'd': 4}
    True

If you're not excited at this point, I'm not sure what to tell you. But I'll let you know what I think ...

Thoughts
---

* This is [not a completely original idea](http://code.activestate.com/recipes/577471-setdict/), but it is an original
implementation (afaik). And I believe [Raymond's](https://twitter.com/raymondh) comment on that post is only true for
`dict` keys.

* Subclassing `dict` is an ugly (but simple) way to accomplish this. I might rather have a set of functions which do the
same thing but accept built-in dicts, something like: `xor(map, map2) == {'a': 1, 'd': 4}`.

* Please don't go use `dictb` on production code just yet. I need to write a suite of tests and the implementation will
probably change somewhat. Help (and criticism) welcomed.

What do you think?
