export function isURL(s: string) {
	// incomplete test. in theory this should match any format recognized by zotero
	return /^https?:\/\/|^doi:|^isbn:/.test(s);
}
