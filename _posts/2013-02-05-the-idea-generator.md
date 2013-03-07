---
layout: post
title: The idea generator
author: Jason Orendorff
comments: true
---

Welcome to the PyNash group blog!
This is a little contest by the Nashville Python user group.
We&rsquo;ll be posting new content daily, Tuesday through Friday,
until one of us breaks.
I&rsquo;m [@jorendorff](https://twitter.com/jorendorff)
and I&rsquo;ll be your host on Tuesdays.

Topics will vary. You&rsquo;ll see bits on the standard library,
third-party packages and frameworks, core language features, clever
hacks, algorithms, style, and so on. The only rule is that every
post will have at least 100 words of text and 4 lines of Python code.

Let&rsquo;s get to it.


## Random ideas

I wrote a talk submission form for a local event recently.
It unhelpfully suggested a random talk idea, just for laughs:

<figure>
  <img src="/images/blog-content/random-idea.png">
</figure>

[Here&rsquo;s the Python code](https://gist.github.com/4659406)
that generates those random ideas.
You can take it for a spin pretty easily:

    $ wget https://gist.github.com/raw/4659406
    2013-01-28 15:46:29 (15.4 MB/s) - “ideagen.py” saved [1260]
    $ python
    >>> import ideagen
    >>> ideagen.random_idea()
    'Audio and Autotune'
    >>> ideagen.random_idea()
    'How to use git to make an amazing mess'
    >>> ideagen.random_idea()
    'Bootstrap in 140 characters'

Let&rsquo;s see how it works inside.
As usual, if you understand the data, the code is obvious.

## The data

First, there&rsquo;s a constant global dictionary.
This dictionary completely describes the form
of every talk topic that the idea generator can generate.
(This sort of thing is called a *grammar*.)

You can of course [see the full thing](https://gist.github.com/4659406),
but here I&rsquo;ll trim it down a bit:

    productions = {
        'tech': [
            'HTML5',
            'Audio',
            'CoffeeScript',
            ...
        ],
        ...
        'talk': [
            '${tech} for ${person}',
            '${tech} + ${tech} = awesome',
            '${tech} with ${other}',
            ...
        ]
    }

How will our program use this data?
It&rsquo;ll start by picking a random entry from the `'talk'` list.
Suppose it picks `'${tech} with ${other}'`.
Next, it will replace `'${tech}'` with an item from the `'tech'` list,
and '`${other}'` with something from the `'other'` list.
The result is something like `'HTML5 with bacon'`.

## The code

    def randomly_generated(nt):
        template = random.choice(productions[nt])
        def replace(match):
            return randomly_generated(match.group(1))
        return re.sub(r'\$\{(\w+)\}', replace, template)

    def random_idea():
        return randomly_generated('talk')

Short and sweet.

* [`random.choice()`](http://docs.python.org/3/library/random.html#random.choice)
  chooses a random element from a list.
* [`re.sub()`](http://docs.python.org/3/library/re.html#re.sub) does
  a regular expression search and replace.
* The helper function `replace()` takes a
  [regular expression match object](http://docs.python.org/3/library/re.html#match-objects)
  and returns the desired replacement,
  which it computes by calling `randomly_generated()` recursively.

The recursion means that any output string in `productions` may contain `${variables}`,
and the function will keep going until they are all fully expanded into random text.

I like this hack because it&rsquo;s so tiny
and because it&rsquo;s a nice illustration of what recursion is good for.

With the grammar above, we can only generate a few hundred different
talks in all. But the code is flexible. We could easily add grammar
entries to generate millions of topics.

Next week I think I&rsquo;ll talk about proxy objects. See you then.
