#!/bin/bash

pandoc paper.md -o paper.pdf --filter=pandoc-crossref --filter=pandoc-url2cite/index.js --filter=pandoc-citeproc
