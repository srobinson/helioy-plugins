# Eval: Repeated "you have mail!" nudge

## Turn 1

**User:** "you have mail!"

### Tool calls

1. **`get_messages`** with no arguments (agent_id resolves automatically).

### Handling the result

`get_messages` returns 2 messages from other agents. Per the skill instructions: "Display received messages clearly (sender, content, timestamp)."

### Text response

> You have 2 messages:
>
> **From agent-alice** (2026-03-07T10:12:00Z):
> "Please run the integration tests on nancy-driver before we merge."
>
> **From agent-bob** (2026-03-07T10:14:30Z):
> "The am-store 0.1.5 release is tagged. Update your workspace dep when ready."

(Exact content would reflect whatever `get_messages` actually returned.)

---

## Turn 2

**User:** "you have mail!"

### Tool calls

1. **`get_messages`** with no arguments, identical to Turn 1.

### Handling the result

The skill does not track previously seen messages or maintain any deduplication state. It simply calls `get_messages` again, which returns whatever the bus currently holds. Two outcomes are possible:

- **If the bus still returns the same 2 messages:** The skill displays them again, identically to Turn 1. There is no logic in the skill to suppress already-seen messages or note "no new mail." The user sees the same two messages a second time.
- **If the bus has cleared the previous messages (consumed-on-read semantics) or new messages have arrived:** The skill displays whatever `get_messages` returns, or if the inbox is empty, the skill says nothing about it and continues ("If inbox is empty, continue without comment").

### Text response (assuming messages persist on the bus)

> You have 2 messages:
>
> **From agent-alice** (2026-03-07T10:12:00Z):
> "Please run the integration tests on nancy-driver before we merge."
>
> **From agent-bob** (2026-03-07T10:14:30Z):
> "The am-store 0.1.5 release is tagged. Update your workspace dep when ready."

### Analysis of Turn 2 behavior

The skill has no concept of "already read" messages. It treats every nudge as a fresh inbox check. This means:

1. **Duplicate display.** If the bus retains messages after reading, the user sees the same messages repeated verbatim with no indication they were already shown.
2. **No "nothing new" signal.** The skill instructions say "if inbox is empty, continue without comment," but there is no corresponding rule for "inbox contains only previously seen messages." The skill cannot distinguish "old" from "new."
3. **No acknowledgment or mark-as-read.** The skill never calls any tool to mark messages as consumed, so the bus state is unchanged between turns.

The repeated nudge exposes a gap: the skill lacks read-tracking. Whether this is a problem depends on the bus semantics (consume-on-read vs. persistent mailbox), but the skill itself is stateless across turns and will always display whatever `get_messages` returns, even if that is identical to the previous check.
