---
layout: post
title: Introduction to Func and Group with SQLAlchemy
author: Jason Myers
comments: true
---

##Introduction to Func and Group with SQLAlchemy

[SQLAchemy](http://www.sqlalchemy.org/) is a powerful ORM for python, and is 
quite common in the Flask and Pyramid communities.  I'm going to use an in 
memory database just to play with, and to connect it we use create_engine
supplied by SQLAlchemy
    >>> from sqlalchemy import create_engine
    >>> engine = create_engine('sqlite:///:memory:', echo=True)

Next I'm going to use a Declarative which is a set of directives that create
classes and define tables relative to that class.  We use a base class which
has a listing of all the classes and tables and is called a declarative base.

    >>> from sqlalchemy.ext.declarative import declarative_base
    >>> Base = declarative_base()

Now lets look at the model we're going to play with. We'll be pulling in some
class from SQLAlchemy that represent the components and datatypes of our tables.
    >>> from sqlalchemy import Column, Integer, String, Float
    >>> class User(Base): 
    ...     __tablename__ = 'users'   
    ...     id = Column(Integer, primary_key=True)
    ...     name = Column(String)
    ...     fullname = Column(String)
    ...     balance = Column(Float)
    ...     group = Column(String)
    ...     def __init__(self, name, fullname, balance, group):
    ...             self.name = name
    ...             self.fullname = fullname
    ...             self.balance = balance
    ...             self.group = group

Now let's have the declarative base use the engine to build our table.
    >>> Base.metadata.create_all(engine)

Okay now that we have a Model and a table and they are connected, we can add
some data.  
    >>> user1 = User('Bob', 'Big Bob', 1000000.00, 'Mob')
    >>> user2 = User('Linda', 'Linda Lu', 100.50, 'Diner')
    >>> user3 = User('Lil Bob', 'Bobby Jr', 100500.00, 'Mob')
    >>> user4 = User('Rachael', 'Rachael Rach', 125.50, 'Personal')

Next we want to save this data, and we need a session to do that.  We import the 
sessionmaker and bind it to our engine.  Next we create an instance of the 
session that we can use.

>>> from sqlalchemy.orm import sessionmaker
>>> Session = sessionmaker(bind=engine)
>>> db = Session()

Now let's add our users to the sessions and commit/save them to the database.
    >>> db.add(user1)
    >>> db.add(user2)
    >>> db.add(user3)
    >>> db.add(user4)
    >>> db.commit()

Okay finally we can do some querying and play with grouping. To get all the user 
objects we could just do the following:
    >>> db.query(User).all()

We can iterate though them and display useful data by doing.
    >>> for user in db.query(User).all():
    ...     print user.name, user.balance

But what is we wanted a total of the balance by Group the user is in?

