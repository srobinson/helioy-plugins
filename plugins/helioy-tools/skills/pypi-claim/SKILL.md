---
name: pypi-claim
description: >
  Claim a PyPI package name by checking availability and publishing a placeholder.
  Use when the user says "pypi claim", "reserve pypi name", or wants to check if a
  PyPI package name is available. Takes a package name as an argument.
---

# pypi-claim

The package name is: `$ARGUMENTS`

The template directory is: `$SKILL_DIR/contents/`

## Steps

### 1. Validate

If `$ARGUMENTS` is empty or whitespace, tell the user to provide a name and stop.

### 2. Check PyPI availability

Run:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://pypi.org/pypi/$ARGUMENTS/json"
```

- If output is `200`: the package **already exists**. Report and stop.
- If output is `404`: the name is **available**. Continue.
- Any other code: report the status and stop.

### 3. Scaffold

Set these substitution values:
- `{{NAME}}` = the package name (`$ARGUMENTS`)
- `{{TITLE}}` = title case version (e.g. `agent-matters` becomes `Agent Matters`)
- `{{MODULE}}` = `$ARGUMENTS` with hyphens replaced by underscores (Python module name)

Then run these bash commands:

```bash
mkdir -p /tmp/claim-$ARGUMENTS
sed 's/{{NAME}}/$ARGUMENTS/g; s/{{TITLE}}/$ARGUMENTS_TITLE_CASE/g; s/{{MODULE}}/$MODULE/g' $SKILL_DIR/contents/pyproject.toml > /tmp/claim-$ARGUMENTS/pyproject.toml
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/placeholder.py > /tmp/claim-$ARGUMENTS/$MODULE.py
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/publish.sh > /tmp/claim-$ARGUMENTS/publish.sh
chmod +x /tmp/claim-$ARGUMENTS/publish.sh
```

Replace `$ARGUMENTS`, `$ARGUMENTS_TITLE_CASE`, and `$MODULE` with the actual values in the sed commands.

### 4. Print next steps

Output the following exactly as shown, substituting the actual package name. Do NOT wrap in a code block or add any formatting.

$ARGUMENTS is available!

/tmp/claim-$ARGUMENTS/publish.sh

Note: publishing requires a PyPI API token configured in `~/.pypirc` or the `TWINE_PASSWORD` env var.
