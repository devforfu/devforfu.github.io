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
<strong>TL;DR:</strong> Implementation link.
</blockquote>

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">Decision Trees</h4>

**A decision tree** is a classifier expressed as a recursive partition of the
analyzed dataset. Mathematically speaking, it represents a function that takes
as input a vector of attribute values and returns a "decision" &mdash; a single
output value. The tree reaches its decision by performing a sequence of tests.
Each internal node in the tree corresponds to a test of the value of one of
the input attributes, $$A_i$$, and the branches from the node are labeled with
the possible values of the attribute, $$A_i = v_{ik}$$. Each leaf node in the
tree specifies a value to be returned by the function.

**Figure 1** shows an example of a decision tree classifier, trained on the
[Wine Dataset](https://archive.ics.uci.edu/ml/datasets/wine). The dataset is
tiny and contains only **178** instances, each belongs to one of
**three** classes. These properties make it an ideal candidate for a
[smoke or sanity test](https://www.guru99.com/smoke-testing.html) when
developing machine learning code. Even the simplest classifier should show
a good performance on it, and the training process is very very fast.

![TreeExample](/assets/img/decision_tree/tree_example.png){: .center-image}
<em class="figure">Fig 1. An example of decision tree trained on Wine Dataset</em>

The figure gives a clue why this method of classification contains word "tree"
in its name. The decision process constitutes the following branches of the
tree depending on values of classified instance attribute.

<blockquote class="tip">
  <strong>Note:</strong> The pseudocode below is nor a standard definition
  of Decision Tree algorithm, neither a novel implementation. It is intended
  to provide a <em>concise</em> and <em>intuitively clear</em> explanation of
  the generic idea which I would like to have when started working on my
  implementation. A few textbooks and papers I've read provide much more
  rigorous, but a bit too convoluted definitions.
</blockquote>

<blockquote class="algo">
  `DecisionTree(D):`
  <ul class="list-unstyled with-padding top-offset">   
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
        <li>`split \leftarrow` all samples where `sampl\e[feature] \le Mean(D, feature)`</li>
        <li>`quality \leftarrow Quality(split, Classes(D))`</li>
        <li>If `quality` is the best among all tried splits:</li>
        <li>
          <ul class="list-unstyled">
            <li>`bestSplit \leftarrow split`</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>Split dataset `D` according to `bestSplit` into `Left` and `Right` subsets</li>
    <li>`l\eftChild \leftarrow DecisionTree(Left)`</li>
    <li>`rightChild \leftarrow DecisionTree(Right)`</li>
    <li>`node \leftarrow CreateNode(l\eftChild, rightChild)`</li>
    <li><strong>return</strong> `node`</li>
  </ul>
</blockquote>



In general, each node of the decision tree could have several branches and can
compare not only numerical but categorical attributes as well. We are
discussing one of the purest versions of Decision Tree implementation which
works with numerical real-valued attributes only and has at maximum two
possible decision branches in each node.

<hr class="with-margin">
<h4 class="header" id="ensemble">Ensemble Methods and Random Forests</h4>

<hr class="with-margin">
<h4 class="header" id="dataset">Accelerometer Dataset Classification</h4>

<hr class="with-margin">
<h4 class="header" id="outro">Conclusion</h4>
