
/**
 * config options loaded from markdown YAML frontmatter
 *
 * can also be specified as a command line option, e.g. `pandoc -M url2cite=all-links`
 **/
 export type Configuration = {
	/**
	 * if all-links then convert all links to citations. otherwise only parse pandoc citation syntax
	 */
	url2cite?: "all-links" | "citation-only";
	/**
	 * only relevant for links converted to citations (if urlcite=all-links)
	 *
	 * - cite-only: [text](href) becomes [@href]
	 * - sup: [text](href) becomes [text](href)^[@href]
	 * - normal: [text](href) becomes [text [@href]](href)
	 *
	 *  default: sup if html else normal
	 */
	"url2cite-link-output"?: "cite-only" | "sup" | "normal";
	/**
	 * location of the cache file
	 * default: ./citation-cache.json (relative to invocation directory of pandoc)
	 */
	"url2cite-cache"?: string;
	/**
	 * Whether to allow citations without an accompanying url. Useful for manual citations that aren't
	 * automatically found by url2cite and are managed manually or with a different tool
	 */
	"url2cite-allow-dangling-citations"?: boolean;
	"url2cite-output-bib"?: string;
	/** escape characters in the cite keys that are not valid for biber */
	"url2cite-escape-ids"?: boolean;
};