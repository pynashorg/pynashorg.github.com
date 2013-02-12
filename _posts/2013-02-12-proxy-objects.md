---
layout: post
title: Proxy objects in Flask (and elsewhere)
author: Jason Orendorff
comments: true
---

> &ldquo;You can almost never go wrong keeping things as simple as possible.&rdquo;
> &mdash;David Beazley

Here's a complete [Flask](http://flask.pocoo.org/) app:

    from flask import Flask, request
    app = Flask(__name__)

    @app.route('/')
    def hi():
        return "hello, " + request.args.get('name', 'friend')

    app.run()

On the first line, we import a
[`request` object](http://flask.pocoo.org/docs/api/#incoming-request-data).

This will be familiar
if you&rsquo;ve written a web app in the past 15 years.
`request` contains the current HTTP request, the one you're responding to.
Form values, headers, uploads, cookies, all that stuff.


## `request` is secretly a squid-headed monster

Yet there is something funny about `request`.
Flask doesn&rsquo;t provide it as an argument to `hi()`.
Instead it&rsquo;s something you import&mdash;into
many Python modules, if you like&mdash;and that object,
the same object, always contains information for the current request.

Think that over for a second. Many requests, one `request` object.

How do you think this works with threads?
What if there&rsquo;s more than one request being handled at a time?
What is the value of `request`?

The answer is that `request` itself is not really a Request object
but rather something special called a **proxy**.
Any time you do anything to `request`,
such as getting `request.args`,
the `request` proxy forwards that operation to the real Request object
*for the current request on the current thread.*

The code for this is in
[the werkzeug.local module](https://github.com/mitsuhiko/werkzeug/blob/4da862507ff318caf31660ef0936a450da731f1e/werkzeug/local.py#L248)
which is part of [werkzeug](http://werkzeug.pocoo.org/),
which is part of Flask.


## How to build your own squid-headed monster

<figure>
  <img src="/images/blog-content/lego-monster.jpg">
  <figcaption>&hellip;because why wouldn&rsquo;t you want to create your very own?</figcaption>
</figure>

The simplest possible proxy is like this:

    thing = "hi"
    
    class ThingProxy(object):
        def __getattribute__(self, name):
            return getattr(thing, name)
    
    proxy = ThingProxy()

If we paste this into Python, we can do things like:

    >>> proxy.upper()
    'HI'

Methods we call on `proxy` are forwarded to `thing`
by way of the `__getattribute__` magic method.

If we change `thing`, of course `proxy`&rsquo;s behavior changes too:

    >>> thing = [1, 2, 3]
    >>> proxy.pop()
    3

However, you can still tell that `proxy` is a proxy:

    >>> proxy
    <__main__.ThingProxy object at 0x10a0bd790>

If we wanted to make our `proxy` look and feel even more like the real `thing`,
we can just add a few more magic methods.

    class ThingProxy(object):
        def __getattribute__(self, name):
            return getattr(thing, name)
        def __repr__(self):                   # the magic method for displaying the object
            return repr(thing)
        def __add__(self, other):             # the magic method for addition
            return thing + other

    proxy = ThingProxy()

    >>> thing = "hi"
    >>> proxy
    'hi'
    >>> proxy + " everybody"
    'hi everybody'

As you can see if you
[look at the source](https://github.com/mitsuhiko/werkzeug/blob/4da862507ff318caf31660ef0936a450da731f1e/werkzeug/local.py#L248),
werkzeug&rsquo;s `LocalProxy` objects work just the same way.
Of course instead of referring to a single global variable `thing`,
a `LocalProxy` consults a data structure (called a `LocalStack`)
that stores one current request per thread.
Flask keeps the `LocalStack` up to date as requests come in;
so `request` always delegates all operations
to the current request object for the current thread.

The other difference is that `LocalProxy` implements far more
of Python&rsquo;s magic methods&mdash;about 50 in all.


## Squid-headed monsters can be bad

Proxies are interesting, and you can do some amazing things with them.
But most of the time they&rsquo;re a bad idea.

They make it harder to understand your code, for several reasons.

First of all, they&rsquo;re mostly invisible.
The whole point of a proxy is to look and behave just like the target object,
*except* when you want it to do something different.
Like how the `request` proxy is supposed to behave exactly like a Request...
until the next request comes along.

This is inherently a somewhat schizophrenic thing for an object to be doing.

<figure>
  <img src="/images/blog-content/cthulhu-doctor.jpg">
  <figcaption>just a friendly <code>Doctor</code> object</figcaption>
</figure>

When something goes wrong,
if a proxy is involved, very often you don&rsquo;t know it at first.
And it can be very frustrating trying to figure out what&rsquo;s happening.
Even basic debugging functionality
like `print obj` or `obj.__class__`
will lie to you, betraying no hint that the proxy is there!

<figure>
  <img src="/images/blog-content/nobody-expects.jpg">
  <figcaption>like the Spanish Inquisition, nooooooobody expects a proxy</figcaption>
</figure>

Second, when you&rsquo;re reading source code, proxies are a brick wall.
For example, here&rsquo;s
[the line of code in Flask](https://github.com/mitsuhiko/flask/blob/master/flask/globals.py#L42)
that defines `request`:

    request = LocalProxy(partial(_lookup_req_object, 'request'))

It&rsquo;s not exactly obvious what is going on here.
It takes some serious detective work to figure out
what kind of object is being proxied.

Third, proxies can change in seemingly impossible ways.
In the example above, we had `proxy` change from a str to a list.
Real strings, of course, can&rsquo;t actually do that.
In Flask, if you set aside a reference to the current request,
in the hopes of looking at it again later,
you may then find that it has mysteriously morphed into a different request,
or it has magically become `None`.

Next week I think I&rsquo;ll try some simple text processing with NLTK. See you then.
