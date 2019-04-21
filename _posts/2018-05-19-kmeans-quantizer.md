---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Using K-Means Clustering to Quantize Dataset Samples (Part 1)"
tags: ['python', 'kmeans', 'numpy']
image: "kmeans.png"
identifier: 3
---

Clustering algorithms are used to analyze data in an unsupervised fashion, in
cases when labels are not available or to get new insights about the dataset.
The K-Means algorithm is one of the oldest clustering algorithms developed
several decades ago but still applied in Machine Learning tasks. One of the ways
to use this algorithm is to apply it for _vector quantization_, a process which
allows reducing the dimensionality of analyzed data. In this post, I'm going to
implement a simple implementation of K-Means and apply it to [Wrist-worn Accelerometer Dataset](https://archive.ics.uci.edu/ml/datasets/Dataset+for+ADL+Recognition+with+Wrist-worn+Accelerometer).

<!--more-->

<blockquote class="tip">
<strong>TL;DR:</strong> Everyone who doesn't need verbose explanations and
prefers to read the code instead could use <a href="https://github.com/devforfu/Blog/tree/master/kmeans">
this link</a> to navigate right into the repository with vectors quantization implementation.
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
      <strong><em>k</em></strong>th cluster. (In other words, each cluster's centroid is
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

Note that the algorithm uses the Euclidean metric to measure the similarity between
data points. It means that each dimension is considered to be **equally important**
to differentiate one sample from another. Therefore, it is crucial to normalize
your dataset before running the algorithm.

**Figure 1** shows an animated process of K-Means clustering of a randomly
generated dataset, where each cluster is rendered with a different color.
While the algorithm iterates through its loop, centroids slowly change their
positions until there is no re-assignments anymore.

![Clustering](/assets/img/clustering.gif){: .center-image}
<em class="figure">Fig 1. K-Means clustering of dummy dataset with K=5</em>

Due to the random generation of initial centroids, it is a good idea to
run the algorithm several times and choose the best clusters assignment. Which
assignment is the best? For this purpose one could use an **inertia metric**,
which is the total distance from samples to their clusters's centroids:

$$
I = \sum_{j = 1}^{K}{ \sum_{\substack{i = 1 \\ x_i \in C_j}}^{N}{ d(x_i, c_j)} }
$$

Where $$K$$ is a number of clusters, $$N$$ &mdash; a number of observations,
$$C_j$$ is a set of observations belonging to cluster $$j$$ and $$c_j$$ is centroid
of $$j$$th cluster. This measure of clustering quality which shows how close
dataset observations are to the centers of their clusters.

In next section, we're going to implement K-Means clustering using `numpy` library.

<hr class="with-margin">
<h4 class="header" id="implementation">Implementation with NumPy</h4>

The full source code with K-Means clustering implementation could be found
via [this link](https://github.com/devforfu/Blog/blob/master/kmeans/kmeans.py).
In this section let's highlight the main keypoints of the algorithm.

To implement the main loop of K-Means clustering we need a function that accepts
a dataset, a number of clusters $$K$$, and a couple of additional
parameters to specify how many restarts of algorithm do we want to perform to
find the best clustering assignment:

<script src="https://gist.github.com/devforfu/43e1a43054bd22081b71083d66ca0464.js"></script>

A dataset normalization required only to subtract the mean of dataset values
from each of samples and divide them by standard deviation. To generate random
centroids we can use one of the random generators from `numpy.random` module.
Calculating an inertia metric is also quite simple using `numpy` and its
filtering and linear algebra functions:

<script src="https://gist.github.com/devforfu/37642a7caddc5f38fba331895d6356e7.js"></script>

Before proceeding to quantization algorithm, here is an important remark. Despite
the fact that the implementation of K-Means algorithm provided in this post's
repository is totally functional and does its job, it is quite far away from the
production-ready code.

Check [this link](https://github.com/scikit-learn/scikit-learn/blob/master/sklearn/cluster/k_means_.py)
from scikit-learn library showing handling various edge cases and making code
much faster than naïve implementation, including [fragments](https://github.com/scikit-learn/scikit-learn/blob/master/sklearn/cluster/_k_means.pyx)
written in [Cython](http://cython.org/) for higher performance.

<hr class="with-margin">
<h4 class="header" id="quantization">Vectors Quantization</h4>

Before being used in data mining for cluster analysis, the algorithm was originally
used in the field of signal processing as a method of **vectors quantization** (VQ).
VQ is a data reduction method which means that it seeks to reduce the number
of dimensions in the input data so that the models used to match unknowns can
be as simple as possible.

Quantization allows transforming continuous values into discrete buckets. **Figure 2**
shows a 2D plane filled with **blue** dots representing values of random continuous
real vectors. To discretize this space into a finite number of buckets one could
plot a grid on top of the plane with blue dots and replace each blue dot with a **red**
one which is the center of a grid cell where the blue dot falls.

![Quantization](/assets/img/dots.png){: .center-image}
<em class="figure">Fig 2. Continuous 2D points discretized into buckets</em>

The K-Means algorithm allows us to do exactly this. Each centroid vector could
be treated as a center of a "grid cell", and can be used as a "discretized"
representation of vectors in proximity. But in case of K-Means, quantized
vectors could have much more dimensions and the "cells" are not in 2D, but
generally in $$N$$-dimensional space.

Next section shows how this idea can be used to convert observation vectors of
arbitrary length into fixed-size feature vectors.

<hr class="with-margin">
<h4 class="header" id="casestudy">Applying K-Means to Accelerometer Data</h4>

Consider the following use case. You have a dataset with accelerometer
measurements. Each measurement is saved into a separate text file and is
represented by a sequence of $$(x, y, z)$$ coordinates. Also, each measurement
belongs to one of $$M$$ activity types, like $$PourWater$$ or $$Walk$$. To convert
this dataset into something suitable for a machine learning algorithm
(SVM, decision tree, logistic regression or anything else), one needs to read
measurements from files and concatenate their coordinates into feature vectors.

But what if each file contains an _arbitrary number of coordinates_, i.e.
its length is not predefined? That is exactly the case of [Wrist-worn Accelerometer Data Set](https://archive.ics.uci.edu/ml/datasets/Dataset+for+ADL+Recognition+with+Wrist-worn+Accelerometer)
mentioned at the beginning of this post, as **Figure 3** shows:

![Histogram](/assets/img/num_of_files_hist.png){: .center-image}
<em class="figure">Fig 3. Histogram of most common file lengths</em>

It is not possible to concatenate measurements together, because then each
feature vector would have a different length. But K-Means clustering can help to
overcome this issue and prepare the dataset for classification. The process of
mapping from arbitrary length accelerometer observations array into a
fixed-size feature vector is schematically shown in **Figure 4**.

![KMeansToFeature](/assets/img/kmeans_quantization.png){: .center-image}
<em class="figure">Fig 4. Using K-Means to create fixed-size feature vectors</em>

Each of $$N$$ dataset's files should be parsed into a matrix of accelerometer
measurements with shape $$(M_i, 3)$$ where $$M_i$$ is $$i$$th file length.
Then, the clustering algorithm with $$K$$ clusters should be applied to
**each of these matrices, separately**. Finally, the centroids calculated for each
matrix should be concatenated into 1-dimensional feature vectors with length
$$K \times 3$$, and then stacked together into the final matrix of
size $$(N, K \times 3)$$.

The following snippet shows how this processes looks in code:

<script src="https://gist.github.com/devforfu/8e302609ae11cc70c1b18bcf88a7cff7.js"></script>

The project with full implementation of the functions described in this post
could be found via [this link](https://github.com/devforfu/Blog/tree/master/kmeans)
alongside with the aforementioned dataset and a couple of helper utilities.

<hr class="with-margin">
<h4 class="header" id="conclusion">Conclusion</h4>

The K-Means algorithm is a simple, but powerful clustering technique which
should have its place in any machine learning engineer's toolkit. It could be
applied not only in an unsupervised learning setting to discover patterns of
an analyzed dataset, but also to reduce a dimensionality of the considered
problem.

Though it is simple to implement this method from scratch, it is
better to use robust, scalable and well-tested solution instead, like
[scikit-learn implementation](http://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html), which takes into account various edge
cases and improvements.

<hr class="with-margin">
### References

<ol>
  <li><a href="http://stanford.edu/~cpiech/cs221/handouts/kmeans.html">K-Means algorithm pseudocode</a></li>
  <li><a href="https://en.wikipedia.org/wiki/K-means_clustering">K-Means clustering Wikipedia article</a></li>
  <li><a href="http://web.science.mq.edu.au/~cassidy/comp449/html/ch10s03.html">Vector Quantization</a></li>
</ol>
