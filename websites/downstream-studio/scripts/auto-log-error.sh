#!/bin/bash
# Auto-log failed commands to CONTEXT.md
# Called by PostToolUse hook

# Read from stdin (hook passes JSON)
INPUT=$(cat)

# Extract exit code and command
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_result.exit_code // 0')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // "unknown"')

# Only log if command failed (non-zero exit)
if [ "$EXIT_CODE" != "0" ] && [ "$EXIT_CODE" != "null" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

    # Append to CONTEXT.md
    if [ -f "memory/CONTEXT.md" ]; then
        echo "" >> memory/CONTEXT.md
        echo "[$TIMESTAMP] [auto-error] Command failed (exit $EXIT_CODE): '$COMMAND'" >> memory/CONTEXT.md
    fi
fi

exit 0
