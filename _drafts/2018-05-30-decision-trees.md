---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Classifying Quantized Dataset with Random Forest Classifier (Part 2)"
tags: ['python', 'ensemble', 'trees', 'numpy']
image: "decision_tree_2.png"
identifier: 4
---

In this post we're going to finish the work started in the previous one and
eventually classify quantized version of [Wrist-worn Accelerometer Dataset](https://archive.ics.uci.edu/ml/datasets/Dataset+for+ADL+Recognition+with+Wrist-worn+Accelerometer). There is a lot of ways to classify datasets with numerical features, but
 _Decision Tree_ is one of the most intuitively understandable ones and simple
 in basic implementation.  We'll build a Decision Tree classifier using
 **Numpy** library and generalize it to _Random Forest_ &mdash; an ensemble of
randomly generated trees, which is less prone to data noise.

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

<hr class="with-margin">
<h4 class="header" id="ensemble">Ensemble Methods and Random Forests</h4>

<hr class="with-margin">
<h4 class="header" id="dataset">Accelerometer Dataset Classification</h4>

<hr class="with-margin">
<h4 class="header" id="outro">Conclusion</h4>
