---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "How to build a flexible CLI with standard Python library"
tags: ['python', 'argparse', 'cli']
image: "cli.png"
identifier: 5
---

The Python programming language is quite often used to write various CLI-based utilities and automation tools. There are plenty of third-party libraries that make this process very easy and straightforward. However, recently I've realized that very often I use the good old `argparse` when writing my snippets, and also there are lots of legacy code that utilizes this package. That's why I've decided to create a single reference point for myself showing how to use it. In this post, we are going to take a close look at the library and gradually build a simple CLI to generate plots with `matplotlib` library.

<!--more-->

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">Third-Party Solutions</h4>

Before we dive into the `argparse` capabilities, let's have a quick overview of the third-party libraries and their unique properties. In this way we can understand what is available in more
sophisticated libraries, and compare the amount of efforts required to achieve the similar
results with the built-in package.

<blockquote class="tip">
Note that purpose of this section is not to give a comprehensive overview of the discussed
libraries but to have some reference point for comparison with the standard library. Please
refer the documentation to know more about the packages discussed below.
</blockquote>

<h5>🔥 <a href="https://github.com/google/python-fire">Fire</a></h5>
Sometimes the CLI is not the purpose per se but only a method to run the code you've written. For example, you have a class that makes some plotting but has no standalone interface and is intended to be used programmatically only. The `fire` helps you easily convert the class into a CLI tool.

<script src="https://gist.github.com/devforfu/c8677316dcbf69f70718a0dc4f702fc8.js"></script>

That's all! Now you can invoke the class like the line below shows:
```
$ python plotter.py scatter plot 1 2 3 4 5 6
```
An easy solution to expose your code to the command-line interaction in cases when you don't want to spend too much time making to build the argument parser manually.

<h5>📄 <a href="http://docopt.org">Docopt</a></h5>
Whenever you develop a CLI-based tool, you would like to make it well-document so the users can understand how to use it. Therefore, you don't only write the command-line parsing code but also the strings explaining how it works. The `docopt` package makes your job a bit easier: you only need to write a README for your program, and the package generates the argument parser for you.

<script src="https://gist.github.com/devforfu/96a7897d8ec0cb52df8d10a8a784df52.js"></script>

In this case, we also need to write a small snippet to pass the parsed arguments into the plotter class. However, now the CLI and the execution logic are much better decoupled from each other. We can define an interface that is different from our methods signature and adapt the parsed arguments later. Use [this link](http://try.docopt.org) to try it yourself right from the browser.

<h5>
    <img src="/assets/img/click.png" height="18">
    <a href="https://click.palletsprojects.com/">Click</a>
</h5>

The last third-party solution we're going to discuss here is the `click`  package. The library is closer to the common programmatic solutions to build arguments parsers. You need to explicitly write the parsing logic in the form of function decorators.

<script src="https://gist.github.com/devforfu/2bb9e1256e7edc09dd8cc9655178a599.js"></script>

The library is more verbose than the previous solutions but is also very flexible and powerful. It supports various arguments types, subcommands, passing the argument context from one decorated function into another, and many other convenient and helpful things.

Now when we discussed the possible alternatives to standard library solutions, let's check how the "native" Python's approach works, and what we can achieve using `argparse`.

<hr class="with-margin">
<h4 class="header" id="first-glance">The First Glance</h4>

Let's pick the same idea that was shown in the previous section and implement a simple CLI to generate scatter plots. We're going to start with basic usage of `argparse` capabilities and gradually increase the complexity to show more sophisticated behavior. The program we're going to write should do the following:
1. Accept a list of points
2. Render a scatter plot
3. Allow adjusting canvas properties
4. Save the result into one of the supported formats

The snippet below shows one possible implementation of the required capabilities.

<script src="https://gist.github.com/devforfu/552fa92e514d5f9ebde4fb3051503992.js"></script>

The lines 6-39 show arguments parsing logic. Here we explicitly define the expected types and properties of the arguments. The lines 41-50 implement a super simple scatter plot rendering logic.

There are a couple of interesting keyword arguments we use. The first of them is **dest**. By default, each parsed parameter is saved into an args object under the property with the same name. For example, if we have `-p` parameter, the parser stores it as `args.p`, or if there is the parameter called `--size`, it becomes `args.size` property. The **dest** keyword allows us to override this behavior and save the parsed parameter with a more verbose property name. Another one is called `metavar` and defines how the parser renders the help message. Again, the default choice is the name of a parameter. If the name is long, it could take a lot of screen space, so we're using shorter abbreviations to keep the help message less cluttered. Finally, the `choices` parameter allows us to define the parameters that can accept only values from a restricted set.

Probably we've written not the best scatter plots rendering programs ever, but it does what we need. Can we do something better here?

<hr class="with-margin">
### References

<ol>
  <li><a href=""></a></li>
  <li><a href=""></a></li>
</ol>
