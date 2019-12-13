#!/usr/bin/env node
import * as fs from "fs";
import { Url2Cite } from "./index";

async function go() {
	const u2c = new Url2Cite();
	if (["--help", "--version", "-h", "-v"].includes(process.argv[2] || "-h")) {
		const { version, homepage } = require("../package.json");
		console.error(`pandoc-url2cite v${version}`);
		console.error(
			`Don't run this directly, use it as a pandoc --filter=. Usage: ${homepage}`
		);
		return;
	}

	// parse AST from stdin
	let data = JSON.parse(fs.readFileSync(0, "utf8"));
	const format = process.argv.length > 2 ? process.argv[2] : "";

	data = await u2c.transform(data, format);

	process.stdout.write(JSON.stringify(data));
	// fs.writeFileSync("/tmp/o.json", JSON.stringify(data, null, "\t"));
}

go().catch(e => {
	console.error("extraction error", e);
	process.exit(1);
});
