---
layout: post
title: Introduction to Func and Group with SQLAlchemy
author: Jason Myers
comments: true
---


[SQLAchemy](http://www.sqlalchemy.org/) is a powerful ORM for python, and is 
quite common in the Flask and Pyramid communities.  It is installable via a simple:

    pip install sqlalchemy

I'm going to use an in memory database just to play with, and to connect it we use 
create_engine supplied by SQLAlchemy

    >>> from sqlalchemy import create_engine
    >>> engine = create_engine('sqlite:///:memory:', echo=True)

Next I'm going to use Declarative, which is a set of directives that creates
classes and define tables relative to that class.  We'll use a base class which
has a listing of all the classes and tables and is called a declarative base. 
SQLAlchemy provides one of these ready for use.

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

Next, we want to save this data and to do that safely, we'll need a session.  We 
import the sessionmaker and bind it to our engine.  After that, we create an 
instance of the session that we can use.

    >>> from sqlalchemy.orm import sessionmaker
    >>> Session = sessionmaker(bind=engine)
    >>> db = Session()

Now let's add our users to the sessions and commit/save them to the database.

    >>> db.add(user1)
    >>> db.add(user2)
    >>> db.add(user3)
    >>> db.add(user4)
    >>> db.commit()

Okay finally, we can do some querying and play with grouping. To get all the user 
objects we could just do the following:

    >>> db.query(User).all()

We can iterate though them and display useful data by doing.

    >>> for user in db.query(User).all():
    ...     print user.name, user.balance
    Bob 1000000.0
    Linda 100.5
    Lil Bob 100500.0
    Rachael 125.5

But what if we wanted a total of the balance by Group the user is in?  To do that we
need some more pieces from SQLAlchemy.  Namely, we want to get a func class that will
give us access to math based functions and label to let us label the returned data.

    >>> from sqlalchemy import func
    >>> from sqlalchemy.sql import label

Okay, now we can put this all together to get a list of groups, how many people are 
in the group, and what the groups aggregated balance is.

    >>> db.query(User.group,
    ...     label('members', func.count(User.id)),
    ...     label('total_balance', func.sum(User.balance))).group_by(User.group).all()
    
Remember that all fields you want to return in this type of query must use an aggregation 
function like count or be included in the group_by fields.  The above query returns the 
results below.

    [(u'Diner', 1, 100.5), (u'Mob', 2, 1100500.0), (u'Personal', 1, 125.5)]
    
And of course, we can also save them to a results list and print them out nicer.  Notice how 
we can use the label names we access earlier to access that data.

    >>> results = db.query(User.group,
    ...     label('members', func.count(User.id)),
    ...     label('total_balance', func.sum(User.balance))).group_by(User.group).all()

    >>> for result in results:
    ...     print "%s has %i members with a balance of %d" % (result.group, result.members, result.total_balance)
    ... 
    Diner has 1 members with a balance of 100
    Mob has 2 members with a balance of 1100500
    Personal has 1 members with a balance of 125

The full code from the example is available at this [Gist](https://gist.github.com/jasonamyers/4960262).
