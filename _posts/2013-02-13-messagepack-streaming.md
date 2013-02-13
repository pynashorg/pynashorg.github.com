---
layout: post
title: MessagePack Streaming
author: Scot Clausing
comments: true
---
"It's like JSON. but fast and small." - [MessagePack](http://msgpack.org/)

Stuff to read
---

* tl;dr: [MessagePack Python Quickstart](http://wiki.msgpack.org/display/MSGPACK/QuickStart+for+Python)
* creator: [My thoughts on MessagePack](https://gist.github.com/frsyuki/2908191)

Install msgpack and try it out ...
---

Just `pip install msgpack-python` and follow along while we pack and unpack a tuple!

    >>> import msgpack
    >>> data = ('hello', 11, 2.3)

    >>> packed = msgpack.packb(data)
    >>> packed
    '\x93\xa5hello\x0b\xcb@\x02ffffff'

    >>> msgpack.unpackb(packed)
    ('hello', 11, 2.3)

That's the basics of packing single values with `packb()` and unpacking with `unpackb()`, but what's this about streaming?

Streaming
---

When you're writing or reading lots of individual values, like we're about to do below, use `Packer` to write and `Unpacker` to read a stream of bytes.

    >>> from StringIO import StringIO
    >>> # Streaming works with anything that quacks like a file.
    >>> myfile = StringIO()

    >>> packer = msgpack.Packer()
    >>> for i in range(3):
    ...     myfile.write(packer.pack(data))

We just wrote three messagepacked tuples to `myfile` - [more on StringIO](http://docs.python.org/2/library/stringio.html). Let's get 'em back out!

    >>> myfile = StringIO(myfile.getvalue())

    >>> unpacker = msgpack.Unpacker(myfile)
    >>> for value in unpacker:
    ...     print(value)
    ('hello', 11, 2.3)
    ('hello', 11, 2.3)
    ('hello', 11, 2.3)

Awesome. But we can do even more. What if we don't have all the bytes to unpack in `myfile` yet?

Let's really do streaming
---

Create a little server to unpack streaming messagepack bytes!

    ->> import msgpack
    ->> import socket

    ->> server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    ->> server.bind(('localhost', 9999))
    ->> server.listen(1)
    ->> while True:
    ...     client, address = server.accept()
    ...     while True:

    ...         # feed each sweet, sweet byte into the Unpacker
    ...         unpacker.feed(client.recv(1))

    ...         # unpack whatever we can from the bytes we've received!
    ...         for value in unpacker:
    ...             print(value)

And, here's the client
---

This little guy will send messagepack bytes to our unpacking server.

    ->> import msgpack, socket
    ->> from StringIO import StringIO

    ->> # pack some data to stream to the unpacking server
    ->> myfile = StringIO()
    ->> packer = msgpack.Packer()
    ->> for i in range(10):
    ...     myfile.write(packer.pack(range(3))
    ->> myfile = StringIO(myfile.getvalue())

    # connect to the server
    ->> client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    ->> client.connect(('localhost', 9999))

    # start sending bytes, and watch your server print tuples!
    ->> client.send(myfile.read(1))
    ->> client.send(myfile.read(1))
    ->> client.send(myfile.read(1))
    ->> client.send(myfile.read(1))
    ->> client.send(myfile.read(1))
        ...

If it's working, the server's output should look like this:

    ->> (0, 1, 2)
    ->> (0, 1, 2)
        ...

If it's not working, leave a comment and we'll get it straightened out straight away.

So, there you go. MessagePack streaming. Maybe next Wednesday I'll talk about [Pandas](http://pandas.pydata.org/).

Related Packages
---

Other MessagePack related `pip` installable packages.

* msgpack-rpc-python        - MessagePack RPC
* wzmsgpackrpc              - MessagePack-RPC implementation using Whizzer
* msgpack-pure              - MessagePack (de)serializer written in pure Python.
* tastypie-msgpack          - MsgPack support for Django Tastypie.
* django msgpack serializer - A MsgPack serializer for Django.
* djangorestframework-msgpack - MessagePack support for Django REST framework
* msgpack_numpy             - Numpy data serialization using msgpack

