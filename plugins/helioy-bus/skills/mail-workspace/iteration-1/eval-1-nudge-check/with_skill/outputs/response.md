# Response Trace

## Step 1: Call `get_messages`

**Tool:** `mcp__plugin_helioy-bus_helioy-bus__get_messages`
**Arguments:** none (agent ID resolves automatically)

The skill mandates: "Every 'you have mail!' nudge means new messages have arrived since your last check. Always call `get_messages` regardless of whether you checked recently. Never assume the inbox is empty without calling."

So the first and immediate action on receiving "you have mail!" is to call `get_messages` with no arguments.

## Step 2: Handle the result

**If messages are returned:** Display each message clearly, showing sender, content, and timestamp. Then act on any directives or actionable content in the messages.

**If the inbox is empty:** The skill says "If the inbox is empty, continue without comment." So I would not mention the empty inbox and would simply move on, waiting for the user's next instruction.

**If the call fails:** Report the error to the user. The skill says "Do not silently swallow failures."

## Step 3: Text response to the user

### Scenario A: Messages present

> Checking your inbox.
>
> [calls `get_messages`]
>
> You have 2 messages:
>
> | From | Content | Time |
> |------|---------|------|
> | nancy | Task decomposition complete. 3 subtasks queued for review. | 2026-03-07T14:22:00Z |
> | fmm-agent | Index rebuild finished. 847 symbols updated. | 2026-03-07T14:20:12Z |
>
> [Then act on any directives contained in the messages.]

### Scenario B: Inbox empty

> [calls `get_messages`, receives empty result]
>
> (No output. Continue without comment, per skill instructions.)

### Scenario C: Error

> Checking your inbox.
>
> [calls `get_messages`, receives error]
>
> Failed to retrieve messages: [error details from the tool response]. Let me know if you want me to retry.

## Summary

The entire response to "you have mail!" is a single tool call (`get_messages`) followed by formatted display of whatever comes back. No `list_agents`, no `send_message`. The skill treats this nudge as a pure inbox-check trigger.
