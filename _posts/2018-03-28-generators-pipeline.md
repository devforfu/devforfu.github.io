---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Generators-Based Data Processing Pipeline"
tags: ['python', 'generator', 'yield', 'coroutine', 'numpy']
image: "generators.png"
identifier: 2
---

Generators represent a quite powerful conception of gradually consumed (and probably indefinite)
streams of data. Almost every **Python 3.x** developer has encountered generators
(when used `range` or `zip` methods, for example). However, the generators could
be used not only as sources of data but also as _coroutines_ organized into
data transformation chains. The post shows how to build generators pipeline
which preprocesses images stored on external storage.

<!--more-->

<blockquote class="tip">
<strong>Disclamer</strong>: This post is mostly about one specific use case of
Python generators &mdash; to transform arrays of data passing them from one
coroutine to another. For more rigorous introduction into generators and
coroutines please check links at the bottom of this page.
</blockquote>

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">Generators and Yield Keyword</h4>

Each programming language supports a conception of data arrays or _lists_, i.e.
sequences of elements which are stored in memory during program execution
and which elements could be directly accessed using integer indexes.

The main generator's difference from a list is that it does not provide
a random access to its elements and does not keep them in memory. Moreover, in general,
it **doesn't know in advance** how many elements will be produced. It can only
produce results one by one, when `next()` function/method is called:

![Generator](/assets/img/chain.png){: .center-image}

