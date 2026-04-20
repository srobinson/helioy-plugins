---
name: mail
description: >
  Use for any helioy-bus mail operation: checking your inbox, sending messages
  to other agents, broadcasting to all agents, or responding to a "you have
  mail!" nudge. Use at the start of any task to check for directives from peer
  agents. Also use when the user says things like "reply to that agent", "tell
  nancy I'm done", "who's on the bus?", "who else is online?", "check for
  messages", "check for directives", or "send a message to X". Any inter-agent
  communication goes through this skill.
---

# Mail Operations

## Check inbox on every nudge

Every "you have mail!" nudge means new messages have arrived since your last check. Always call `get_messages` regardless of whether you checked recently. Never assume the inbox is empty without calling.

At the start of any new task, check for messages. Directives from peer agents or the orchestrator may change your priorities.

## When to reply

Always reply to messages that contain directives or questions. If a message is purely informational and doesn't require a response, you can acknowledge it with a brief reply or choose not to reply at all. If the message is reply_all that is an invitation to join the conversation.

Never ask the human what to do with a message from another agent. Use your judgment to determine if a reply is needed, and if so, what it should say. If you're unsure, it's better to ask for clarification in your reply than to ignore the message.

## Tools

- **Read inbox**: `get_messages` with no arguments. Agent ID resolves automatically.
- **Discover recipients**: Use `list_agents` to see who is on the bus. Filter by tmux session to find agents in your session.
- **Send message**: `send_message` with `to` set to a specific agent ID, `role:<type>`, or `*` for broadcast. Only use broadcast in exceptional circumstances. Never set `nudge: false` unless you have verified the recipient is unreachable. The bus throttles nudges to once per 30s per recipient, so there is no cost to leaving it on. Sender identity is resolved automatically from your registration. Do not attempt to set a sender name.
- **Reply to a message**: Use the original message's `reply_to` field as your `to` value. Never reply to `*` unless the sender explicitly set `reply_to: "*"`.

## Composing messages

Write concise, actionable messages. A good pattern: current status + what you need or what's next. Skip greetings and pleasantries. Other agents parse these programmatically.

## Displaying agents

When `list_agents` returns results, render them as a markdown table. Use whatever fields the response contains, mapping them to readable column headers. Typical shape:

| Agent ID | Name | Status | Last Seen |
|----------|------|--------|-----------|
| `abc123` | nancy | online | 2 min ago |

If the response includes additional fields (role, queue depth, etc.), add them as columns. Never dump raw JSON.

## Displaying messages

Render received messages as a markdown table. Typical shape:

| From | Content | Sent |
|------|---------|------|
| `nancy` | Task ALP-42 complete | 14:03:21 |

If the inbox is empty, continue without comment. Never dump raw JSON.

## Errors

If `get_messages` or `send_message` fails, report the error to the user. Do not silently swallow failures.
