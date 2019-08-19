#!/bin/bash

pandoc README.md -o README.pdf --csl example/ieee.csl --filter=pandoc-crossref --filter=./index.js --filter=pandoc-citeproc --highlight-style zenburn
