export function isURL(s: string) {
	// incomplete test. in theory this should match any format recognized by zotero
	return /^https?:\/\/|^doi:|^isbn:|^raw:/.test(s);
}

// https://tex.stackexchange.com/a/96918/242418
// biber does not not allow some chars, so escape them
export function escapeURL(s: string, mode: boolean) {
	if (!mode) return s;
	return s.replace(/["#%'(),={}]/g, (c) => {
		return "_x" + c.charCodeAt(0) + "_";
	});
}
