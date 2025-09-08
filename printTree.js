"use strict";

const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

const ROOT = process.cwd(); // project root
const gitignorePath = path.join(ROOT, ".gitignore");

// Load .gitignore patterns
let ig = ignore();
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, "utf8");
  ig = ignore().add(gitignore.split("\n"));
}

// Recursively build directory tree
function buildTree(dir, prefix = "") {
  let entries = fs.readdirSync(dir).filter((f) => {
    const relPath = path.relative(ROOT, path.join(dir, f));
    return !ig.ignores(relPath);
  });

  entries.sort(); // sort alphabetically
  entries.forEach((entry, index) => {
    const fullPath = path.join(dir, entry);
    const isLast = index === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";

    console.log(prefix + connector + entry);

    if (fs.statSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      buildTree(fullPath, newPrefix);
    }
  });
}

// Print root folder name and tree
console.log(path.basename(ROOT) + "/");
buildTree(ROOT);
