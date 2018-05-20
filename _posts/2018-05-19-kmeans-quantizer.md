---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Using K-Means clustering to Quantize Dataset Samples (Part 1)"
tags: ['python', 'kmeans', 'numpy', 'sklearn']
image: "kmeans.png"
identifier: 3
---

Clustering algorithms are used to analyze data in unsupervised fashion, in
cases when labels are not available or to get new insights about dataset
distribution. K-Means is one of the oldest clustering algorithms developed
several decades ago, but still used in Machine Learning tasks. One of the ways
to use this algorithm is to apply it for _vector quantization_, a process which
maps vectors of arbitrary length. In this post I am going to show simple
implementation of K-Means and apply it to
[Wrist-worn Accelerometer Data Set](https://archive.ics.uci.edu/ml/datasets/Dataset+for+ADL+Recognition+with+Wrist-worn+Accelerometer)

<!--more-->

<blockquote class="tip">
<strong>TL;DR:</strong> Everyone who doesn't need verbose explanations and
prefer to read code instead could use the following link to navigate right into
the repository with vectors quantization implementation.
</blockquote>

<div class="list-of-contents">
  <h4>Post contents</h4>
  <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="intro">K-Means Algorithm</h4>

K-means clustering is a simple and elegant approach for partitioning a dataset
into **K** distinct, non-overlapping clusters. The algorithm implementation
could be represented using the following pseudocode:

<blockquote class="algo">
  <ol>    
    <li>
      Assign random labels from range `1...K` to each observation in
      dataset to get an initial partitioning.
    </li>
    <li>
      For each of `K` clusters, compute the cluster <em>centroid</em> which is
      the vector of <em>p</em> feature means for the observations in the
      <strong>k-th</strong> cluster. (In other words, each cluster's centroid is
      an average of vectors assigned to the cluster).
    </li>
    <li>
      Assign each observation to the cluster whose centroid is closest in
      terms of <em>Euclidian distance</em> metric.
    </li>
    <li>If clusters assignment was changed, go to <strong>step 2</strong></li>
    <li>Return calculated cluster centroids and assigned labels.</li>
  </ol>
</blockquote>

Note that the algorithm uses Euclidean metric to measure similarity between
data points. It means that each dimension is considered to be **equally important**
to differentiate one sample from another. Therefore, it is crucial to normalize
your dataset before running the algorithm.

Also, due to the random generation of initial centroids, it is a good idea to
run the algorithm several times and choose the best clusters assignment. Which
assignment is the best? For this purpose one could use an **inertia metric**,
which is the total distance from samples to their clusters's centroids:

![Clustering](/assets/img/clustering.gif){: .center-image}
<em class="figure">Figure 1. K-Means clustering of dummy dataset with K=5</em>


Measure of clustering quality which shows how close dataset observations are to
centers of their clusters:

$$
I = \sum_{j = 1}^{K}{ \sum_{\substack{i = 1 \\ x_i \in C_j}}^{N}{ d(x_i, c_j)} }
$$

Where $$K$$ is number of clusters, $$N$$ &mdash; number of observations,
$$C_j$$ is set of observations belonging to cluster $$j$$ and $$c_j$$ is centroid
of $$j$$-th cluster.

Before being used in data mining for cluster analysis, the algorithm was originally
used in the field of signal processing as a method of vectors quantization.

<hr class="with-margin">
<h4 class="header" id="implementation">Implementation with NumPy</h4>

<hr class="with-margin">
<h4 class="header" id="quantization">Vectors Quantization</h4>

<hr class="with-margin">
<h4 class="header" id="casestudy">Applying K-Means to Accelerometer Data</h4>

<hr class="with-margin">
<h4 class="header" id="conclusion">Conclusion</h4>


<hr class="with-margin">
### References

<ol>
  <li><a href=""></a></li>
  <li><a href="https://en.wikipedia.org/wiki/K-means_clustering">k-means clustering Wikipedia article</a></li>
</ol>
