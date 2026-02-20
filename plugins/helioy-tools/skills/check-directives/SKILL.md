---
name: check-directives
description: Check for orchestrator messages. Use at turn start, after major tasks, and ALWAYS before marking task complete.
---

# Check Directives

## Check Inbox

```bash
nancy inbox
```

## Process Each Message

For each message file:

1. **Read** the message
2. **Act** based on type:
   - `directive` - Follow the specific instruction
   - `guidance` - Adjust your approach accordingly
   - `stop` - End task immediately, do not continue
3. **Archive** immediately after acting:

   ```bash
   nancy archive <filename>
   ```

## When to Check

- At start of each session
- After completing major tasks or phases
- **ALWAYS before marking task COMPLETE**

## Pre-Completion Check

Before creating the COMPLETE file, verify:

```bash
nancy inbox
```

If output shows ANY pending directives:

- Process and archive them first
- Do NOT mark complete until inbox is empty

## After Processing

After archiving all directives, clear the notification state:

```bash
rm -f "${NANCY_CURRENT_TASK_DIR}/.directive_check_notified"
```