Conceptually, a generator could be thought of as a sort of [state machine](https://en.wikipedia.org/wiki/Finite-state_machine), that
changes its state on demand and produces new elements while moving from one state
into another. From an implementational point of view, Python language
provides a very simple way to create such objects. One need to use a special
keyword `yield` instead of `return` in a function definition, and this function
will be treated as generator, entity, which doesn't just return a single value
on its call, but memorizes its state on each call and produces new values
depending on that state.

As it was mentioned, generators do not store in memory the whole sequence of
values. This property could is especially helpful when the length of a sequence
is not known. One of the most straightforward examples of such sequence is
a mathematical sequence like [Catalan numbers](https://en.wikipedia.org/wiki/Catalan_number)
which could be implemented as follows:
```Python
def catalan(start=0):
    from math import factorial
    n = start
    while True:
        next_number = factorial(2*n)//factorial(n + 1)//factorial(n)
        yield next_number
        n += 1
```

Therefore, generators provide a simple API to implement a stateful object which tracks
progress and creates new elements depending on previous calls. When the
function `catalan` is called the first time, the body of the function is executed
until the first occurrence of `yield` keyword. To continue generator execution
and retrieve produced values one could:
1. Use `next` built-in to get a single value from the generator
2. Pass generator object into sequence constructor like `list`
3. Use `for-in` loop (which implicitly calls `next` on each
iteration) to get all available values

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

So far nothing different from usual lists, except that generator yields data in
chunks which are consumed by the caller. But generators can not only return values,
they can also _receive_ them from "outside", which allows one to modify its behavior.
Next section explains how.

<hr class="with-margin">
<h4 class="header" id="send">Sending Values into Generator</h4>

The special method `send()` allows one to pass a value into the generator. This
method allows treating generator as a _coroutine_, in other words -- a supplementary
program with its own computation state which is executed asynchronously. (For a more rigorous
definition of coroutine please refer, for example, [this link](https://en.wikipedia.org/wiki/Coroutine)).

For example, consider the following use case. One has a list of file names generated
while training machine learning model. Some of them contain intermediate model's weights
computed during training. Each of these files contains relevant validation loss in their names.
We want to iterate through these files and extract loss values using a specific [regular expression](https://docs.python.org/3/howto/regex.html#regex-howto). All files
that don't match should be ignored. The following snippet shows how this goal
could be achieved using a generating function:

<script src="https://gist.github.com/devforfu/e0556ae5a471f28f3a3e4fad7795dd5f.js"></script>

Line **41** creates a generator with default regex string. Line **43** sends
filename into the generator and if the returned value is not **False**, prints extracted
loss. Also note `apply()` function defined in lines **23-28**. Each newly
created generator should accept **None** as first sent value. Then, because
there are two `yield` statements in the generator, we continue sending **None** before
sending an actual value to advance generator's state to an appropriate line of execution.
Generally speaking, each `send()` call advances generator to next `yield` and
returns value from the right side of that statement.

It means that instead of having all logic inside of single program or creating
stateful objects with their own attributes and properties, one can create a
group of generators passing data from one to another.

Provided example is quite simple and could be implemented in more straightforward fashion,
like just create a simple filtering function without any additional sophistication.
The following section shows a more involved example of building group of generators
organized into data processing pipeline, which helps to decrease the amount of consumed
memory to process image dataset in an iterative way.

<hr class="with-margin">
<h4 class="header" id="images">Images Processing Pipeline</h4>

Consider the following example. You have a dataset with labeled images and want to
train an image classifier. You are going to use some form of [Stochastic Gradient Descent](http://ufldl.stanford.edu/tutorial/supervised/OptimizationStochasticGradientDescent/),
which trains model in batches instead of running optimization algorithm on the whole
dataset. On each training batch, the following preprocessing steps should be
performed before the batch could be used in training process:

1. Crop images and convert into NumPy array
2. Apply [data augmentation](https://www.kaggle.com/dansbecker/data-augmentation) transformations
3. Re-scale samples into a range of values expected by the model
4. Shuffle batch samples to randomize training process

You could just read all available images into memory, apply preprocessing steps and start training feeding
one training batch after another into optimization algorithm. But even reasonably small dataset
like 10,000 -- 20,000 samples (for example, one from [Dog Breed Identification](https://www.kaggle.com/c/dog-breed-identification) competition) could occupy several
**dozens of gigabytes** of RAM when is read from the file system into NumPy arrays which
is a way too much memory for modern personal computers and laptops.

Let's pretend that each image has a resolution of 256x256 pixels and 3 color channels.
When loaded into memory as a 3D array of `uint8` numbers, the image will take:

$$
256 \times 256 \times 3 \times 8 = 1.5 \mathrm{Mb}
$$

It means, that dataset of 10000 images will occupy $$\approx14.6\mathrm{Gb}$$ of memory.
Even if you have enough space to load all these files at once, your system could
slow down or raise an out-of-memory error later during next steps. Also, data
augmentation process is performed on the fly and cannot be cached so you can't
just save prepared data back into the file system and read sample by sample.
Therefore, in most cases, reading all available files into memory or caching
preprocessed data is not a flexible solution.

An alternative approach is to read images gradually, in small chunks, convert each of them
into expected representation and then send into training algorithm. To achieve this goal,
one could create a group of generators, each of them expecting $$(x, y)$$ pair with
images and labels batches, applies transformations, and yields to next transformer
in chain.

<blockquote class="tip">
<strong>TL;DR:</strong> The full example of the code described in this section
could be found <a href="https://github.com/devforfu/Blog/blob/master/generators/training.py">here</a>.
Please note that following examples of code were modified to keep them simple
enough for this post.
</blockquote>

The very first generator in the pipeline should discover image files in a folder,
match file path with its label, and convert labels from verbose representation
into [one-hot encoded vectors](http://scikit-learn.org/stable/modules/preprocessing.html#encoding-categorical-features)
which are fit for most of the optimization algorithms. For this purpose, `LabelBinarizer`
class from [scikit-learn](http://scikit-learn.org/stable/) package could be used.

The generator expects images to be organized into subfolders, where each subfolder's
name match with class represented by images, stored within that subfolder:
```bash
$ tree images
images
├── airedale
│   ├── 02c90d8109d9a48739b9887349d92b1f.jpg
│   ├── 07ddc3c2188164b1e72ae6615a24419a.jpg
├── boxer
│   ├── 008887054b18ba3c7601792b6a453cc3.jpg
│   ├── 0e3cdff3560de43a8aa1d9820c211fae.jpg
│   ├── 1831f3ce615ffe27a78c5baa362ac677.jpg
├── golden_retriever
│   ├── 0021f9ceb3235effd7fcde7f7538ed62.jpg
│   ├── 2ae784251c577222be8f7f3cef36e2d0.jpg
...
```

Function `dataset()` implements logic described above and produces $$(paths, labels)$$
pairs, where each element of a pair has the length of `batch_size`. Each `next()` call will
produce a new batch of data. Note that on this step no images are stored in memory,
only their paths, and labels. Therefore, when a generator is created, it occupies
a very small amount of memory.
```Python
from math import ceil
from sklearn.preprocessing import LabelBinarizer

def dataset(root_folder, batch_size=32):
    images_and_labels = list(discover_images(root_folder))
    n_batches = int(ceil(len(images_and_classes) / batch_size))
    classes = [c for (img, c) in images_and_classes]
    binarizer = LabelBinarizer().fit(classes)    

    start = 0
    for _ in range(n_batches):
        batch = images_and_classes[start:(start + batch_size)]
        paths, labels = zip(*batch)
        encoded = binarizer.transform(labels)
        start += batch_size
        yield np.asarray(paths), encoded
```

Function `discover_images()` could be implemented as generator itself to save
a couple of lines required to create a buffer list to store each discovered
file and label pair before returning them to the caller:
```Python
from os import listdir
from os.path import join

def discover_images(folder):    
    for image_class in listdir(root_folder):
        subfolder = join(root_folder, image_class)
        for sample in listdir(subfolder):
            filename = join(subfolder, sample)
            yield filename, image_class
```

Next, we need a generator which accepts discovered files paths, reads them into
memory, resizes to shape expected by model and converts into NumPy arrays. If previously
created function could be treated as a preparation step gathering meta-information
required to create training samples and targets, `read_images()` generator defined
below actually reads data from external storage into memory. But still, it
will not read into memory more files then were sent by the previous step in the chain,
keeping an amount of occupied space reasonably small.

To read and resize image file one could use [Pillow library](https://github.com/python-pillow/Pillow) and
the following implementation which is mostly copied from [this Keras utility function](https://github.com/keras-team/keras/blob/master/keras/preprocessing/image.py#L361), but
is much more simple:

```Python
def read_images(target_size=(224, 224)):    
    while True:
        filenames, y = yield
        images = []
        for sample in filenames:
            img = Image.open(sample)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img = img.resize(target_size, Image.NEAREST)
            images.append(img)
        yield images, y
```

Other steps could be implemented in a similar fashion like it is shown [here](https://github.com/devforfu/Blog/blob/master/generators/training.py).
But the main idea is same -- you need a function with two `yield` statements:
one to receive initial value and one -- to produce output. Note that you can
do it simultaneously like `a = yield b`, but in this case an
initial value of `b` should be precomputed inside of generator's
definition.

How to gather all these things together? You just need to create a list of
your generators and write a simple loop which receives output from previous
generator and sends it to next one. The following class called `GeneratorPipeline`
shows one possible simple solution which expects one "source" generator, i.e.
generator not accepting any values from outside, and a list of "transformers",
where each of generators has two `yield` statements in their definitions:

```Python
class GeneratorPipeline:

    def __init__(self, source, *steps):
        self.source = source
        self.steps = list(steps)

    def __iter__(self):
        return self

    def __next__(self):
        return self.next()

    def next(self):
        batch = next(self.source)
        self.send_none()
        transformed = self.send(batch)
        return transformed

    def send_none(self):
        for step in self.steps:
            step.send(None)

    def send(self, batch):
        x = batch
        for generator in self.steps:
            x = generator.send(x)
        return x
```

Finally, there is a snippet shown below which schematically shows how to use created classes
and generators to optimize model using batch by batch training.

Note two magic methods in `GeneratorPipeline` implementation, namely, `__iter__` and `__next__`.
Both are required to make class instances compatible with the iterable interface.
That interface is required if one wants to use their class in `for-in` loops, list
comprehensions or any other contexts, where iterables can be used. Due to dynamical
nature of Python language and duck typing, there is no need to implicitly inherit
any classes, just provide an implementation of required magic methods.

As it was mentioned previously, `for-in` loop automatically calls `__next__` method of
pipeline object and receives batches of training data:

```Python
# chain generators together
pipeline = GeneratorPipeline(
    dataset('/path/to/images'),
    read_images(),
    augment(rotate90=True),
    rescale_images(mean=[103.939, 116.779, 123.68]),
    shuffle_samples())

# build model
model = create_model()

# start training
for x_batch, y_batch in pipeline:
    model.train_on_batch(x_batch, y_batch)
```

Therefore, from a _syntactical_ point of view, the pipeline is not really
different from using a standard Python's collection. Though there is
a big difference from the _semantical_ perspective: provided code doesn't read
all images into memory, but instead processes images gradually and applies all
required modifications on the fly. Also, one could easily replace any part of
the pipeline with different implementation or switch data source from local
files to a network connection, database or anything else.

<hr class="with-margin">
<h4 class="header" id="outro">More about Generators</h4>

[David Beazley](http://www.dabeaz.com/finalgenerator/) has a great series of tutorials
showing how powerful the conception is. (As one of the examples, the author shows a development of simple
tasks scheduler similar to one that is used by OS to allocate CPU quants of time among processes).
[Fluent Python by Luciano Ramalho](http://shop.oreilly.com/product/0636920032519.do) is
a great book discussing different Python's topics, and generators/coroutines are among them.

The most recent versions of Python include asynchronous features and coroutines
into the language as first-class citizens. Please refer to [Python documentation](https://docs.python.org/3/library/asyncio-task.html) to learn more.

<hr class="with-margin">
<h4 class="header" id="conclusion">Conclusion</h4>

While processing huge amounts of data it is not always possible to read everything
into memory at the beginning of program's execution. Moreover, sometimes it is not even
required, because, for example, in case of deep learning models training one
usually uses a GPU to optimize network which, in most cases, can't fit all the data
samples into its memory (which also would require a lot of time to be processed)
and runs training algorithm in batches.

Python's generators provide a simple API to create stateful objects without
which memorize results of their previous call and use this information to
produce next values. This abstraction allows implementing coroutines and data
streams, helping to make programs modular, simple to understand and memory
efficient.

Other possible use cases include reading data from remote data sources,
reading real-time signals which cannot be cached or produce all values in
advance and many more different situations when asynchronous execution is
required.

<hr class="with-margin">
### References

<ol>
  <li><a href="http://shop.oreilly.com/product/0636920032519.do">Fluent Python</a></li>
  <li><a href="http://pyvideo.org/pycon-us-2014/generators-the-final-frontier.html">Generators: The Final Frontier</a></li>
  <li><a href="https://brett.is/writing/about/generator-pipelines-in-python/">Generator Pipelines in Python</a></li>
</ol>

<!-- The first step that is required to apply any deep learning model to classify images -->
<!-- data is to convert available dataset -->
