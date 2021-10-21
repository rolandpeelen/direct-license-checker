"use strict";

const fs = require("fs");
const yargs = require("yargs");
const R = require("ramda");

/* Helpers */
const writeLineToStdout = (x) => process.stdout.write(x + "\n");
const toString = (x) => x.toString();
const flatten = (arr) => arr.flat();
const mergeObjects = (arr) => arr.reduce((acc, x) => ({ ...x, ...acc }), {});
const createRelativePackagePath = (relativePath) => (x) =>
  `${relativePath}${x}/package.json`;
const unsafeReadFileJson = (x) => {
  try {
    return R.pipe(fs.readFileSync, toString, JSON.parse)(x);
  } catch (e) {
    process.stderr.write(e.toString());
    return process.exit(126);
  }
};

const argv = yargs
  .option("workspace", {
    alias: "w",
    description: "Give the root workspace file",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

if (argv.workspace) {
  const { workspaces } = unsafeReadFileJson(argv.workspace);
  const relativePath = argv.workspace.replace("package.json", "");
  const dependencies = R.pipe(
    R.map(
      R.pipe(
        createRelativePackagePath(relativePath, "package.json"),
        unsafeReadFileJson,
        R.prop("dependencies")
      )
    ),
    mergeObjects, // This makes it a dict and deduplicates it
    Object.entries
  )(workspaces);

  const licenses = R.pipe(
    R.map(
      R.pipe(
        ([key, value]) =>
          createRelativePackagePath(relativePath + "node_modules/")(key),
        unsafeReadFileJson,
        R.props(["version", "license", "homepage"])
      )
    )
  )(dependencies);

  process.stdout.write("Dependency, Version Requested, Version, License, Link\n");
  R.pipe(
    (arr) => R.zip(...arr),
    R.map(R.pipe(flatten, R.intersperse(","), R.join(""), writeLineToStdout))
  )([dependencies, licenses]);
}
