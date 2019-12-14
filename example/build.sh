npm run build

pandoc  --filter=../dist/pandoc-url2cite.js --filter=pandoc-citeproc minimal.md \
    --csl ieee-with-url.csl -o minimal.pdf
pandoc  --filter=../dist/pandoc-url2cite.js --filter=pandoc-citeproc doi-isbn.md \
    --csl apa.csl -o doi-isbn.pdf