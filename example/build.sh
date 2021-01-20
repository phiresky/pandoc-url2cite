npm run build

for output_format in pdf odt docx; do
	pandoc  --filter=../dist/pandoc-url2cite.js --citeproc minimal.md \
	    --csl ieee-with-url.csl -o minimal.$output_format
done
pandoc  --filter=../dist/pandoc-url2cite.js --citeproc doi-isbn.md \
    --csl apa.csl -o doi-isbn.pdf
