---
name: nancy-send-message
description: Send a message to the orchestrator. Use for blockers, progress updates, requesting review, or communicating status during autonomous execution.
---

# Send Message

```bash
ralph msg <type> "<message>"
```

Types: `blocker`, `progress`, `review-request`

Examples:

```bash
ralph msg blocker "Cannot proceed: missing API credentials"
ralph msg progress "Completed database migration"
ralph msg review-request "Feature complete, ready for verification"
```
