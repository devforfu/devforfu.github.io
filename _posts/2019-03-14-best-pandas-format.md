---
layout: 'post'
category: 'blog'
title: "The Best Format to Save Pandas Data Frame"
tags: ['python', 'pandas', 'matplotlib']
image: "formats_hist.png"
foreign_url: https://towardsdatascience.com/the-best-format-to-save-pandas-data-414dca023e0d
foreign_logo: "medium.png"
---
There are plenty of binary formats to store `pandas.DataFrame` objects on disk
between Jupyter sessions. How can we know which one is better for our purposes?
Well, we can try a few of them and compare! In this post, I do a little benchmark
to understand which format is the best in terms of short-term storing of
`pandas` data.
<!--more-->
