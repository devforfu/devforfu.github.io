---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "How to Build a Flexible CLI with Standard Python Library"
tags: ['python', 'argparse', 'cli']
image: "cli.png"
identifier: 5
---

The Python programming language is quite often used to write various CLI-based utilities and automation tools. There are plenty of third-party libraries that make this process very easy and straightforward. However, recently I've realized that very often I use the good old `argparse` when writing my snippets, and also there are lots of legacy code that utilizes this package. That's why I've decided to create a single reference point for myself showing how to use it. In this post, we are going to take a close look at the library and gradually build a simple CLI to generate plots with `matplotlib` library.

<!--more-->

<blockquote class="tip">
<strong>TL;DR:</strong> Please refer to <a href="https://gist.github.com/devforfu/f7a01e74acfffb63d2957d6231f08285">this gist</a> to find the final version of
program we're going to develop.
</blockquote>

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
<h4 class="header" id="types">Checking Types</h4>

As you could spot at line **41**, we convert raw string argument into a list of real-valued points. Also, line **42** converts canvas size from a string into a tuple. These fragments of code don't have too much relation to our rendering logic. We have only too of them, but more sophisticated programs could include more, and having these additional post-processing lines of code not very convenient.

The `argparse` addresses this issue with a specific keyword parameter called `type` that accepts an arbitrary callable responsible for converting raw strings into concrete types. We can pass built-in type constructors here, like `int` or `float`, or our custom parsing functions. Let's do the later and convert points and canvas size into appropriate types. The snippet below shows an example of how to do so.

<script src="https://gist.github.com/devforfu/bbdb24d107cd818e33e2477657ed6e38.js"></script>

The critical difference from the previous snippet is lines **9** and **15**, as well as custom type functions defined at lines **54** and **69**. The functions take the single argument&mdash;string-typed parameter parsed from the command line. Then we verify that the parameter has a valid format, and convert it into an appropriate type. The `ArgumentTypeError` exception is raised when something goes wrong, and the parser reports about the issue.

```Bash
$ python typecheck.py -p 1 2 3 4 5 6
usage: typecheck.py [-h] -p PTS [-sz SZ] [-f FMT] [-o OUT] [--hide-axes]
                    [--show-grid]
typecheck.py: error: argument -p/--points: should have format: 1,2;2,3;3,4
$ python typecheck.py -p "1,2;3,4;5,6" --size 22
usage: typecheck.py [-h] -p PTS [-sz SZ] [-f FMT] [-o OUT] [--hide-axes]
                    [--show-grid]
typecheck.py: error: argument -sz/--size: should have format: 3x4
```

Great, now we have a parser that is aware of our domain-specific types and shows an informative message when something goes wrong.

<hr class="with-margin">
<h4 class="header" id="subcommands">Subcommands</h4>

Now our plotter can only read the input from the terminal. It would be great to add support of additional input sources, for example&mdash;JSON files. We can define all rendering parameters within a single file instead of passing them as CLI parameters. The only parameter we need here is a path to the JSON file. However, in our current implementation, the `points` parameter is required, as soon as the renderer which reads its parameters from the terminal cannot do its work without at least point. We don't need this parameter in case of JSON. How can we make so that the parser can handle both these cases smoothly without any hacking with parameters? The answer is subcommands.

The `argparse` allows you to build not only a single god-object like parser that includes every possible parameter but define _a hierarchy of parsers_ instead where each parser is only responsible for the set of arguments for relevant its command. The code says more than thousands of words. The below snippet shows how we can implement such a hierarchical parser.

<script src="https://gist.github.com/devforfu/1760a3e9c94c45ad04d9a94e9eece2a0.js"></script>

We've reordered our code a bit, but the major difference is lines **45**, **52**, and **81**.
The line **45** shows how to create a subgroup of commands attached to the main parser. (The parameters defined in lines **33-43** become common for all the subcommands we're going to define). The lines **52** and **81** add sub-parsers for each input source, namely, standard input and a JSON file. It is also worth to note lines **53** and **83**. They allow us to distinguish one subcommand from another. We use this default parameter in lines **11-14** to pick an appropriate set of parameters from the parser.

<hr class="with-margin">
<h4 class="header" id="help">Customized Help Message</h4>

We've explored most of the helpful tricks that we can use to build a flexible and convenient CLI. The only thing we probably would cover is the help message formatting. First of all, by default, the package uses a specific formatting style. For example, it ignores newline characters in the strings we put under `help` keywords in `add_argument`  method calls. Another thing is `-h/--help`  parameter that is added automatically when the parser object is created. If you have a parameter that starts with H letter, like `-h/--host`, you can't use a shortcut version of it because it is already taken by help command. Finally, when a user makes a mistake and passes the wrong parameters or keywords, we could show a full program usage message with some examples instead of telling about a mistake in that specific parameter only. (Which is the behavior of `argparse` by default). The snippet below shows the changes we need to introduce into our program to address all these issues.
```Python
# create custom parser
parser = CustomParser(
    description=__doc__,
    formatter_class=argparse.RawTextHelpFormatter,
    add_help=False
)

...

# somewhere in the code
class CustomParser(ArgumentParser):

    def error(self, message):
        self.print_help()
        sys.exit(1)
```

You can find the final version of the program we've written with all the changes
by following [this link](https://gist.github.com/devforfu/f7a01e74acfffb63d2957d6231f08285).

<hr class="with-margin">
<h4 class="header" id="theend">Conclusion</h4>

There are plenty of command-line parsing packages written for the Python language. Some of them are intended to wrap your classes and functions with CLI quickly. Others are more involved and give you a sophisticated solution. Nevertheless, the standard `argparse` module is still very helpful and the most portable solution. As soon as you've learned its capabilities and tricks, it becomes a universal and straightforward tool to write CLI scripts with various levels of complexity.


<hr class="with-margin">
### References

<ol>
  <li><a href="https://docs.python.org/3/library/argparse.html">The official argparse documentation</a></li>
  <li><a href="https://github.com/Kaggle/kaggle-api/blob/master/kaggle/cli.py">Kaggle official CLI</a></li>
  <li><a href="https://github.com/tensorflow/models/blob/d32d957a02f5cffb745a4da0d78f8432e2c52fd4/research/tensorrt/tensorrt.py#L496">An example from the Tensorflow repository</a></li>
</ol>
