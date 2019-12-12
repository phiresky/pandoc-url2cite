import { Inline, Block, stringify, FilterAction, Format } from "pandoc-filter";

/** meta information about document, mostly from markdown frontmatter
 * https://hackage.haskell.org/package/pandoc-types-1.12.4.1/docs/Text-Pandoc-Definition.html#t:MetaValue
 */
export type PandocMetaValue =
	| { t: "MetaMap"; c: PandocMetaMap }
	| { t: "MetaList"; c: Array<PandocMetaValue> }
	| { t: "MetaBool"; c: boolean }
	| { t: "MetaInlines"; c: Inline[] }
	| { t: "MetaString"; c: string }
	| { t: "MetaBlocks"; c: Block[] };
export type PandocMetaMap = Record<string, PandocMetaValue>;

/** `.meta` in the pandoc json format describes the markdown frontmatter yaml as an AST as described in
 *  https://hackage.haskell.org/package/pandoc-types-1.12.4.1/docs/Text-Pandoc-Definition.html#t:MetaValue
 *
 * this function converts a raw object to a pandoc meta AST object
 **/
export function toMeta(
	e: string | object | (string | object)[]
): PandocMetaValue {
	if (Array.isArray(e)) {
		return { t: "MetaList", c: e.map(x => toMeta(x)) };
	}
	// warning: information loss: can't tell if it was a number or string
	if (typeof e === "string" || typeof e === "number")
		return { t: "MetaString", c: String(e) };
	if (typeof e === "object") {
		const c = fromEntries(
			Object.entries(e).map(([k, v]) => [k, toMeta(v)])
		);
		return { t: "MetaMap", c };
	}
	throw Error(typeof e);
}

type MetaRecord = { [name: string]: MetaUnravelled };
type MetaUnravelled = string | boolean | MetaRecord | Array<MetaUnravelled>;

export function fromMeta(m: PandocMetaValue): MetaUnravelled {
	if (m.t === "MetaMap") {
		return fromEntries(
			Object.entries(m.c).map(([k, v]) => [k, fromMeta(v)])
		);
	} else if (m.t === "MetaList") {
		return m.c.map(fromMeta);
	} else if (m.t === "MetaBool" || m.t === "MetaString") {
		return m.c;
	} else if (m.t === "MetaInlines" || m.t === "MetaBlocks") {
		// warning: information loss: removes formatting
		return stringify(m.c);
	}
	throw Error("never");
}
export function fromMetaMap(c: PandocMetaMap): MetaRecord {
	return fromMeta({ t: "MetaMap", c }) as any;
}

type AnyElt = Inline | Block;
/** pandoc-filter-node api is slightly ugly for Typescript */
export function makeTransformer(
	trafo: (
		el: AnyElt,
		outputFormat: Format,
		meta: MetaRecord
	) => Promise<AnyElt | AnyElt[] | undefined>
) {
	return (t: any, c: any, format: Format, meta: PandocMetaMap) =>
		trafo({ c, t }, format, fromMetaMap(meta));
}

export function isURL(s: string) {
	// dumb test but should be good enough, can't handle missing protocol anyways
	return /^https?:\/\/|^doi:/.test(s);
}

/** Object.fromEntries ponyfill */
function fromEntries<V>(iterable: Iterable<[string, V]>): Record<string, V> {
	return [...iterable].reduce((obj, [key, val]) => {
		obj[key] = val;
		return obj;
	}, {} as Record<string, V>);
}
