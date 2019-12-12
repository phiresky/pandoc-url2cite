// usually you shouldn't use ts-node for published packages,
// but since this project is binary-only it's fine.
require("ts-node").register({
	project: __dirname + "/tsconfig.json",
	transpileOnly: true
});
require("./getcite.ts");
