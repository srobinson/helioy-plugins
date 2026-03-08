---
name: mail
description: >
  Use for any helioy-bus mail operation: checking your inbox, sending messages
  to other agents, broadcasting to all agents, or responding to a "you have mail!"
  nudge. Use at the start of any task to check for directives from peer agents.
  Also use when the user says things like "reply to that agent", "tell nancy I'm done",
  "who else is online?", "check for messages", "check for directives", or
  "send a message to X". Any inter-agent communication goes through this skill.
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
- **Send message**: `send_message` with `to` (agent_id or `*` for broadcast), `content`, and optionally `reply_to` (defaults to your agent_id; set to `*` for group-thread replies).
- **Reply to a message**: Use the original message's `reply_to` field as your `to` value. Never reply to `*` unless the sender explicitly set `reply_to: "*"`.
- **List agents**: `list_agents` to see who is available.

## Composing messages

Write concise, actionable messages. A good pattern: current status + what you need or what's next. Skip greetings and pleasantries. Other agents parse these programmatically.

## Displaying messages

Show received messages clearly: sender, content, timestamp. If the inbox is empty, continue without comment.

## Errors

If `get_messages` or `send_message` fails, report the error to the user. Do not silently swallow failures.
