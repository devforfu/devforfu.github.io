---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Using Python __new__ Method to Dynamically Switch Class Implementations"
tags: ['python', 'inheritance', 'magic', 'metaclass']
image: "new.png"
identifier: 1
---

Each Python object has a set magic of methods which could be overridden to
customize instance creation and behavior. One of widely used methods is
`__init__`, which is used to perform newly created instance initialization.
But there is one more magic method taking part in object creation, called `__new__`,
which is actually _creates_ class's instance. The post explains how to use
this method to dynamically switch implementation of class methods.

<!--more-->

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">General Information</h4>

The [Python language reference](https://docs.python.org/3/reference/datamodel.html#object.__new__)
explains the purpose of `__new__` method as being a special-cased static method that
takes the class `cls` of which an instance was required as its first argument which
should return the new object instance of that class.

One of the main differences of this method from `__init__` is that it actually
_creates a new instance_, not just binds its properties or makes some kind of
object tuning. Therefore, appropriately overridden, this method allows to
customize object creation process and, for example, switch actual implementation
of created.

This method allows one to create a "facade" class that declares interface, but
which implementation could be chosen at runtime, based on some criterion, i.e.
name of specific algorithm which is about to used, set of parameters, etc. This class
"hides" actual implementation and allows to use its name instead of hard-coding
a name of specific class. Talking about languages with static type systems,
one could compare (from logical point of view) this approach with coercing
specific object types to generic interface type and using it instead:

```Swift
public protocol StringConvertible {
    func toString() -> String
}

struct Color: StringConvertible {
  let r: Int
  let g: Int
  let b: Int  
  func toString() -> String {
      return "Color(r: \(r), g: \(g), b: \(b))"
  }
}

struct Point: StringConvertible {
  let x: Float
  let y: Float
  func toString() -> String {
      return "Point(x: \(x), y: \(y))"
  }
}

let convertibles: [StringConvertible] = [
    Color(r: 255, g: 0, b: 0),
    Point(x: 1.5, y: 2.5)
]
for object in convertibles {
    print(object.toString())
}
```

Next section shows a simple example which demonstrates one possible implementation
of described idea. Of course, the described example could be implemented in a lot
of different ways (i.e. callback parameter, direct inheritance, etc.), but the
main idea standing behind of this example is to show one of possible usages of
`__new__` method overriding.

<hr class="with-margin">
<h4 class="header" id="simple">Example: Temperature Converter</h4>

<blockquote class="tip">
<strong>TL;DR</strong>: For ones who doesn't not need too much explanations and want to navigate
right into code, here is <a href="https://gist.github.com/devforfu/1de5cecb96f92bd99ed595de7cdb7907">
a full content</a> of this example represented as a single Python file.
</blockquote>

Consider the following example: one need to create a family of temperature
converter classes which would be able to convert from [Kelvin temperature degrees](https://en.wikipedia.org/wiki/Kelvin) into different measurement scales.
All these classes should share the same set of methods, but apply different
temperature converting formulas.

Let's start with showing a use case of the code we're going to create. For example,
one could create a list of converters and apply them to a single temperature
like this:

```Python
def main():
    converters = [
        TemperatureConverter(convert_to=name)
        for name in ('celsius', 'fahrenheit')]
    temperature = 300
    for converter in converters:
        string = converter.format(temperature)
        print('%s converted %sK temperature into: %s' % (
            converter.name, temperature, string
        ))

if __name__ == '__main__':
    main()
```

Which should show the following output:
```bash
$ python main.py
CelsiusConverter converted 300K temperature into: 26.85 (°C)
FahrenheitConverter converted 300K temperature into: 80.33 (°F)
$ _
```

To implement dynamic algorithm dispatching using approach proposed in previous
section, one should create a base class with an overridden `__new__` method.
Below is shown a possible implementation of the base class which will be used to
instantiate different types of converters depending on value of `convert_to`
parameter:
<script src="https://gist.github.com/devforfu/828480bbfd9e12ef27d89dd96914f537.js"></script>

See lines **8-16** which shows how dynamic dispatching could be implemented. The
parameter `cls`, mentioned at the beginning of this post, is set to one of
specific converter classes. Then, an instance of that class is created. Lines
**18-20** show public `convert()` method that makes some basic sanity check
of provided temperature value and then calls "protected" method `_convert()` that
should be overridden in derived classes.

Now, it is time to write implementations of aforementioned specific classes. Note
that `_CelsiusConverter` class is written like one usually creates derived classes
in Python by explicit derivation from the base class. But `_FahrenheitConverter`
does not inherit from `TemperatureConverter` and is registered as a subclass via
`ABCMeta.register` method (line **37**). Though in this case, as soon as classes are not related,
default implementations of required methods are not available anymore and should
be written from scratch.

<script src="https://gist.github.com/devforfu/eeab965f571517b2645a839768a2469a.js"></script>

This example shows flexibility of duck typing where one could write their own
classes and plug-in them it into hierarchy. Just need to be sure that `__new__`
method can handle appropriately adding side extensions, i.e. use some
kind of registry or lookup instead of implicit enumeration of all cases using
`if-else` clauses. Also, one could override `__init__` magic methods in derived
classes to allow custom arguments, specific for their computations logic.
The following section uses dictionary lookup instead of hardcoding class names
and specific initializers.


<hr class="with-margin">
<h4 class="header" id="notifications">Dictionary Lookup of Registered Classes</h4>

<blockquote class="tip">
<strong>TL;DR</strong>: Again,
<a href="https://gist.github.com/devforfu/63fa7efe18133dc12f12a2e9ecbe9db4">
here is a link</a> to the source code discussed below.
</blockquote>

This example shows almost the same approach as previously, but with more realistic
example I had in practice. Consider one needs to implement a class that would
extract user's notification messages from server. But before implementing actual
server API (and later for purposes of brining new functionality and running
regression tests) one wants to build a testing implementation which reads locally
stored file with notifications and returns its content parsed into appropriate
format. Then, to switch between two different implementations, one just needs to pass
different configuration dictionaries like `NotificationsDispatcher(**test_config)`
to create an appropriate dispatcher's instance.

The base notification dispatcher class could be implemented as follows:

```Python
class NotificationsDispatcher(metaclass=abc.ABCMeta):
    """
    Class that retrieves a list of notifications for a specific user.
    Usually, notifications are retrieved from the remote server, but for testing
    purposes and local runs it supports reading messages from local source.
    """

    def __new__(cls, user_id: int, method: str='http', **kwargs):      
        if issubclass(cls, NotificationsDispatcher):
            cls = get_dispatcher(method)
        return object.__new__(cls)

    def __init__(self, user_id: int, dateformat='%m/%d/%Y %H:%M:%S', **kwargs):
        self.user_id = user_id
        self.dateformat = dateformat

    @abc.abstractmethod
    def get_notifications(self):
        pass
```

See that this time, as it was already noted, instead of exhaustive
`if-else` chain we use a helper function that looks up `method` name in registry
and returns appropriate class object (if it exists). This approach allows to write
 plugins in some other modules and register them via publicly exposed interface:

```Python
# somewhere dictionary of dispatchers exists
from weakref import WeakValueDictionary
_dispatchers = WeakValueDictionary()

def get_dispatcher(name):
    """
    Public API to access dictionary with registered dispatchers.
    """
    if name not in _dispatchers:
        raise ValueError('dispatcher with name \'%s\' is not found' % name)
    return _dispatchers[name]

def register_dispatcher(name, cls):
    """
    Public API which is used to register new dispatcher class.
    """
    global _dispatchers
    _dispatchers[name] = cls

register_dispatcher('local', _LocalDispatcher)
register_dispatcher('http')
```

Also, as it is shown [here](https://gist.github.com/devforfu/63fa7efe18133dc12f12a2e9ecbe9db4#file-new_involved-py-L58) and [there](https://gist.github.com/devforfu/63fa7efe18133dc12f12a2e9ecbe9db4#file-new_involved-py-L92),
one could override `__init__` methods to accept different set of arguments, depending on actual class's implementation. For example, local notifications dispatcher requires filename, but remote one
requires server URL.



<hr class="with-margin">
<h4 class="header" id="pandas">Real World Example from Pandas Library</h4>

In conclusion of this discussion, a real world example of described technique could be found in [Pandas library repository](https://github.com/pandas-dev/pandas/blob/master/pandas/io/excel.py#L853-L875).
In the library, there are a couple of classes responsible for writing dataframes
into Excel files. The abstract class called `ExcelWriter`, which simplified conceptual
representation is shown below, overrides `__new__` method to pick an appropriate
Excel writing library depending on provided file extension, i.e. **.xls** or
**.xlsx** format:

```Python
class ExcelWriter(meta=abc.ABCMeta):
    """
    A simplified version of pandas.ExcelWriter __new__ implementation.
    """

    def __new__(cls, path, engine=None, **kwargs):
        if subclass(cls, ExcelWriter):
            if engine is None:
                ext = 'xlsx'
            try:
                engine = config.get_option('io.excel.%s.writer' % ext)
            except KeyError:
                raise ValueError('No engine for filetype: %s' % ext)
            cls = get_writer(engine)
        return object.__new__(cls)

    @abc.abstractproperty
    def engine(self):
        pass

    @abc.abstractmethod
    def write_cells(self, cells, sheet_name=None, startrow=0, startcol=0,
                    freeze_panes=None):
        pass

    # other interface methods and properties ...
```

<hr class="with-margin">
<h4 class="header" id="conclusion">Conclusion</h4>

A dynamic nature of Python's type system allows not only to override methods
and bind new attributes to object, but also to completely substitute appropriate
class implementation in runtime based on configuration parameters. Quite often
the same result could be achieved using composition instead of inheritance or
using callback functions. But, if used appropriately, the discussed approach allows to
clearly separate different implementations from each other while keeping same interface
and class name, switching only configuration parameters.

<hr class="with-margin">
### References

<ol>
  <li><a href="https://docs.python.org/3/reference/datamodel.html">Python Data Model Documentation</a></li>
  <li><a href="https://github.com/pandas-dev/pandas">Pandas Repository</a></li>
</ol>
