export function isURL(s: string) {
	// dumb test but should be good enough, can't handle missing protocol anyways
	return /^https?:\/\/|^doi:/.test(s);
}
