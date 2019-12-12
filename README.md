---
title: "Automatic citation extraction from URLs."
author: |
    phiresky
date: 2019-08-21
# abstract: |
#     This is the abstract. The system is great.
link-citations: true
urlcolor: blue
citekeys:
    vgg: https://arxiv.org/abs/1409.1556
    googlenet: https://ieeexplore.ieee.org/document/7298594
    resnet: https://ieeexplore.ieee.org/document/7780459
    gan: https://papers.nips.cc/paper/5423-generative-adversarial-nets
url2cite: all-links
---

# Introduction

This repo allows you to instantly and transparently cite most papers directly only given a single URL.

You simply add an URL of a publication, and it will replace that with a real citation in whatever [CSL](https://citationstyles.org/) style you want. This means you can avoid dealing with [Mendeley](https://www.mendeley.com/) or [Zotero][zotero] and keeping your Reference Manager database and bibtex file in sync, especially when collaborating with others.

# Minimal Example

Here is a minimal example:

**minimal.md**

```{.markdown .number-lines}
---
citekeys:
    gan: https://papers.nips.cc/paper/5423-generative-adversarial-nets
---

# Introduction

The GAN was first introduced in [@gan].

# References
```

Compiling this file with this command

```bash
pandoc --filter=pandoc-url2cite/index.js \
    --filter=pandoc-citeproc \
    minimal.md \
    --csl ieee.csl \
    -o minimal.pdf
```

This results in the following output:  
**minimal.pdf**  
![](example/minimal.png)

For a slightly longer example, you can look at this readme itself: [Source README.md](https://raw.githubusercontent.com/phiresky/pandoc-url2cite/master/README.md "no-url2cite") - [Result README.pdf](https://github.com/phiresky/pandoc-url2cite/blob/master/README.pdf "no-url2cite")

# How to Use

Clone [this repo](https://github.com/phiresky/pandoc-url2cite) somewhere, then install the dependencies using `npm ci install`. Then, add `--filter=pandoc-url2cite/index.js` to your pandoc command (before pandoc-citeproc).

If you're not familiar with writing papers in pandoc, you can refer to [e.g. this article](https://opensource.com/article/18/9/pandoc-research-paper). It's pretty flexible, you can use templates from whatever conference you want, and you can still use inline latex code if you need it (and you are ok with not being able to convert your document to nice HTML or EPUB anymore).

# How it Works

The main idea is that usually, every piece of research you might want to cite is already identifiable by an URL.
url2cite is based on the work of the [Zotero] authors. Zotero has a set of ["Translators"](https://www.zotero.org/support/dev/translators) that are able to extract citation info from a number of specific and general web pages. These translators are written in Javascript and run within the context of the given web site. They are made to be used from the Zotero Connector browser extension, but thankfully there is a standalone [Translation Server](https://github.com/zotero/translation-server) as well. To avoid the effort required to automatically start and manage this server locally, url2cite instead uses a publicly accessible instance of this server provided by Wikipedia with a [public REST API](https://www.mediawiki.org/wiki/Citoid/API).

All citation data is cached (permanently) as bibtex as well as CSL to `citation-cache.json`. This is both to improve performance and make sure references stay the same forever after the initial fetch, as well as to avoid problems if the API might be down in the future. This also means that errors in the citation data can be fixed manually, although if you find you need to do a lot of manual tweaking you might again be better off with Zotero.

# Limitations

1. Currently, extracting the metadata from direct URLs of full text PDFs does not work, so you will need to use the URL of an overview / abstract page etc. I'm not sure why, since this does work in Zotero. [More info might be here](https://github.com/zotero/translation-server/issues/70).
2. Currently, this filter only works if you use pandoc-citeproc, because the citations are written directly into the document metadata instead of into a bibtex file. If you want to use natbib or biblatex for citations, this filter currently won't work. Using citeproc has the disadvantage that it is somewhat less configurable than the "real" LaTeX citation text generators and the CSL language has some limitations. For example, the [bibtex "alpha"](https://www.overleaf.com/learn/latex/Bibtex_bibliography_styles) style sometimes used in Germany can't be described in CSL.

    To make it work with biblatex, this script would need to write out a \*.bib file somewhere temporarily and reference that in the latex code.

3. Some websites just have wrong meta information. For example, citationstyles.org has set "Your Name" as the website author in their [Open Graph](https://ogp.me/) metadata.
4. Using URLs directly as citekeys (e.g. `[@https://google.com]` does not work because of pandoc parsing, see [this issue](https://github.com/jgm/pandoc-citeproc/issues/308)

# Related Work (Longer Example)

[AlexNet][alexnet] first introduced CNNs to the ImageNet challenge. [@vgg; @googlenet; @resnet] further improved on the results.

# References

[alexnet]: http://dl.acm.org/citation.cfm?doid=3098997.3065386
[zotero]: https://www.zotero.org/
