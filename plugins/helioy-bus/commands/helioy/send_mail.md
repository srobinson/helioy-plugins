---
description: Send a message to an agent on the helioy-bus.
argument-hint: <agent_id> <message> [reply_to]
---

Send a helioy-bus message.

Arguments provided: `$ARGUMENTS`

Parse `$ARGUMENTS` as:

- Word 1: `to` — recipient agent_id (use `*` to broadcast)
- Last word — if it contains `:` or is `*`, treat it as optional `reply_to`; otherwise it is part of the message body
- Everything between word 1 and `reply_to` (or end): message body

If `$ARGUMENTS` is empty:

1. Call list_agents to show available agents
2. Ask the user: recipient, message, and optionally a reply_to address
   Then send via send_message.

If `$ARGUMENTS` is non-empty, send immediately via send_message.
Omit reply_to unless the user explicitly provided one — the server defaults it to the sender.
Report delivery and nudge status.
