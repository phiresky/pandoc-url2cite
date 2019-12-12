#!/bin/bash

pandoc README.md -o README.pdf --csl example/ieee-with-url.csl \
    --filter=./index.js --filter=pandoc-citeproc --highlight-style zenburn
