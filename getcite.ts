#!/usr/bin/env node

/// <reference path="untyped.d.ts" />

import pandoc, { EltMap, Elt } from "pandoc-filter";
import * as fs from "fs";

import cjs from "citation-js";

const citationCachePath = "citation-cache.json";

let cache: { [url: string]: { fetched: string; bibtex: string; csl: any } } = {};

async function getCslForUrl(url: string) {
	// uses zotero extractors from https://github.com/zotero/translators to get information from URLs
	// https://www.mediawiki.org/wiki/Citoid/API
	// it should be possible to run a citoid or [zotero translation-server](https://github.com/zotero/translation-server) locally,
	// but this works fine for now
	console.warn("fetching citation from url", url);
	const res = await fetch(`https://en.wikipedia.org/api/rest_v1/data/citation/bibtex/${encodeURIComponent(url)}`);

	if (!res.ok) {
		throw `could not fetch citation from ${url}: ${await res.text()}`;
	}
	const bibtex = await res.text();

	// Citoid does not have CSL output, so convert bibtex to CSL JSON format
	const cbb = new cjs(bibtex);

	if (cbb.data.length !== 1) throw Error("got != 1 bibtex entries: " + bibtex);
	cbb.data[0].id = url;
	const [csl] = cbb.get({ format: "real", type: "json", style: "csl" });
	delete csl._graph;

	return { fetched: new Date().toJSON(), bibtex, csl };
}

async function getCslForUrlCached(url: string) {
	if (url in cache) return;
	cache[url] = await getCslForUrl(url);
}

async function astTransformer<A extends keyof EltMap>(
	key: A,
	value: EltMap[A],
	format: string,
	meta: any
): Promise<undefined | Elt<keyof EltMap> | Array<Elt<keyof EltMap>>> {
	if (key === "Cite") {
		const citekeys = meta.citekeys.c;
		const [citations, inline] = value as EltMap["Cite"];
		for (const citation of citations) {
			const _url = citekeys[citation.citationId];
			if (!_url) continue;
			const url = _url.c[0].c;
			await getCslForUrlCached(url);
			// replace the citation id with the url
			citation.citationId = url;
		}
	}
	return undefined;
}

/** `.meta` in the pandoc json format describes the markdown frontmatter yaml as an AST as described in
 *  https://hackage.haskell.org/package/pandoc-types-1.12.4.1/docs/Text-Pandoc-Definition.html#t:MetaValue
 *
 * this function converts a raw object to a pandoc meta ast object
 **/
function toMeta(e: string | object | (string | object)[]): any {
	if (Array.isArray(e)) {
		return { t: "MetaList", c: e.map(x => toMeta(x)) };
	}
	// information loss: can't tell if it was a number or string
	if (typeof e === "string" || typeof e === "number") return { t: "MetaString", c: String(e) };
	if (typeof e === "object") {
		const m: any = {};
		for (const [k, v] of Object.entries(e)) {
			m[k] = toMeta(v);
		}
		return { t: "MetaMap", c: m };
	}
	throw Error(typeof e);
}

async function go() {
	try {
		cache = JSON.parse(fs.readFileSync(citationCachePath, "utf8"));
	} catch {}
	// parse AST from stdin
	const data = JSON.parse(fs.readFileSync(0, "utf8"));
	const format = process.argv.length > 2 ? process.argv[2] : "";
	const res = await (pandoc as any).filterAsync(data, astTransformer, format);
	console.error("got all citations");

	// add all cached references to the frontmatter. pandoc-citeproc will handle unused keys.
	res.meta.references = toMeta(Object.entries(cache).map(([url, { csl }]) => csl));
	fs.writeFileSync(citationCachePath, JSON.stringify(cache, null, "\t"));
	process.stdout.write(JSON.stringify(res));
}

go().catch(e => {
	console.error("extraction error", e);
	process.exit(1);
});
