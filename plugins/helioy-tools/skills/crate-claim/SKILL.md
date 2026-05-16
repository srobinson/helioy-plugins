---
name: crate-claim
description: >
  Claim a crates.io package name by checking availability and publishing a placeholder.
  Use when the user says "crate claim", "cargo claim", "reserve crate name", or wants
  to check if a crates.io name is available. Takes a crate name as an argument.
  Note: crates.io publishes are permanent (yank only, no unpublish).
---

# crate-claim

The crate name is: `$ARGUMENTS`

The template directory is: `$SKILL_DIR/contents/`

## Steps

### 1. Validate

If `$ARGUMENTS` is empty or whitespace, tell the user to provide a name and stop.

### 2. Check crates.io availability

Run:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://crates.io/api/v1/crates/$ARGUMENTS"
```

- If output is `200`: the crate **already exists**. Fetch the owners and report before stopping:

  ```bash
  curl -s "https://crates.io/api/v1/crates/$ARGUMENTS/owners" | python3 -c "import sys,json; d=json.load(sys.stdin); print(', '.join(u['login'] for u in d['users']))"
  ```

  Print: `$ARGUMENTS already exists on crates.io. Owner: <comma-separated logins>`. If an owner matches the user (e.g. `srobinson`), flag it as the user's existing claim ("that's you").

- If output is `404`: the name is **available**. Continue.
- Any other code: report the status and stop.

### 3. Scaffold

Set these substitution values:
- `{{NAME}}` = the crate name (`$ARGUMENTS`)
- `{{TITLE}}` = title case version (e.g. `agent-matters` becomes `Agent Matters`)

Then run these bash commands:

```bash
mkdir -p ~/.name-claim/$ARGUMENTS/src
sed 's/{{NAME}}/$ARGUMENTS/g; s/{{TITLE}}/$ARGUMENTS_TITLE_CASE/g' $SKILL_DIR/contents/Cargo.toml > ~/.name-claim/$ARGUMENTS/Cargo.toml
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/lib.rs > ~/.name-claim/$ARGUMENTS/src/lib.rs
sed 's/{{NAME}}/$ARGUMENTS/g' $SKILL_DIR/contents/publish.sh > ~/.name-claim/$ARGUMENTS/publish.sh
chmod +x ~/.name-claim/$ARGUMENTS/publish.sh
```

Replace `$ARGUMENTS` and `$ARGUMENTS_TITLE_CASE` with the actual values in the sed commands.

Why `~/.name-claim/` and not `/tmp/` or `~/.claude/`: `cargo publish` walks up from `Cargo.toml` until it finds a `.git` directory; if it finds one with uncommitted changes, it refuses to publish. `~/.claude/` is a dotfiles repo so it triggers the dirty check. `~/` is not a git repo, so `~/.name-claim/` sidesteps the check entirely. The path is also shared with sister skills `npm-claim`, `pypi-claim`, and the orchestrator `name-claim`.

### 4. Print next steps

Output the following exactly as shown, substituting the actual crate name. Do NOT wrap in a code block or add any formatting.

$ARGUMENTS is available!

Warning: crates.io publishes are permanent. Yank only, no unpublish.

~/.name-claim/$ARGUMENTS/publish.sh

Note: publishing requires `cargo login <token>` to have been run with a token from https://crates.io/settings/tokens.
