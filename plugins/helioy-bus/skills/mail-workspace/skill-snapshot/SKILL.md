---
name: mail
description: >
  Use for any helioy-bus mail operation: checking your inbox, sending messages
  to other agents, broadcasting to all agents, or responding to a "you have mail!"
  nudge. Use at the start of any task to check for directives from peer agents.
---

# Mail Operations

Use the helioy-bus MCP tools for all mail operations:

- **Read inbox**: Call `get_messages` — no arguments needed, agent_id resolves automatically
- **Send message**: Call `send_message` with `to` (agent_id or `*` for broadcast), `content`, and optionally `reply_to` (defaults to your agent_id — set to `*` for group-thread replies)
- **Reply to a message**: Use `message.reply_to` as the `to` field — never reply to `*` unless the sender explicitly set `reply_to: "*"`
- **List agents**: Call `list_agents` to see who is available to message

Display received messages clearly (sender, content, timestamp). If inbox is empty, continue without comment.
