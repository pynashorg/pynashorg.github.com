---
layout: post
title: Introductions to Hybrid Properties in SQLAlchemy
author: Jason Myers
comments: true
---

Many times when building applications, it would be nice to have our models 
return back already computed data.  This is especially handy if a subquery 
is required to get that value.  Let's start by using the same setup we did 
in last weeks [article](http://pynash.org/2013/02/15/using-sqlalchemy-func-and-group.html).

    pip install sqlalchemy
    pip install pysqlite

    from sqlalchemy import create_engine
    engine = create_engine('sqlite:///:memory', echo=True)
    from sqlalchemy.ext.declarative import declarative_base

So here is where we need to import the hybrid_property from the SQLAlchemy 
[hybrid](http://docs.sqlalchemy.org/en/rel_0_8/orm/extensions/hybrid.html?highlight=hybrid%20properties) 
extension.  This is included by default when a pip install is done.  This 
extension does far more than I'm showing here, and is a great way to move 
more logic into your models.
    
    from sqlalchemy.ext.hybrid import hybrid_property

Let's continue with the rest of the basics and setup our model.

    Base = declarative_base()
    from sqlalchemy import Column, Integer, String, Float
    class Order(Base):
        __tablename__ = 'orders'
        order_id = Column(Integer, primary_key=True)
        order_reference_code = Column(String)
        merchandise_cost = Column(Float)
        tax = Column(Float)
        shipping = Column(Float)
        
        def __init__(self, order_reference_code, merchandise_cost, tax, shipping):
            self.order_reference_code = order_reference_code
            self.merchandise_cost = merchandise_cost
            self.tax = tax
            self.shipping = shipping
     
Now we're ready to define our hybrid property.  In this example, I want the 
property to return a grand total of the cost components in the order.
            
        @hybrid_property
        def grand_total(self):
            rollup_fields = [
            'merchandise_cost',
            'tax',
            'shipping',
            ]
            
            total = sum([self.__getattribute__(x) for x in rollup_fields])
            return round(total, 2)
    
Once we've defined our hybrid property, let's create the database and play 
with it a bit.
            
    Base.metadata.create_all(engine)
    
    order1 = Order('ABC', 57.50, 11.75, 6.00)
    order2 = Order('BCD', 21.42, 4.72, 3.00)
    order3 = Order('CDE', 1000.50, 80.34, 0.00)
    order4 = Order('DEF', 500.50, 45.34, 100.00)
    
We've got some test data setup so let's make a database session, 
and add our data to the database.
    
    from sqlalchemy.orm import sessionmaker
    Session = sessionmaker(bind=engine)
    db = Session()
    
    db.add(order1)
    db.add(order1)
    db.add(order1)
    db.add(order1)
    db.commit()
     
Okay finally, let's use our hybrid property in a simple query. 
Noticed that the property name defined above is exactly how I 
access that data.   
    
    for order in db.query(Order).all():
        print order.order_reference_code, order.grand_total

Here is our result.

    ABC 75.25
    BCD 29.14
    CDE 1080.84
    DEF 645.84


A full gist of the code is available [here](https://gist.github.com/jasonamyers/5064720).
