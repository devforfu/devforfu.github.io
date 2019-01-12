---
layout: 'post'
category: 'blog'
title: "Deep Learning Model Training Loop"
tags: ['python', 'pytorch', 'mnist', 'deep learning', 'design patterns']
image: "loop.gif"
foreign_url: https://towardsdatascience.com/deep-learning-model-training-loop-e41055a24b73
foreign_logo: "medium.png"
---

The **PyTorch** is a fantastic and easy to use Deep Learning framework. It provides you
with all the fundamental tools to build a machine learning model. It gives you CUDA-driven
tensor computations, optimizers, neural network layers, and so on. However, to train a model
one needs to assemble all these things into a data processing pipeline. Recently the developers
released the `1.0` version of the framework, and I've decided it is a good time to try myself
in writing generic training loop implementation. In this post, I'm describing this process
and giving some interesting observations about its development.

<!--more-->
