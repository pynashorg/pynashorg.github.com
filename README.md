# pynashorg.github.com

This is the PyNash web site, now live at:
* http://pynashorg.github.com
* http://pynash.org


## How to add a blog post

Add a file in the `_posts` directory.


## How to run this site on your machine (without affecting the system ruby install)

1. If you haven't already, clone this repo.
2. If you haven't already got it, install rvm and enable it in your shell. (I installed it in my home directory and it worked fine.)
3. Create a "gemset" just for pynashorg. (This is like the part of a virtualenv sandbox that holds installed modules.)
4. "Use" the new gemset.
5. Install jekyll in the gemset.
6. Run jekyll.

Here are the commands I used.
If you&rsquo;re on Windows, these commands won&rsquo;t work for you.

    git clone git://github.com/pynashorg/pynashorg.github.com.git
    cd pynashorg.github.com
    \curl -L https://get.rvm.io | bash -s stable --ruby
    . ~/.rvm/scripts/rvm
    rvm gemset create pynashorg
    rvm use @pynashorg
    gem install jekyll
    jekyll --server --auto

Ctrl-C to kill it.

Now that everything&rsquo;s set up, you just need two commands:

    rvm use @pynashorg
    jekyll --server --auto

If you need help, contact jason dot orendorff at gmail.
