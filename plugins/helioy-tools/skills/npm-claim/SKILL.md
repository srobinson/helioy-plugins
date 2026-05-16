---
name: npm-claim
description: >
  Claim an npm package name by checking availability and publishing a placeholder.
  Use when the user says "claim", "npm claim", "reserve package name", or wants to
  check if an npm package name is available. Takes a package name as an argument.
---

# npm-claim

The package name is: `$ARGUMENTS`

The template directory is: `$SKILL_DIR/contents/`

## Steps

### 1. Validate

If `$ARGUMENTS` is empty or whitespace, tell the user to provide a name and stop.

### 2. Check npm availability

Run:

```bash
npm view "$ARGUMENTS" version 2>/dev/null
```

- If exit code 0 (returns a version): the package **already exists**. Fetch the maintainers and report owner before stopping:

  ```bash
  npm view "$ARGUMENTS" maintainers 2>/dev/null
  ```

  Print: `$ARGUMENTS already exists on npm. Maintainers: <names>`. If a maintainer matches the user (e.g. `srobinson`), flag it as the user's existing claim ("that's you").

- If exit code non-zero: the name is **available**. Continue.

### 3. Scaffold

Set these substitution values:
- `{{NAME}}` = the package name (`$ARGUMENTS`)
- `{{TITLE}}` = title case version (e.g. `agent-matters` becomes `Agent Matters`)

Then run these bash commands:

```bash
mkdir -p ~/.name-claim/$ARGUMENTS
sed 's/{{NAME}}/$ARGUMENTS/g; s/{{TITLE}}/$ARGUMENTS_TITLE_CASE/g' $SKILL_DIR/contents/package.json > ~/.name-claim/$ARGUMENTS/package.json
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/placeholder.js > ~/.name-claim/$ARGUMENTS/$ARGUMENTS.js
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/publish.sh > ~/.name-claim/$ARGUMENTS/publish.sh
chmod +x ~/.name-claim/$ARGUMENTS/publish.sh
```

Replace `$ARGUMENTS` and `$ARGUMENTS_TITLE_CASE` with the actual values in the sed commands.

Why `~/.name-claim/` and not `/tmp/`: the path is shared with sister skills `pypi-claim`, `crate-claim`, and the multi-registry orchestrator `name-claim`. `/tmp/` would survive a single publish but get reaped between sessions; `~/.name-claim/` persists for retries.

### 4. Print next steps

Output the following exactly as shown, substituting the actual package name. Do NOT wrap in a code block or add any formatting.

$ARGUMENTS is available!

~/.name-claim/$ARGUMENTS/publish.sh
