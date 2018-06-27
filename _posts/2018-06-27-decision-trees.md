---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Classifying Quantized Dataset with Random Forest Classifier (Part 2)"
tags: ['python', 'ensemble', 'trees', 'numpy']
image: "decision_tree_2.png"
identifier: 4
---

In this post, we're going to finish the work started in the previous one and
eventually classify quantized version of
[Wrist-worn Accelerometer Dataset](https://archive.ics.uci.edu/ml/datasets/Dataset+for+ADL+Recognition+with+Wrist-worn+Accelerometer).
There are many ways to classify datasets with numerical features, but
Decision Tree is one of the most intuitively understandable ones and simple it
its underlying implementation. We are going to build a _Decision Tree_
classifier using **Numpy** library and generalize it to
_Random Forest_ &mdash; an ensemble of randomly generated trees, which is
less prone to data noise.

<!--more-->

<blockquote class="tip">
<strong>TL;DR:</strong> As always, here is
<a href="https://github.com/devforfu/Blog/tree/master/trees">a link</a> to
the repository with solutions implementing
<a href="https://github.com/devforfu/Blog/blob/master/trees/decision_tree.py">Decision Tree</a>
and <a href="https://github.com/devforfu/Blog/blob/master/trees/ensemble.py">Random Forest</a>
classifiers, as well as their applying to the accelerometer dataset.
</blockquote>

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">Decision Trees</h4>

**A decision tree** is a classifier expressed as a recursive partition of the analyzed dataset. Mathematically speaking, it represents a function that takes as input a vector of attribute values and returns a "decision" --- a single output value. The tree reaches its decision by performing a sequence of tests on given observation attributes. Each internal node in the tree corresponds to a test of the value of one of the observation's attributes, $$A_i$$, and the branches from the node are labeled with the possible values of the attribute, $$A_i = v_{ik}$$. Each leaf node in the tree specifies a value to be returned by the function.

However, in the post, we're describing a bit simplified version of this general conception. **Figure 1** shows a graphical representation of a decision tree classifier we're going to implement. This specific tree was trained on
[Wine Dataset](https://archive.ics.uci.edu/ml/datasets/wine). The dataset is exceptionally tiny and contains only **178 instances**, each belongs to one of **3 classes**. These properties make it an ideal candidate for a
[smoke or sanity test](https://www.guru99.com/smoke-testing.html) when developing machine learning code. Even the simplest classifier
should show excellent performance on it, and the training process is very very fast. In our case, each node has two branches only and makes
its decision comparing attribute, like, _Magnesium_, with a threshold value. Therefore, even for continuous attributes, each node performs a binary classification task.

![TreeExample](/assets/img/decision_tree/tree_example.png){: .center-image}
<em class="figure">Fig 1. An example of decision tree trained on Wine Dataset</em>

The figure gives a clue why the considered method of classification contains word "tree" in its name. The decision process constitutes the following branches of the directed acyclic graph depending on values of a classified observation's attributes.

<blockquote class="tip">
  <strong>Note:</strong> The pseudocode that goes below is nor a standard
  definition of Decision Tree algorithm, neither a novel implementation. It is
  intended to provide a <em>concise</em> and <em>intuitively clear</em>
  explanation of the generic idea which I would like to have when started
  working on my implementation. Here is
  <a href="http://hunch.net/~coms-4771/quinlan.pdf">a link</a> to one of the
  original papers on decision trees.
</blockquote>

Now when we've seen a visual representation of a trained classifier, the question is Now when we've seen a visual representation of a trained classifier, the question is how can the training process be formally represented? As was already mentioned, we're discussing one of the purest versions of Decision Tree algorithm implementation, as the pseudocode below shows:

<blockquote class="algo">
  `DecisionTree(D, depth):`
  <ul class="list-unstyled with-padding top-offset">   
    <li>If `depth` is greater then some predefined threshold:</li>
    <li>
      <ul class="list-unstyled">
        <li><strong>return</strong> `Majo\rityClass(D)`</li>
      </ul>
    </li>
    <li>If `D` is empty:</li>
    <li>
      <ul class="list-unstyled">
        <li><strong>return</strong> `Nil`</li>
      </ul>
    </li>
    <li>`bestSplit \leftarrow Nil`</li>
    <li>For each `feature` in `Features(D)`:</li>
    <li>
      <ul class="list-unstyled">
        <li>For each `value` in `feature` column of dataset `D`:</li>
        <li>
          <ul class="list-unstyled">
            <li>`split \leftarrow` all samples where `sampl\e[feature] \le value`</li>
            <li>`quality \leftarrow Quality(split, D, Classes(D))`</li>
            <li>If `quality` is the best among all tried splits:</li>
            <li>
              <ul class="list-unstyled">
                <li>`bestSplit \leftarrow split`</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Split dataset `D` according to `bestSplit` into `Left` and `Right` subsets</li>
    <li>`l\eftChild \leftarrow DecisionTree(Left, depth + 1)`</li>
    <li>`rightChild \leftarrow DecisionTree(Right, depth + 1)`</li>
    <li>`node \leftarrow CreateNode(l\eftChild, rightChild)`</li>
    <li><strong>return</strong> `node`</li>
  </ul>
</blockquote>

We're building a decision tree by recursively splitting
the dataset into two subsets based on the values of its attributes. One of the
crucial algorithm points is the call of the $$Quality$$ function that estimates
how "good" (regarding the classification accuracy) the partition is. Note that
we also **limiting a depth** of a tree. Otherwise, we could get a very deep
trees with just a few observations per node. Therefore, as soon as we're reaching
a maximal depth, we are returning the most frequent class of the subset.

There are several possible quality metrics. One of this metrics is called [Gini impurity](https://en.wikipedia.org/wiki/Decision_tree_learning#Gini_impurity)
score and is defined by the formula:

$$
Gini(D, C) = N \times \left[ 1 - \sum_{c_j \in C}\left(\frac{1}{N}\sum_{y_i \in D}{I(y_i = c_j)}\right)^2 \right]
$$

Where $$N$$ is a total number of samples in the dataset $$D$$, and $$I$$ denotes an
indicator variable which is equal to $$1$$ when $$j$$th instance's class is equal
to $$c_j$$, and is equal to $$0$$ --- otherwise.

As it follows from the definition below, the Gini score shows _how impure_
the split is, i.e., the higher score, the worse a specific split, i.e., the more
various classes are represented in the child nodes after a split. Therefore,
this metric is opposite of quality, and our goal is to achieve the lowest possible
Gini score when splitting a parent node.

In the next section we're going to build a simple decision tree implementation
which works with continuous attributes.

<hr class="with-margin">
<h4 class="header" id="basic-implementation">Decision Tree Implementation with Numpy</h4>

The snippet below shows a simple implementation of Decision Tree learning
algorithm. There are a few other improvements shown in the Python script that
are not present in the pseudocode discussed below.

<script src="https://gist.github.com/devforfu/8dbea8a4a011347ede57a0abff6534e6.js"></script>

The code is mostly self-explanatory, but there are a couple of tips. First of
all, reaching the maximally allowed depth is not the only considered "shortcut"
condition. In lines **87-90** we're also checking if all observations belong
to a single class and if the node contains a too few observations to be split
again. Second, the implementation doesn't split the original 2D array into
smaller arrays but operates with indexes instead. Finally, the tree learning
function provides an opportunity to use only a subset of features to build
the tree. Why do we need such functionality? Isn't it better to always use
all available attributes of the data? The reason is described in the next section.

<hr class="with-margin">
<h4 class="header" id="ensemble">Ensemble Methods and Random Forests</h4>

Ok, now we have an implemented classifier and can use it to classify various
dataset. However, what's going on if we try to train a tree on various subsets
of the original dataset? **Figure 2** shows decision trees trained on
three distinct random splits of the dataset.

![TreeExample](/assets/img/decision_tree/trees.png){: .center-image}
<em class="figure">Fig 2. Group of decision trees trained using different dataset splits</em>

Despite that the root nodes are almost equal, the trees are a bit different in
their leaves and inner nodes. It means that you're going to get different
classification results with each new random generator seed. Moreover,
classifier's accuracy quite significant changes from one tree to another.
The reason directly follows from the tree's construction process. When
taking various subsets of the original dataset, we're effectively changing
a list of considered feature values when building nodes. Therefore, each
time we have a bit different Gini score and different best split.

How can we alleviate this issue? One of the possible solutions is to build
several of trees and average their predictions. The theoretical
foundation of this result comes from the theorem about
[weak learners](https://www.quora.com/What-is-a-formal-definition-of-%E2%80%9Cweak-learner%E2%80%9D-and-an-intuitive-explanation-of-it).
Briefly speaking, the idea is that if one has a classifier that
performs a bit better then a random one (like, better then a fair
coin in case of binary classification data), then having a sufficient
number of such weak classifiers would be able to predict classes with
almost perfect accuracy. Strictly speaking, to apply the theorem, the dataset
samples should meet a requirement of being **independent and identically
distributed** random variables, and the distribution where samples
come from shouldn't change much. Nevertheless, this approach works reasonably
well in practice if each classifier's training process a bit differs from
another one.

So now it is time to answer the question we've stated in the previous
section: _Why to build a tree using only a subset of features?_ To make
trees as different from each other as possible. In this case, each
of trees makes different kinds of mistakes and together,
and when averaged they could give us better accuracy than one by one.

The idea of the joining a group of weak learners into a single strong one
could be applied to any kind of classifier, not only to the Decision Tree.
In cases when this approach is applied to a group of trees,
the strong learner is called **Random Forest**.

The snippet below shows a simple wrapper build on top of our decision tree
implementation which creates a bunch of decision trees and provides a few
convenience methods for making predictions:

<script src="https://gist.github.com/devforfu/fa4ecd2b5805018dfe8971cd3d12250b.js"></script>

Lines **28-36** create an array of decision trees. Each one is trained on
a bootstrapped sample of the original dataset. Lines **46-66** define the method
called `predict_proba()`, returning a matrix with classes occurrence
frequencies based on trees predictions. Other methods and utilities serve for
convenience purposes. The standalone implementation of the classifier and
helping utilities can be found [here](https://github.com/devforfu/Blog/blob/master/trees/ensemble.py).

Now we're ready to join everything described in this post together and apply
our DIY classifiers to the Wrist-worn Accelerometer Dataset.

<hr class="with-margin">
<h4 class="header" id="dataset">Accelerometer Dataset Classification</h4>

As we know from the previous post, the accelerometer dataset is not prepared to
be directly fed into a classical supervised learning algorithm that expects an
array with samples $$X$$ and an array with targets $$y$$. Therefore, the first step is
to apply the dataset quantization algorithm. Then, we need to convert targets
from strings into numerical values. Next, we split the quantized dataset into
training and validation subsets. Finally, we're training an instance of
Random Forest classifier on the training subset and checking its performance
on validation subset.

The snippet below shows all these steps. An interested reader could also check
this [Jupyter notebook](https://github.com/devforfu/Blog/blob/master/trees/accelerometer.ipynb)
that contains the same steps, and could be used as a playground to investigate
separate steps of our pipeline.

<script src="https://gist.github.com/devforfu/5ead7fa9d04c0bb26d827c5f95ebaaff.js"></script>

A question that one would ask when using an ensemble classifier is how many weak
learners do we need to use to achieve the best possible performance? One way to
know is to add classifiers one after another to the ensemble and check the
ensemble's performance. **Figure 3** shows a plot reflecting dependency between a
logarithm of the number of trees N in ensemble and validation accuracy measured
in percents. The $$N$$ value is varied from $$1$$ to $$1000$$. Each orange dot
reflects an accuracy for a specific N value, and the blue curve is a polynomial
approximation of these discrete measurements.

![Accuracy](/assets/img/decision_tree/log_acc.png){: .center-image}
<em class="figure">Fig 3. Relationship between ensemble accuracy and its size</em>

We're getting approximately **47%** accuracy on the validation subset with  **14** classes,
and we can claim that our classifier successfully grasps relationships between
samples and targets, performing much better than a random guess.

As the curve shows, we're getting a significant accuracy increase when going
from a single tree to several dozens of trees. However, the ensemble accuracy
has the boundary: the accuracy slowly stops increasing when the number of trees
reaches several hundred. To get better results we could try to randomize
training process even more or gather extra data.

<hr class="with-margin">
<h4 class="header" id="outro">Conclusion</h4>

Decision trees and their ensembles are intuitively clear but powerful machine
learning techniques. There are many improvements to the original algorithm and
a bunch of great libraries that allow training trees ensembles in parallel
fashion and getting higher accuracy, like, an excellent library called
[XGBoost](https://github.com/dmlc/xgboost). Nevertheless, even a naïve
implementation shows decent results and proofs that it is not too challenging
to implement a machine learning classifier from scratch.
