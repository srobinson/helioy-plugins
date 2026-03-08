#!/usr/bin/env bash
# crew-precompact.sh — Coordinator PreCompact safety net
# ---------------------------------------------------------------------------
# Fires when a helioy-crew coordinator is about to compact.
# Plugin-level PreCompact already handles `am sync`.
# This script handles crew-specific concerns:
#   1. Send death report to orchestrator via helioy-bus
#   2. Kill the coordinator process
# ---------------------------------------------------------------------------

set -euo pipefail

# Read tool input from stdin (Claude passes PreCompact context as JSON)
INPUT=$(cat 2>/dev/null || true)

# Extract session ID if available
SESSION_ID="${HELIOY_SESSION_ID:-unknown}"

# Send death report via helioy-bus
# The bus MCP may not be reachable at this point, so fall back to file-based message
BUS_INBOX="${HOME}/.claude/helioy-bus/orchestrator/inbox"
if [ -d "$BUS_INBOX" ]; then
    TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    FILENAME="death-${SESSION_ID}-$(date +%s).md"

    cat > "${BUS_INBOX}/${FILENAME}" <<EOF
**Type:** death
**From:** coordinator
**Priority:** urgent
**Timestamp:** ${TIMESTAMP}
**Session:** ${SESSION_ID}

## PreCompact Death Report

This coordinator hit context compaction and is terminating.

- **Session ID**: ${SESSION_ID}
- **Reason**: PreCompact triggered (context window exhausted)
- **Memory**: am sync handled by plugin-level PreCompact hook
- **Action required**: Orchestrator should check for uncommitted work and decide whether to respawn a fresh coordinator for remaining tasks.

> This is an automated message from crew-precompact.sh
EOF

    echo "Death report sent to orchestrator inbox: ${FILENAME}" >&2
fi

# Kill self. The parent process (tmux pane shell) will remain,
# but the claude process exits. The orchestrator detects this
# via the bus message and cleans up the pane.
#
# We use SIGTERM on the parent claude process (our grandparent).
# $PPID is the claude process that invoked this hook.
kill -TERM "$PPID" 2>/dev/null || true

# Exit cleanly so the hook doesn't block
exit 0
