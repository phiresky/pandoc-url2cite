#!/bin/bash

npm run build # compile typescript
pandoc README.md -o README.pdf --csl example/ieee-with-url.csl \
    --filter=./dist/index.js --filter=pandoc-citeproc --highlight-style zenburn
