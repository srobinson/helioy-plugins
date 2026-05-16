---
name: name-claim
description: >
  Check a package name across npm, PyPI, and crates.io, then scaffold a 0.0.1
  placeholder for every available registry into one shared directory. Prints
  three copy-pasteable publish commands at the end so the user can run all
  three publishes themselves in their own terminal. Use when the user says
  "name claim", "claim X", "reserve name", or wants to lock a name across all
  three registries with a single command. Takes a name as an argument.
  Crates.io publishes are permanent (yank only, no unpublish).
---

# name-claim

The name to claim is: `$ARGUMENTS`

The sibling template directories are:
- npm:   `$SKILL_DIR/../npm-claim/contents/`
- pypi:  `$SKILL_DIR/../pypi-claim/contents/`
- crate: `$SKILL_DIR/../crate-claim/contents/`

## Contract

This skill scaffolds, the user publishes. The orchestrator does NOT run the
publish scripts. Publishing to npm, PyPI, or crates.io requires interactive
auth (browser OAuth, terminal prompts, 2FA codes) that needs a real TTY. The
Bash tool has no TTY, so any auto-publish attempt would hang or fail.

The skill's job ends after step 5: print three copy-pasteable commands and
stop. The user runs them in their own terminal as one paste.

## Steps

### 1. Validate and compute substitution values

If `$ARGUMENTS` is empty or whitespace, tell the user to provide a name and stop.

Compute three values, used throughout:
- `NAME` = `$ARGUMENTS` (kebab-case as given)
- `TITLE` = title case (e.g. `identity-matters` becomes `Identity Matters`)
- `MODULE` = `NAME` with hyphens replaced by underscores (Python module name)

### 2. Check all three registries in parallel

Run these three Bash calls in a single message (parallel):

```bash
# npm
npm view "$ARGUMENTS" version 2>/dev/null; echo "EXIT:$?"
```

```bash
# PyPI
curl -s -o /dev/null -w "%{http_code}" "https://pypi.org/pypi/$ARGUMENTS/json"
```

```bash
# crates.io
curl -s -o /dev/null -w "%{http_code}" "https://crates.io/api/v1/crates/$ARGUMENTS"
```

Interpret each:

| Registry  | Available signal       | Taken signal           |
| --------- | ---------------------- | ---------------------- |
| npm       | `EXIT:1` (or non-zero) | `EXIT:0` + version str |
| PyPI      | `404`                  | `200`                  |
| crates.io | `404`                  | `200`                  |

Any other status: report as `unknown` and treat as taken for this run (do not
scaffold an unknown registry).

### 2b. Owner lookup for taken registries

For any registry that came back **taken**, run its owner query so the user
can immediately tell whether the existing claim is theirs. Batch all
taken-registry lookups in a single parallel Bash message:

**npm**:

```bash
npm view "$ARGUMENTS" maintainers 2>/dev/null
```

**pypi**:

```bash
curl -s "https://pypi.org/pypi/$ARGUMENTS/json" | python3 -c "import sys,json; d=json.load(sys.stdin)['info']; print(d.get('author') or d.get('maintainer') or 'unknown')"
```

**crate**:

```bash
curl -s "https://crates.io/api/v1/crates/$ARGUMENTS/owners" | python3 -c "import sys,json; d=json.load(sys.stdin); print(', '.join(u['login'] for u in d['users']))"
```

Skip this step entirely if all three registries are available.

### 3. Print availability

Print:

```
$ARGUMENTS
  npm        <available | taken (owner: <name>) | unknown>
  pypi       <available | taken (owner: <name>) | unknown>
  crates.io  <available | taken (owner: <name>) | unknown>
```

If an owner matches the user (e.g. `srobinson` on crates.io, matching npm
maintainer, or matching PyPI author email), append `, that's you` inside the
owner parentheses so the user knows the existing claim is theirs. Example:
`taken (owner: srobinson, that's you)`.

If **no** registry is available, say so plainly and stop.

Otherwise print:

```
Claiming on: <comma-separated list of available registries>
Crates.io is permanent (yank only, no unpublish).
```

### 4. Scaffold all available registries

Create one shared directory and fill it with the per-registry artifacts. The
file sets do not collide; only the publish script is suffixed by registry.

Make the parent directory first:

```bash
mkdir -p ~/.name-claim/$ARGUMENTS/src
```

Then, for each **available** registry, run the matching block. Substitute the
literal values for `NAME`, `TITLE`, and `MODULE` into the sed commands before
running.

