# Eval: Repeated "you have mail!" nudge

## Turn 1

### Tools called

1. `get_messages` with no arguments.

### Handling the result

The call returns 2 messages from other agents. I parse each message and extract the sender, content, and timestamp.

### Text response to the user

> You had 2 messages waiting:
>
> **From agent-A** (2026-03-07T10:01:00Z):
> Task X complete. Ready for next assignment.
>
> **From agent-B** (2026-03-07T10:02:30Z):
> Dependency resolved. Proceeding with build step.

(Exact content would reflect whatever the messages actually contain.)

---

## Turn 2

User says "you have mail!" again.

### Tools called

1. `get_messages` with no arguments.

### Why this is not skipped

The skill file is explicit: "Every 'you have mail!' nudge means new messages have arrived since your last check. Always call `get_messages` regardless of whether you checked recently. Never assume the inbox is empty without calling."

There is no recency guard, no deduplication logic, and no "already checked" short circuit. Each nudge is treated as a signal that new mail exists. The correct behavior is to call `get_messages` again unconditionally.

### Handling the result

Three possible outcomes:

- **New messages returned**: Display them in the same sender/content/timestamp format used in Turn 1.
- **Empty inbox**: The skill says "If the inbox is empty, continue without comment." So I would say nothing about mail and move on to whatever task is active.
- **Error**: Report the error to the user. The skill says "Do not silently swallow failures."

### Text response to the user (assuming 2 new messages arrived)

> You had 2 new messages:
>
> **From agent-C** (2026-03-07T10:05:00Z):
> Build failed on module Y. Need config review.
>
> **From agent-A** (2026-03-07T10:05:12Z):
> Waiting on your response re: task X priority.

### Text response to the user (assuming empty inbox)

No mention of mail. Continue with the current task or wait for further instructions.

---

## Key behavioral note

The skill eliminates any caching or staleness assumption. Turn 2 is mechanically identical to Turn 1: call `get_messages`, display results (or stay silent if empty), report errors if they occur. The nudge is the trigger; the tool call is mandatory every time.
