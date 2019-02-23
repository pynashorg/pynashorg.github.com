---
layout: post
title: repr and dir for success
author: Ryan Macy
comments: true
---

##你好 (Hello!)
Hi, I'm [Ryan Macy](http://hackery.io) and I'll be sharing knowledge on the PyNash blog every Thursday!

We are going to have a series of concepts throughout our journey together, and we'll start by learning the basics of python debugging.

We'll see posts on logging, useful builtins, pdb, profiling, and more. Please tweet me [@R_Macy](https://twitter.com/R_Macy) if you would like to see a particular topic, or would like me to go more in depth on a topic we've already discussed. Also, unless stated otherwise, my posts are aimed at Python 2.7.x.

Let's begin.

##Learn you a repr() for great good.

The premise is simple. repr is supposed to give a string representation of your python objects which should allow [eval](http://docs.python.org/2/library/functions.html#eval) to recreate it. repr calls the dunder repr method of an object if you've defined it. repr is incredibly helpful when debugging your python programs. It can also be used to pass around stringified objects that can be later recreated with eval, though this is often frowned upon. A good example of this behavior would be a simple job queue, that instead of [pickling](http://docs.python.org/2/library/pickle.html) and storing the object, created a string version that gets stored and ran when its position in the queue is reached. Use caution with eval, as it will execute any valid stringified python statement passed to it.


>Note: Sometimes it's impractical to return a completely perfect representation of the object, try to capture its essence and as always, use your best judgement.


Here's an example:

 	>>> class Hello(object):
	... 	def __init__(self, name):
	... 		self.name = name
	... 	def speak(self):
	... 		print "Hi, %r" % self.name
	... 	def __repr__(self):
	... 		return "Hello(name=%r)" % self.name
	>>> a = Hello("Ryan")
	>>> a.speak()
	Hi, 'Ryan'
	>>> repr(a)
	"Hello(name='Ryan')"
	>>> b = eval(repr(a))
	>>> b.speak()
	Hi, 'Ryan'
	>>> b.name = 'Bob'
	>>> b.speak()
	Hi, 'Bob'
	>>> a.speak()
	Hi, 'Ryan'
	>>>

As you can see our representation allowed eval to return a perfect copy assigned to _b_ of our _a_ object. It's a brand new object created in memory, not a reference to the original _a_ object. We even reassigned one of its attributes!

You may be asking yourself, "What if I don't define repr on my objects?". Python has a default return value for repr that isn't very useful. Python is known for useful and sensible defaults, however, deciding what an appropriate representation of _your_ object is would be quite impractical; the core developers decided to go a different route and return the objects name, type, and memory address.

	>>> class Example(object):
	... 	pass
	>>> repr(Example())
	'<__main__.Example object at 0x107ac77d0>'
	>>>

As you can see it's a good idea to _always_ define repr on your objects, and should be second nature.

repr has other uses besides allowing eval to recreate an object. For instance, when you log actions in your program, it often is helpful to see the object in question.

	>>> log.debug("Created an Name: %r" % Name("Ryan'))
	>>>

Another great use is testing. You may want to assert that the object created matches the object you expect. Remember our _a_ object created earlier? Lets assert that it matches our expectations:

	>>> assert repr(a) == "Hello(name='Ryan')"
	>>>

An interesting aspect of repr is that when you call str(MyClass) on an object that has no str method defined, it will use that object’s repr method if defined -- otherwise the default repr return value will be used.

Refer to the additional reading below and the [docs](http://docs.python.org/2.7) for more in depth information about repr.

##What is a dir()

The dir builtin is quite useful. What dir returns varies… When called without arguments it returns the local scope, or when passed an object, its attributes. It calls the objects dunder dir method, if defined, which allows you to modify its behavior. This comes in handy when you modify the dunder getattr or getattribute methods.

Taken from the docs:

- If the object is a module object, the list contains the names of the module’s attributes.
- If the object is a type or class object, the list contains the names of its attributes, and recursively of the attributes of its bases.
- Otherwise, the list contains the object’s attributes’ names, the names of its class’s attributes, and recursively of the attributes of its class’s base classes.

Using our _a_ object that we defined previously, lets take a look at dir output when passed an object:

	>>> dir(a)
	['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', 'name', 'speak']
	>>>

Or when called without an argument:

	>>> dir()
	['__builtins__', '__doc__', '__name__', '__package__', 'help', 'a', 'b', 'Hello']
	>>>

Or with a function:

	>>> def a():
	... 	pass
	>>> dir(a)
	['__call__', '__class__', '__closure__', '__code__', '__defaults__', '__delattr__', '__dict__', '__doc__', '__format__', '__get__', '__getattribute__', '__globals__', '__hash__', '__init__', '__module__', '__name__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', 'func_closure', 'func_code', 'func_defaults', 'func_dict', 'func_doc', 'func_globals', 'func_name']
	>>>


> Note: dir will alphabetically sort its output.


dir becomes very helpful when you want to inspect a foreign module or object in the repl, but can also be used for introspection. dir is a fairly straight forward builtin and I really recommend spending some time tinkering with it in the python repl.

##Additional Reading
- [repr and str in python (SO)](http://stackoverflow.com/questions/1436703/difference-between-str-and-repr-in-python)
- [repr bultin](http://docs.python.org/2/library/functions.html#repr)
- [repr alternative](http://docs.python.org/2.7/library/repr.html)
- [dir builtin](http://docs.python.org/2/library/functions.html#dir)
- [Python Dictionaries](http://docs.python.org/2/tutorial/datastructures.html#dictionaries)
- [A guide to Python's magic methods](http://www.rafekettler.com/magicmethods.html)

##What now?
For both repr and dir, it is helpful to understand the [type](http://docs.python.org/2/library/functions.html#type) builtin as this will show you the foundation of python objects and their construction.

We'll talk about logging next week! Let me know if you have questions or feedback; If you live in Nashville, I hope to see you at the next PyNash lunch on March 6. We have lunch the first Wednesday of every month. You can find us hanging out in IRC at #pynash on freenode or in our [google group](groups.google.com/group/pynash).




