---
layout: post
title: diff in 50 lines of Python
author: Jason Orendorff
comments: true
---

Where do patches come from?

The open source world runs on patches,
and thanks to tools like `git`
pretty much all of us are familiar with them.
But patches are something the tools generate for us.
Hardly anyone ever thinks about how they are made.

You can use `diff FILE1 FILE2` to generate a patch.
But how does `diff` work?

Most diffing tools use a single clever algorithm,
known as the Hunt&ndash;McIlroy algorithm, after its inventors.
Douglas McIlroy first implemented it in the 1970s for Unix `diff`.
It has been implemented over and over again,
with many variations.
One, by Tim Peters, is in the Python standard library.
It&rsquo;s called [`difflib`](http://docs.python.org/3.3/library/difflib.html).

Today we&rsquo;ll see how the Hunt&ndash;McIlroy algorithm works
and what optimizations `difflib` uses.

It turns out you can
[implement a simple `diff` in 50 lines of Python code](https://gist.github.com/jorendorff/5040491).


## Breaking down the problem

Before you read on,
take a moment to think about how you would approach this problem.
How do you find the differences between two files?

The first key insight
is that diffing involves
finding large regions where the two input files *are the same*.
This is something that we can do programmatically&mdash;computers
are good at matching&mdash;and
once we have found all the common regions,
whatever&rsquo;s left is the differences.

Knowing that, we can break the problem into three parts:

1. An algorithm for finding the longest common regions of two files.
   That is, the longest sequence of lines that appears verbatim in both.
2. An algorithm for finding a list of *all* the common regions of two files.
3. Code for printing out a diff, given the list of common regions.

All three parts are apparent in the final code:
[Three problems, three functions.](https://gist.github.com/jorendorff/5040491)

The last two are, I hope, easy enough that you can read them,
ponder them, and discover what they do and how they work.
Both have some clever surprising bits,
so if you enjoy a good puzzle,
read the code!

But the first part is where the magic lives.


## The code

The core of the diffing algorithm is this function, `longest_matching_slice`.
So even though this is "diff in 50 lines", really the brains of the operation
is just 15 lines long:

    def longest_matching_slice(a, a0, a1, b, b0, b1):
        sa, sb, n = a0, b0, 0

        runs = {}
        for i in range(a0, a1):
            new_runs = {}
            for j in range(b0, b1):
                if a[i] == b[j]:
                    k = new_runs[j] = runs.get(j-1, 0) + 1
                    if k > n:
                        sa, sb, n = i-k+1, j-k+1, k
            runs = new_runs

        assert a[sa:sa+n] == b[sb:sb+n]
        return sa, sb, n

This is the part of the code that implements the
Hunt&ndash;McIlroy algorithm.

It takes as its arguments two regions in two different arrays:
`a[a0:a1]` and `b[b0:b1]`.

The result is a triple of integers `(sa, sb, n)`,
telling where the matching region starts in `a`,
where it starts in `b`,
and how many lines long it is.

The assertion on the next-to-last line
explains what we&rsquo;re doing here
better than I could.


## How it works

The basic idea here is really simple:
we start by setting `sa, sb, n` to the worst possible &ldquo;matching slice&rdquo;,
which has length 0.
Then, we construct *every* matching region that the two arrays share,
and as we go, we store the longest match in `sa, sb, n`.

The only remaining question is how to construct every matching region.
Here is how the Hunt&ndash;McIlroy algorithm does it:

<ol>
  <li>Start at the first line of file A.</li>
  <li>Make a list of active runs, initially empty.</li>
  <li>For each place *b* where the current line of file A appears in file B:
    <ul>
      <li>If it extends an active run, that run stays active and its length increases by 1;</li>
      <li>Otherwise, make a new active run of length 1.</li>
    </ul></li>
  <li>Discard all previously-active runs that did not get extended in step 3
    (They are not active anymore; we reached a line that doesn't match.)</li>
  <li>If there are any more lines in file A,
    move on to the next one and go back to step 3.</li>
</ol>

Note that the code works for lists of arbitrary objects,
not just strings.


## What `difflib` does

Could we go faster? Here are some ideas:

* My code has an inner loop that searches for places where `a[i]` occurs
  in `b`. We could replace that with a dictionary mapping all the values
  of `b` to the list of places in `b` where they appear. `difflib` does
  this.

* Even with *that* optimization, if any elements of `a` occur many times
  in `b`, the innermost loop will go very slowly.  This is especially
  unfortunate because there are in ordinary text files super-common
  elements (such as blank lines), and they are the *least* interesting
  lines in the whole file!  `difflib` optimizes by treating extremely
  common elements as &ldquo;junk&rdquo; and basically ignoring them
  when matching.

Want to see?

There's an easy way to find the source code of `difflib`:

    >>> import difflib
    >>> difflib.__file__
    '/usr/local/Cellar/python/2.7.3/Frameworks/Python.framework/Versions/2.7/lib/python2.7/difflib.pyc'
    >>> import os
    >>> os.system('cat ' + _.replace('.pyc', '.py'))

The code quoted above was adapted from this code, in particular this
method of `SequenceMatcher`:

    def find_longest_match(self, alo, ahi, blo, bhi):
        """Find longest matching block in a[alo:ahi] and b[blo:bhi].
        ...
        """
    
        ...
    
        a, b, b2j, isbjunk = self.a, self.b, self.b2j, self.isbjunk
        besti, bestj, bestsize = alo, blo, 0
        # find longest junk-free match
        # during an iteration of the loop, j2len[j] = length of longest
        # junk-free match ending with a[i-1] and b[j]
        j2len = {}
        nothing = []
        for i in xrange(alo, ahi):
            # look at all instances of a[i] in b; note that because
            # b2j has no junk keys, the loop is skipped if a[i] is junk
            j2lenget = j2len.get
            newj2len = {}
            for j in b2j.get(a[i], nothing):
                # a[i] matches b[j]
                if j < blo:
                    continue
                if j >= bhi:
                    break
                k = newj2len[j] = j2lenget(j-1, 0) + 1
                if k > bestsize:
                    besti, bestj, bestsize = i-k+1, j-k+1, k
            j2len = newj2len

Note another small optimization in this code:
Method lookups were once quite slow in Python,
so instead of calling `j2len.get(...)`
in the inner loop, Tim sets `j2lenget = j2len.get` outside of the loop
and calls that.
Method lookups are faster in CPython now, but they still are not free;
at least they allocate an object.

[`difflib`](http://docs.python.org/3.3/library/difflib.html)
is full of fun stuff:
routines for printing diffs in several common formats,
other random diffy tools. 

I&rsquo;m a little afraid that I enjoyed this code dive more than you!
Maybe, for figuring out how code works, there is just no substitute
for rewriting it yourself.

Next week, I&rsquo;ll describe an algorithm for treeification.
See you then!
