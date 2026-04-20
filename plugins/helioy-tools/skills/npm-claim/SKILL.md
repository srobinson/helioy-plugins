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

- If exit code 0 (returns a version): the package **already exists**. Report and stop.
- If exit code non-zero: the name is **available**. Continue.

### 3. Scaffold

Set these substitution values:
- `{{NAME}}` = the package name (`$ARGUMENTS`)
- `{{TITLE}}` = title case version (e.g. `agent-matters` becomes `Agent Matters`)

Then run these bash commands:

```bash
mkdir -p /tmp/claim-$ARGUMENTS
sed 's/{{NAME}}/$ARGUMENTS/g; s/{{TITLE}}/$ARGUMENTS_TITLE_CASE/g' $SKILL_DIR/contents/package.json > /tmp/claim-$ARGUMENTS/package.json
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/placeholder.js > /tmp/claim-$ARGUMENTS/$ARGUMENTS.js
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/publish.sh > /tmp/claim-$ARGUMENTS/publish.sh
chmod +x /tmp/claim-$ARGUMENTS/publish.sh
```

Replace `$ARGUMENTS` and `$ARGUMENTS_TITLE_CASE` with the actual values in the sed commands.

### 4. Print next steps

Output the following exactly as shown, substituting the actual package name. Do NOT wrap in a code block or add any formatting.

$ARGUMENTS is available!

/tmp/claim-$ARGUMENTS/publish.sh
