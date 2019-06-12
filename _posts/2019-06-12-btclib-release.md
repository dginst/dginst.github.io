---
layout: post
comments: false
title: "New btclib release"
subtitle: "A python library for bitcoin cryptography"
author: "Ferdinando Ametrano"
image:
    main: 2019-06-12-btclib-tentative-logo.jpg
    thumb: 2019-06-12-btclib-tentative-logo-thumb.jpg
published: true
---

[btclib](https://github.com/dginst/btclib)
is a python3 type annotated library intended for teaching and
demonstration of the elliptic curve cryptography used in bitcoin,
originally developed for the
[_Bitcoin and Blockchain Technology_](https://www.ametrano.net/bbt/) course
at University of Milano-Bicocca and Politecnico di Milano.

The major focus of
[this new release](https://github.com/dginst/btclib/releases/tag/v2019.2.5)
is the documentation,
now automatically generated and available at
<https://btclib.readthedocs.io/en/latest/>.
Hopefully this will help introducing new users and devs to the library
and existing users/devs to deal with any refactoring.

A relevant "lost leading zeros in entropy" bug has been fixed.
See the issue and the provided links for more details:
<https://github.com/fametrano/btclib/issues/15>.

The major new feature is Bitcoin message signing with compact encoding.

The library adopts the
[MIT licence](https://github.com/dginst/btclib/blob/master/LICENSE):
as such it can be used with no real constraints.
We encourage students, researchers, and devs
to test it and contribute to its development.
