# Response Trace

## Step 1: Check inbox

**Tool call:** `mcp__plugin_helioy-bus_helioy-bus__get_messages` with no arguments.

The skill says "Call `get_messages` — no arguments needed, agent_id resolves automatically." The user prompt "you have mail!" is a nudge, so the first action is to read the inbox.

## Step 2: Handle the result

Two branches depending on the response:

### If messages are present

Display each message clearly, showing sender, content, and timestamp. Example text response:

> You have 2 messages:
>
> **From:** coordinator | **Time:** 2026-03-07T14:22:00Z
> Run the integration tests on runtime-driver and report results.
>
> **From:** fmm-indexer | **Time:** 2026-03-07T14:18:00Z
> Sidecar regeneration complete for runtime workspace.

Then proceed to act on any directives contained in the messages (the skill says "Use at the start of any task to check for directives from peer agents").

### If inbox is empty

The skill states: "If inbox is empty, continue without comment." So the response would contain no mention of mail at all. The agent would simply move on silently.

## Step 3: Text response to the user

The complete response flow for a non-empty inbox:

```
1. Call mcp__plugin_helioy-bus_helioy-bus__get_messages  (no arguments)
2. Format each returned message as: sender, content, timestamp
3. Present the messages to the user
4. If any message contains a directive or task, begin acting on it
```

For an empty inbox:

```
1. Call mcp__plugin_helioy-bus_helioy-bus__get_messages  (no arguments)
2. Result is empty — say nothing about mail, continue with whatever else is relevant
```

No other tools are called. The skill does not instruct calling `list_agents` or `send_message` in response to a simple nudge check. Only `get_messages` is needed.
