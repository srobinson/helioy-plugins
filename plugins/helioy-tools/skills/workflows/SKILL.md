---
name: workflows
description: >
  List the user's documented workflows in ~/.mdx/workflows/. Use when the user asks
  "what workflows do I have?", "list my workflows", "show workflows", "/workflows",
  or otherwise wants to see what reusable orchestration patterns are on disk.
---

List the workflow docs the user has captured.

Run:

```bash
ls -1 ~/.mdx/workflows/ 2>/dev/null
```

If the directory is empty or missing, say so in one line. Otherwise, present each filename without the `.md` extension as a bullet list. Do not read the file contents unless the user asks for a specific workflow.
