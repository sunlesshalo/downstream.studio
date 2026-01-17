#!/bin/bash
# Safety check for dangerous commands
# Used by PreToolUse hook in autonomous mode

COMMAND="$1"

# High-severity blocks
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "rm -rf \$HOME"
    "rm -rf .git"
    "git push --force"
    "git push -f"
    "git reset --hard"
    "sudo "
    "curl.*|.*bash"
    "wget.*|.*bash"
    "> /etc/"
    "> /usr/"
    "chmod 777"
)

# Check against patterns
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qE "$pattern"; then
        echo "BLOCKED: Dangerous command detected: $pattern"
        exit 1
    fi
done

# Medium-severity warnings (log but allow)
WARN_PATTERNS=(
    "DROP DATABASE"
    "TRUNCATE"
    "DELETE FROM.*WHERE 1=1"
    "git add .env"
)

for pattern in "${WARN_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qiE "$pattern"; then
        echo "WARNING: Potentially dangerous: $pattern" >> memory/CONTEXT.md
    fi
done

exit 0
