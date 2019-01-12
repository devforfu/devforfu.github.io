---
layout: 'post'
category: 'blog'
title: "Building Simple Recommendation System with PyTorch"
tags: ['python', 'ensemble', 'trees', 'numpy']
image: "embeddings.png"
foreign_url: https://medium.com/coinmonks/how-to-implement-a-recommendation-system-with-deep-learning-and-pytorch-2d40476590f9
foreign_logo: "medium.png"
---

Recently I’ve started watching [fast.ai](http://course.fast.ai) lectures&mdash; a great
 online course on Deep Learning. In one of his lectures, the author
discusses the building of a simple neural network based recommendation system
with application to the MovieLens dataset. The lecture relies on
the library developed by the author to run the training process. However,
I strongly wanted to learn more about the **PyTorch** framework which sits
under the hood of authors code. In this post, I am describing the process of implementing and training a simple embeddings-based collaborative filtering recommendation system using **PyTorch**, **Pandas**,
and **Scikit-Learn**.

<!--more-->

In this post, I'm recreating author's approach
using this framework only.

Recently I’ve started watching fast.ai lectures — a great online course on Deep Learning and its applications. In one of his lectures, the author discusses the building of a simple neural network based recommendation system with application to the MovieLens dataset. While the lecture is an excellent source of information on this topic, it mostly relies on the library developed by the authors to run the training process. The library is quite flexible and provides several levels of abstractions.
However, I strongly wanted to learn more about the PyTorch framework which sits under the hood of authors code. In this post, I am describing the process of implementing and training a simple embeddings-based collaborative filtering recommendation system using PyTorch, Pandas, and Scikit-Learn. We’re going to follow the steps described in the lecture without using the mentioned library.
