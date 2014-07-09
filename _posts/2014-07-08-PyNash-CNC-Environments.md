---
layout: post
title: PyNash Coffee and Code Environments
author: Jason Myers
comments: true
---

PyNash Coffee and Code (C-n-C) is a "safe learning space." In order to encourage this model, we use the full [PyCon Code of Conduct](https://github.com/python/pycon-code-of-conduct/blob/master/code_of_conduct.md). 
In addition to that code of conduct we are also using the [Hacker School social rules](https://www.hackerschool.com/manual#sub-sec-social-rules):

* No feigning surprise

The first rule means you shouldn't act surprised when people say they don't know something. This applies to both technical things ("What?! I can't believe you don't know what the stack is!") and non-technical things ("You don't know who RMS is?!"). Feigning surprise has absolutely no social or educational benefit: When people feign surprise, it's usually to make them feel better about themselves and others feel worse. And even when that's not the intention, it's almost always the effect. As you've probably already guessed, this rule is tightly coupled to our belief in the importance of people feeling comfortable saying "I don't know" and "I don't understand."

* No well-actually's

A well-actually happens when someone says something that's almost - but not entirely - correct, and you say, "well, actually…" and then give a minor correction. This is especially annoying when the correction has no bearing on the actual conversation. This doesn't mean Hacker School isn't about truth-seeking or that we don't care about being precise. Almost all well-actually's in our experience are about grandstanding, not truth-seeking. (Thanks to Miguel de Icaza for originally coining the term "well-actually.")

* No back-seat driving

If you overhear people working through a problem, you shouldn't intermittently lob advice across the room. This can lead to the "too many cooks" problem, but more important, it can be rude and disruptive to half-participate in a conversation. This isn't to say you shouldn't help, offer advice, or join conversations. On the contrary, we encourage all those things. Rather, it just means that when you want to help out or work with others, you should fully engage and not just butt in sporadically.

* No subtle sexism

Our last social rule bans subtle sexism, racism, homophobia, etc. This one is different from the rest, because it's often not a specific, observable phenomenon ("well-actually's" are easy to spot because they almost always start with the words, "well, actually…").

## How does Coffee and Code work?

Coffee and code is a different kind of meeting than PyNash normally does.  Everyone is the teacher and the student! Each C-n-C will be lead by a facilitator, but their main job is to set a framework for the discussion.  They aren't there to lecture the whole time, only to demo and teach first :)

Each person will come up after the facilitator is done and demo/share a part of what they did. This is critical to retension and building confidence/trust.

## Does that mean I need to have something prepared to talk about?

Nope you will demo part of something the facilitator already showed and add anything else you deem helpful. 

## I hate "public speaking"!

No worries so do I. But it's a very useful skill much like coding, and this is a safe space.

## Is coffee and code kid friendly?

Yes!!!

## What do I need to participate?

* You need virtualbox installed from [here](https://www.virtualbox.org/wiki/Downloads).
* You need vagrant install from [here](https://www.vagrantup.com/downloads)

## So what is this one about?

This first C-n-C is about environments and how to set them up.  So we'll cover virtualenv, virtualenvwrapper, pip, pyenv, etc related to setting up python environments.  If you have questions bring them! If you have other packages not listed here that you like bring them!

## How do I get started?

* Get the Vagrant virtual machine that we'll use to work on from [Github](https://github.com/pynashorg/pynash-cnc)

``git clone git@github.com:pynashorg/pynash-cnc.git

* Next we need to download and start the vagrant box (this will take a while the first time because it has to download an ubuntu cloud image)

``vagrant up

* You're ready to go shutdown the vagrant box and cya Saturday morning!

``vagrant halt


