# :bookmark: - Direct License Checker

Given a yarn workspaces root `package.json`, this will go through the 
workspaces, take all the `dependencies` (not `devDependencies`, or 
`peerDependencies`), find the corresponding `package.json` in the relative
`node_modules`, and produce CSV output in the shape of:
```markdown
Dependency, Version Requested, Version, License, Link
```
