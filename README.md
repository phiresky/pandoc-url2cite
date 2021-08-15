---
title: "Automatic citation extraction from URLs"
author: |
    phiresky
date: 2019-12-13
# abstract: |
#     This is the abstract. The system is great.
link-citations: true
urlcolor: blue
url2cite: all-links
---

[pandoc-url2cite][repo] allows you to instantly and transparently cite most papers directly given only a single URL.

You simply add a URL of a publication, and it will replace that with a real citation in whatever [CSL](https://citationstyles.org/) style you want. This means you can avoid dealing with [Mendeley](https://www.mendeley.com/) or [Zotero][zotero] and keeping your Reference Manager database and bibtex file in sync, especially when collaborating with others.

# Minimal Example

Here is a minimal example:

**minimal.md**

```{.markdown .number-lines}
# Introduction

The GAN was first introduced in [@gan].

# References

[@gan]: https://papers.nips.cc/paper/5423-generative-adversarial-nets
```

Compiling this file with this command

```bash
pandoc \
    --filter=pandoc-url2cite --citeproc \
    --csl ieee-with-url.csl \
    minimal.md -o minimal.pdf
```

This results in the following output:  
**minimal.pdf**  
[![](https://github.com/phiresky/pandoc-url2cite/raw/master/example/minimal.png)][minpdf]

For a longer example, you can look at the source of this file itself, which is both [a blog post](https://phiresky.github.io/blog/2019/pandoc-url2cite/), GitHub Readme and LaTeX "paper":

**README.pdf**  
[![](https://github.com/phiresky/pandoc-url2cite/raw/master/example/readme.png)][pdf]

[Source README.md](https://raw.githubusercontent.com/phiresky/pandoc-url2cite/master/README.md "no-url2cite") - [Result README.pdf][pdf]

# How to Use

Install this package globally using `npm install -g pandoc-url2cite`.

Then, add `--filter=pandoc-url2cite` to your pandoc command (before `--citeproc`, see the minimal example above).

Alternatively, clone [this repo][repo] somewhere, then install the dependencies using `npm ci install`.

If you're not familiar with writing papers in pandoc, you can refer to [e.g. this article](https://opensource.com/article/18/9/pandoc-research-paper). It's pretty flexible, you can use templates from whatever conference you want, and you can still use inline latex code if you need it (and you are ok with not being able to convert your document to nice HTML or EPUB anymore).

## Citation Syntax

url2cite allows multiple ways to cite:

1. (PREFERRED) Use the pandoc citation syntax for citations:

    `The authors of [@alexnet] first introduced CNNs to the ImageNet challenge.`

    More information about referencing specific pages etc. is in the [pandoc manual](https://pandoc.org/MANUAL.html#citations).

    Then add the URLs with the usual "link reference" syntax to the bottom of your document in its own paragraph:

    `[@alexnet]: https://...`

    You can also use the URL directly inline by using the [flexible citation syntax](https://github.com/jgm/pandoc/issues/6026) introduced in Pandoc 2.14:

    `PPO [@{https://github.com/jgm/pandoc/issues/6026}] is a policy gradient method.`

2. Convert all links to citations

    Add `url2cite: all-links` to your [yaml front matter](https://pandoc.org/MANUAL.html#extension-yaml_metadata_block). This will cause all links in the document to be converted to references.

    You can still blacklist some links by adding `no-url2cite` to either the CSS class of the link (pandoc-only):

    `[foo](http://example.com){.no-url2cite}`

    or to the link title:

    `[foo](http://example.com "no-url2cite")`.

# How it Works

The main idea is that usually every piece of research you might want to cite is fully identifiable by an URL - no need to manually enter metadata like author, release date, journal, etc. Citation managers like Zotero already use this and enable you to automatically fetch metadata from a website. But then you still have a citation database somewhere that you may or may not be able to synchronize with different computers, but probably won't be able to add to the version control of your paper. There's hacks such as [better-bibtex](https://github.com/retorquere/zotero-better-bibtex) to automatically generate and update diffable bibtex files -- But that means you now have two sources of truth, and since the export is one-way this leads to multiple contributors overriding each other's changes. pandoc-url2cite goes a step further: URLs are directly used as the cite keys, and the "bibliography file" is just an auto-generated intermediary artifact of those URLs.

pandoc-url2cite is based on the work of the [Zotero] developers. Zotero has a set of ["Translators"](https://www.zotero.org/support/dev/translators) that are able to extract citation info from a number of specific and general web pages. These translators are written in Javascript and run within the context of the given web site. They are made to be used from the Zotero Connector browser extension, but thankfully there is a standalone [Translation Server](https://github.com/zotero/translation-server) as well. To avoid the effort required to automatically start and manage this server locally, pandoc-url2cite instead uses a publicly accessible instance of this server provided by Wikipedia with a [public REST API](https://www.mediawiki.org/wiki/Citoid/API).

All citation data is cached (permanently) as bibtex as well as CSL to `citation-cache.json`. This is both to improve performance and to make sure references stay the same forever after the initial fetch, as well as to avoid problems if the API might be down in the future. This also means that errors in the citation data can be fixed manually, although if you find you need to do a lot of manual tweaking you might again be better off with Zotero.

# Configuration / Special Cases

## Advanced Configuration

You can see a list of all supported config options in [config.d.ts](config.d.ts).

## Mixing manual references and generated URL-based ones


Right now there's four ways you can use url2cite in combination with "manual" citations:

1. Prefix the cite key with `raw:`. e.g. `[@raw:foobar]`. These are ignored by url2cite, and you can add the reference however you want in your `--bibliography=` file.
2. set `url2cite-allow-dangling-citations=true`. That suppresses the `Could not find URL for @foobar.` error and makes url2cite just ignore any cite keys that aren't aliased to an url.
3. Use an URL as a cite-key. Doesn't need to have a DOI or be a paper, just any website that's relevant to the work is fine as long as Zotero understands it. Then manually adjust the CSL entry url2cite generates in `citation-cache.json`.
4. Use an URL as a cite-key like in (3), but directly add the bibtex in a code block with language `url2cite-bibtex` anywhere:
    `````markdown
   see also @{https://github.com/DLR-RM/stable-baselines3}.

    ```url2cite-bibtex
    @misc{https://github.com/DLR-RM/stable-baselines3,
    author = {Raffin, Antonin and Hill, Ashley and Ernestus, Maximilian and Gleave, Adam and Kanervisto, Anssi and Dormann, Noah},
    title = {Stable Baselines3},
    year = {2019},
    publisher = {GitHub},
    journal = {GitHub repository},
    howpublished = {\url{https://github.com/DLR-RM/stable-baselines3}},
    }
    ```
    `````

## Using other kinds of unique IDs

pandoc-url2cite also supports ISBNs and DOIs:

    The book [@isbn:978-0374533557, pp. 15-17] is interesting.

See [this example](https://github.com/phiresky/pandoc-url2cite/blob/master/example/doi-isbn.md).

## Using without citeproc (with natbib/biblatex)

If you don't want to use citeproc, you can set `url2cite-output-bib=foo.bib` to make url2cite output a bibtex file for consumption by your preferred LaTeX tool.

## Limitations

1.  Currently, extracting the metadata from direct URLs of full text PDFs does not work, so you will need to use the URL of an overview / abstract page etc. I'm not sure why, since this does work in Zotero. [More info might be here](https://github.com/zotero/translation-server/issues/70)
2.  Some websites just have wrong meta information. For example, citationstyles.org has set "Your Name" as the website author in their [Open Graph](https://ogp.me/) metadata. You can manually modify the `citation-cache.json` file to fix / change anything.

# Related Projects

-   [Manubot](https://manubot.org/) is a more integrated and opinionated tool for creating scientific documents that has a similar method for creating citations without the hassle.
-   [pandoc-url2cite-hs](https://github.com/Aver1y/pandoc-url2cite-hs) is a Haskell port of this tool (mostly compatible)

# Longer Example

[AlexNet][alexnet] first introduced CNNs to the ImageNet challenge. [@vgg; @googlenet; @resnet] further improved on the results.

# References

[repo]: https://github.com/phiresky/pandoc-url2cite
[minpdf]: https://github.com/phiresky/pandoc-url2cite/blob/master/example/minimal.pdf "no-url2cite"
[pdf]: https://github.com/phiresky/pandoc-url2cite/blob/master/README.pdf "no-url2cite"
[alexnet]: http://dl.acm.org/citation.cfm?doid=3098997.3065386
[zotero]: https://www.zotero.org/
[@vgg]: https://arxiv.org/abs/1409.1556
[@googlenet]: https://ieeexplore.ieee.org/document/7298594
[@resnet]: https://ieeexplore.ieee.org/document/7780459
