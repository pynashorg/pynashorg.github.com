---
layout: post
title: Venus, Cupid, Folly, and the Brown Corpus
author: Jason Orendorff
comments: true
---

Terry Gilliam tells a story about seeing Agnolo Bronzino&rsquo;s
painting
[*Venus, Cupid, Folly and Time*](https://en.wikipedia.org/wiki/Venus,_Cupid,_Folly,_and_Time).

<figure>
  <img src="/images/blog-content/venus-cupid.jpg">
</figure>

It&rsquo;s considered a Mannerist masterpiece, packed with allegorical
details from the erotic to the obscure, but none of that mattered to
Gilliam. The entire intellectual experience he was supposed to be having
was lost on him; what excited him, instead, was the shape of
Cupid&rsquo;s foot in the lower left corner. In Gilliam&rsquo;s hands it
became the signature squashing foot of Monty Python&rsquo;s Flying
Circus.

NLTK, the analogy goes, is a Python masterpiece, packed with tools from
the merely statistical to the borderline magical. But the part
I&rsquo;ve found inexplicably compelling is that it includes a copy of
the [Brown Corpus](https://en.wikipedia.org/wiki/Brown_Corpus).

Back in the 1960s, two researchers at Brown University chose 500 random
chunks of English text, roughly 2,000 words each, from books, stories,
essays, and news articles. This made a corpus of about a million
words. They put all the words on punchcards, so that computer programs
could be run on them. This data set became the Brown Corpus.

There are larger data sets out there now, but the Brown Corpus is small
enough to hack on interactively and freely available on the Internet.
After installing NLTK, it&rsquo;s as simple as this:

    >>> from nltk.corpus import brown
    >>> len(brown.words())
    1161192

Not only that, but each word is tagged with its part of speech.

    >>> tagged = brown.tagged_sents(categories='science_fiction', simplify_tags=True)
    >>> len(tagged)
    948
    >>> tagged[371]
    [('We', 'PRO'), ('will', 'MOD'), ('gladly', 'ADV'), ('entertain', 'V'),
     ('your', 'PRO'), ('young', 'ADJ'), ('and', 'CNJ'), ('give', 'V'),
     ('them', 'PRO'), ('proper', 'ADJ'), ('living', 'VG'), ('quarters', 'N'),
     (',', ','), ('in', 'P'), ('return', 'N'), ('for', 'P'), ('their', 'PRO'),
     ('help', 'N'), ('in', 'P'), ('running', 'VG'), ('our', 'PRO'),
     ('fusion', 'N'), ('reactors', 'N'), ('.', '.')]

As you can see, these are word/part-of-speech pairs, punctuation is
thrown in with everything else, and the science fiction of the 1960s was
awesome.

Well. One of my favorite things is playing with language. So if a Python
package offers nothing more than a big data set of examples of English
usage, to me that&rsquo;s a pretty wonderful playground.

So here is some code. See if you can guess what I&rsquo;m doing before
you get to the end.  At the end, there&rsquo;s a link to some sample
output that shows what the program does.

    from nltk.corpus import brown
    from nltk.probability import FreqDist
    import random

    freq = FreqDist()
    for word in brown.words():
        freq.inc(word.lower())

Hmm. So far so good. It looks like we are counting how often each word
appears in the corpus.
[`nltk.probability.FreqDist`](http://nltk.org/api/nltk.html?highlight=freqdist#nltk.probability.FreqDist)
is very much like
[`collections.Counter`](http://docs.python.org/2/library/collections.html#counter-objects),
but it provides some extra statistical methods.

    paras = []
    for para in brown.tagged_paras(categories='science_fiction', simplify_tags=True):
        if len(para) > 4 and sum(len(sentence) for sentence in para) > 40:
            paras.append(para)
    para = random.choice(paras)

Here it looks like we&rsquo;re choosing a random tagged paragraph from
the corpus, but disqualifying paragraphs that are too short. On to the
next thing!

    tag_names = dict(ADJ='adjective', ADV='adverb', N='noun', NUM='number',
                     V='verb', VD='past tense verb', VG='-ing verb')

This is just a simple dictionary explaining the part-of-speech
tags. Well, not all of them, but some of them.

This is where the puzzle gets kind of crazy. See if you can follow:

    items = []
    total_words = 0
    for i, sentence in enumerate(para):
        for j, (word, tag) in enumerate(sentence):
            total_words += 1
            if word.isalpha() and tag in tag_names:
                # totally made-up rarity formula
                rarity = 1 / (freq.freq(word.lower()) + 0.0001)**2
                items.append((rarity, (i, j)))
    blanks = min(total_words // 7, len(items))
    chosen = set(random_weighted_sample_no_replacement(items, blanks))

Most of this code is building the `items` list. And then we pass it to
a function,
[`random_weighted_sample_no_replacement(items, n)`](http://stackoverflow.com/a/2149533/94977).

The result of this code is a set of `(i, j)` pairs giving the location,
within the paragraph, of some randomly chosen words.  All the complexity
is in trying to pick rare words. (This is the only place where `freq`
from above is used: we use it to determine how rare a given word is.)

Just one more block of code: we are building the output.

    results = []
    blank_labels = []
    for i, sentence in enumerate(para):
        for j, (word, tag) in enumerate(sentence):
            if (i, j) in chosen:
                results.append(None)
                blank_labels.append(tag_names[tag])
            else:
                results.append(word)

The rest of the code is just printing the words from `results`, using
`blank_labels` to fill in the places where we substituted None.
That part is not very interesting, so we&rsquo;ll skip it.

You now have all the information. **What is this code doing?**

<figure>
  <img src="/images/blog-content/monty-foot.jpg">
  <figcaption>Hint: It&rsquo;s rather silly.</figcaption>
</figure>

If you want to puzzle over this some more,
[view the whole script without comments.](https://gist.github.com/jorendorff/4987554)

Give up? [Here is sample output.](https://gist.github.com/jorendorff/4987715)
I find the effect deliciously eerie.

[View the whole script, with brief comments.](https://gist.github.com/jorendorff/4987754)

Next week, I&rsquo;ll take a look inside the `difflib` module. See you then.