**Important sister-script edit.** The sibling `publish.sh` templates each end
with `rm -rf /tmp/claim-{{NAME}}`. Fine for a single-registry claim, fatal
here: the first script to finish would delete the shared dir mid-flight while
the user is still running the other two. Strip that line during scaffolding
(it stays in the sister skills, which run solo). The user can delete
`~/.name-claim/$ARGUMENTS/` by hand once all three publishes are done.

The `npm login` line in the npm publish script is **kept**: the user runs the
script in their own terminal, where the browser/2FA flow works fine.

**npm** (if available):

```bash
sed -e 's/{{NAME}}/NAME/g' -e 's/{{TITLE}}/TITLE/g' \
  $SKILL_DIR/../npm-claim/contents/package.json \
  > ~/.name-claim/$ARGUMENTS/package.json
sed 's/{{NAME}}/NAME/g' \
  $SKILL_DIR/../npm-claim/contents/placeholder.js \
  > ~/.name-claim/$ARGUMENTS/$ARGUMENTS.js
sed -e 's/{{NAME}}/NAME/g' -e '/^rm -rf /d' \
  $SKILL_DIR/../npm-claim/contents/publish.sh \
  > ~/.name-claim/$ARGUMENTS/publish-npm.sh
chmod +x ~/.name-claim/$ARGUMENTS/publish-npm.sh
```

**pypi** (if available):

```bash
sed -e 's/{{NAME}}/NAME/g' -e 's/{{TITLE}}/TITLE/g' -e 's/{{MODULE}}/MODULE/g' \
  $SKILL_DIR/../pypi-claim/contents/pyproject.toml \
  > ~/.name-claim/$ARGUMENTS/pyproject.toml
sed 's/{{NAME}}/NAME/g' \
  $SKILL_DIR/../pypi-claim/contents/placeholder.py \
  > ~/.name-claim/$ARGUMENTS/MODULE.py
sed -e 's/{{NAME}}/NAME/g' -e '/^rm -rf /d' \
  $SKILL_DIR/../pypi-claim/contents/publish.sh \
  > ~/.name-claim/$ARGUMENTS/publish-pypi.sh
chmod +x ~/.name-claim/$ARGUMENTS/publish-pypi.sh
```

**crate** (if available):

```bash
sed -e 's/{{NAME}}/NAME/g' -e 's/{{TITLE}}/TITLE/g' \
  $SKILL_DIR/../crate-claim/contents/Cargo.toml \
  > ~/.name-claim/$ARGUMENTS/Cargo.toml
sed 's/{{NAME}}/NAME/g' \
  $SKILL_DIR/../crate-claim/contents/lib.rs \
  > ~/.name-claim/$ARGUMENTS/src/lib.rs
sed -e 's/{{NAME}}/NAME/g' -e '/^rm -rf /d' \
  $SKILL_DIR/../crate-claim/contents/publish.sh \
  > ~/.name-claim/$ARGUMENTS/publish-crate.sh
chmod +x ~/.name-claim/$ARGUMENTS/publish-crate.sh
```

Run the scaffolds for all available registries in the same Bash message
(parallel). They write distinct paths so there are no race conditions.

### 5. Print the copy-paste block and stop

For every **available** registry, print one line in a single fenced bash
block. The user copies the whole block and pastes it into their terminal as
one chunk. `&&` chaining would make each script depend on the previous one
succeeding; if you want them independent the user can split. Default to
newline-separated commands (independent execution):

````
Scaffolded: ~/.name-claim/$ARGUMENTS/

```bash
cd ~/.name-claim/$ARGUMENTS && ./publish-npm.sh
cd ~/.name-claim/$ARGUMENTS && ./publish-pypi.sh
cd ~/.name-claim/$ARGUMENTS && ./publish-crate.sh
```
````

Include only the lines for registries that were available. Skip the lines for
registries that were taken or unknown.

Do NOT call Bash to run those commands. Do NOT print anything more about
status. The user runs them and observes the results in their own terminal.

## Prerequisites for publishing

The user handles auth in their own shell:

- npm: `npm login` (or `NPM_TOKEN` in env).
- pypi: API token in `~/.pypirc` or `TWINE_PASSWORD` env var.
- crate: `cargo login <token>` from https://crates.io/settings/tokens.

If a publish fails, the user retries by hand from the same scaffold dir. The
sister skills (`/npm-claim`, `/pypi-claim`, `/crate-claim`) remain available
for one-off retries that start fresh.
