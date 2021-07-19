#!/usr/bin/env node
import * as fs from "fs";
import { Url2Cite } from "./index";
import { PandocJson } from "pandoc-filter";

async function read(stream: NodeJS.ReadStream) {
	const chunks = [];
	for await (const chunk of stream) chunks.push(chunk);
	return Buffer.concat(chunks).toString("utf8");
}

async function go() {
	if (["--help", "--version", "-h", "-v"].includes(process.argv[2] || "-h")) {
		const { version, homepage } = require("../package.json");
		console.error(`pandoc-url2cite v${version}`);
		console.error(
			`Don't run this directly, use it as a pandoc --filter=. Usage: ${homepage}`,
		);
		return;
	}

	// parse AST from stdin
	let data: PandocJson = JSON.parse(await read(process.stdin));
	const format =
		process.argv.length > 2 && process.argv[2] ? process.argv[2] : "";

	const u2c = new Url2Cite();
	data = await u2c.transform(data, format);

	process.stdout.write(JSON.stringify(data));
	// fs.writeFileSync("/tmp/o.json", JSON.stringify(data, null, "\t"));
}

go().catch((e) => {
	console.error("extraction error", e);
	process.exit(1);
});
