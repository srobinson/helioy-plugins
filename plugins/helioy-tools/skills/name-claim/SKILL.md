---
name: name-claim
description: >
  Check a package name's availability across npm, PyPI, and crates.io in parallel.
  Use when the user says "name claim", "check name", "is X available", or wants to
  reserve a name across multiple package registries. Takes a name as an argument.
  Reports per-registry status and points to the registry-specific claim skills
  (`/npm-claim`, `/pypi-claim`, `/crate-claim`) for the available ones.
---

# name-claim

The name to check is: `$ARGUMENTS`

## Steps

### 1. Validate

If `$ARGUMENTS` is empty or whitespace, tell the user to provide a name and stop.

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

Any other status: report as unknown.

### 3. Report

Print a compact status table:

```
$ARGUMENTS
  npm        <available | taken | unknown>
  pypi       <available | taken | unknown>
  crates.io  <available | taken | unknown>
```

Then, for each registry where the name is **available**, emit the matching follow-up command on its own line:

- `/helioy-tools:npm-claim $ARGUMENTS`
- `/helioy-tools:pypi-claim $ARGUMENTS`
- `/helioy-tools:crate-claim $ARGUMENTS`

If the name is taken everywhere, say so plainly and stop.

Do NOT scaffold or publish anything from this skill. Defer to the registry-specific skills.
