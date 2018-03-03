---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Generators-Based Data Processing Pipeline"
tags: ['python', 'generator', 'yield', 'coroutine']
image: "generators.png"
identifier: 2
---

Generators represent quite powerful conception of (possibly indefinite)
streams of data. Almost every Python 3.x developer encountered generators (when used `range` or `zip` methods, for example). However, they could be used not only as sources of data, but also
as _coroutines_ organized into data transformation chains. The post shows how to
build generators pipeline to preprocess data to train image classification model
and to convert original images into predictions.

<!--more-->

<blockquote class="tip">
<strong>Disclamer</strong>: This post is mostly about one specific use case of
Python generators &mdash; to transform arrays of data passing them from one
coroutine to another. For more rigorous introduction into generators please
check links at the bottom of this page.
</blockquote>

Most of time one can create a generator to produce a stream of results, i.e.
when it is not known in advance how many elements will be produced.

Consider the following function that generates sequence of [Catalan numbers](https://en.wikipedia.org/wiki/Catalan_number):
```Python
def catalan(start=0):
    from math import factorial
    n = start
    while True:
        next_number = factorial(2*n)//`factorial(n + 1)//factorial(n)
        yield next_number
        n += 1
```

This example shows one of the most straightforward ways to use Python generators
-- to produce a sequence of values with unknown length (infinite, in this case).
Note a `yield` keyword instead of `return` as in usual functions. When the
function `catalan()` is called first time, the body of function is executed
until the first occurrence of that keyword. To continue generator execution
and retrieve produced values one could:
1. Use `next` built-in to get single value from generator;
2. Pass generator to constructor like `list` or `for-in` loop (which implicitly calls `next` on each
iteration) to get all available values from generator.

Here is an example of creating generator and retrieving its values:
```Python
from itertools import islice

# create generator
catalan_numbers = catalan()

first_5_numbers = [next(catalan_numbers) for _ in range(5)]
assert first_5_numbers == [1, 1, 2, 5, 14]

next_5_numbers = list(islice(catalan_numbers, 0, 5))
assert next_5_numbers == [42, 132, 429, 1430, 4862]
```

But generators can not only return values, but also _receive_ then from "outside".
The special method `send()` allows one to pass a value into generator. This
method allows to treat generator as _coroutine_, in other words - a supplementary
program with its own state which is executed asynchronously. (For more rigorous
definition of coroutine please refer, for example, [this link](https://en.wikipedia.org/wiki/Coroutine)).

```python
def natural_numbers():
    x = 1
    while True:
        yield x
        x += 1

```

[David Beazley](http://www.dabeaz.com/finalgenerator/) has a great series of tutorials
showing how powerful the whole conception is. (He shows development of simple
tasks scheduler similar to one that is usually used by OS to allocate CPU time
among processes).

[Fluent Python by Luciano Ramalho](http://shop.oreilly.com/product/0636920032519.do) is
a great book discussing different Python's topics, and generators/coroutines are among them.

The most recent versions of Python include asynchronous features and coroutines
into language as first-class citizens. Please refer [Python documentation](https://docs.python.org/3/library/asyncio-task.html)

The first step that is required to apply any deep learning model to classify images
data is to convert available dataset
