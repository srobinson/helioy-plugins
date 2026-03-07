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
- **Send message**: Call `send_message` with `to` (agent_id or `*` for broadcast) and `content`
- **List agents**: Call `list_agents` to see who is available to message

Display received messages clearly (sender, content, timestamp). If inbox is empty, continue without comment.
