---
description: Send a message to an agent on the helioy-bus.
argument-hint: <agent_id> <message>
---

Send a helioy-bus message.

Arguments provided: `$ARGUMENTS`

If `$ARGUMENTS` is empty:
1. Call list_agents to show available agents
2. Ask the user: which agent to send to, and what message
Then send via the helioy-bus send_message tool.

If `$ARGUMENTS` is non-empty:
- First word is the recipient agent_id (use `*` to broadcast)
- Everything after is the message body
Send immediately via send_message and report delivery and nudge status.
