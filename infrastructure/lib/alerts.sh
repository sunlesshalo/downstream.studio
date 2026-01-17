#!/bin/bash
# alerts.sh
# Shared alert functions for all infrastructure scripts
# Source this file: source "$(dirname "$0")/lib/alerts.sh"

# Alert for errors that need attention
alert_error() {
    local title="$1"
    local message="$2"
    local script_name="${3:-$(basename "$0")}"

    echo "[ERROR] $title: $message"

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"$title\",
                    \"description\": \"$message\",
                    \"color\": 15158332,
                    \"fields\": [{
                        \"name\": \"Script\",
                        \"value\": \"$script_name\",
                        \"inline\": true
                    }],
                    \"footer\": {\"text\": \"DownStream Ops\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null 2>&1
    fi
}

# Alert for warnings (recoverable issues)
alert_warning() {
    local title="$1"
    local message="$2"

    echo "[WARNING] $title: $message"

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"$title\",
                    \"description\": \"$message\",
                    \"color\": 16744256,
                    \"footer\": {\"text\": \"DownStream Ops\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null 2>&1
    fi
}

# Wrapper to run command and alert on failure
run_or_alert() {
    local description="$1"
    shift
    local cmd="$@"

    if ! eval "$cmd"; then
        alert_error "$description failed" "Command: $cmd"
        return 1
    fi
    return 0
}

# Git operations with error handling
safe_git_pull() {
    local project_dir="${1:-.}"
    cd "$project_dir"

    # Check for lock file first
    if [ -f ".git/index.lock" ]; then
        if [ "$(find ".git/index.lock" -mmin +5 2>/dev/null)" ]; then
            alert_warning "Removing stale git lock" "Lock file was >5 min old"
            rm -f ".git/index.lock"
        else
            # Lock file is fresh, another process might be running
            return 0
        fi
    fi

    if ! git pull origin main --quiet 2>/dev/null; then
        # Check if it's because of local changes
        if [ -n "$(git status --porcelain)" ]; then
            alert_warning "Git pull blocked by local changes" "Attempting stash..."
            git stash --quiet 2>/dev/null || true
            if git pull origin main --quiet 2>/dev/null; then
                git stash pop --quiet 2>/dev/null || true
            else
                alert_error "Git pull failed" "Could not sync even after stashing"
                return 1
            fi
        else
            alert_error "Git pull failed" "Unknown reason - check server connectivity"
            return 1
        fi
    fi
    return 0
}

safe_git_push() {
    local project_dir="${1:-.}"
    local commit_msg="${2:-Auto-commit}"
    cd "$project_dir"

    if [ -z "$(git status --porcelain)" ]; then
        # Nothing to commit
        return 0
    fi

    if ! git add -A; then
        alert_error "Git add failed" "Could not stage changes"
        return 1
    fi

    if ! git commit -m "$commit_msg" --quiet 2>/dev/null; then
        alert_error "Git commit failed" "Could not create commit"
        return 1
    fi

    if ! git push origin main --quiet 2>/dev/null; then
        alert_error "Git push failed" "Commit created but could not push to GitHub"
        return 1
    fi

    return 0
}
