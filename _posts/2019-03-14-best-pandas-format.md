---
layout: 'post'
category: 'blog'
title: "The Best Format to Save Pandas Data Frame"
tags: ['python', 'pandas', 'matplotlib']
image: "formats_hist.png"
foreign_url: https://towardsdatascience.com/the-best-format-to-save-pandas-data-414dca023e0d
foreign_logo: "medium.png"
---

When working on data analytical projects, I usually use Jupyter notebooks and
a great pandas library to process and move my data around. It is a very
straightforward process for moderate-sized datasets which you can store
as plain-text files without too much overhead.

However, when the number of observations in your dataset is high, the process
of saving and loading data back into the memory becomes slower, and the CSV
files lose their attractiveness. We can do better. There are plenty of binary
formats to store the data on disk, and many of them pandas supports. How can we
know which one is better for our purposes? Well, we can try a few of
them and compare!
<!--more-->
