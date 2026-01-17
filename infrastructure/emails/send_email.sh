#!/bin/bash
# send_email.sh
# Sends emails via Resend API
#
# Usage: ./send_email.sh <template> <to_email> <subject> [VAR=VALUE ...]
#
# Example:
#   ./send_email.sh order-confirmation customer@example.com "Order Confirmed" \
#     STREAM_ID=my-story AMOUNT=49 DATE="2026-01-06"

set -e

SCRIPT_DIR="$(dirname "$0")"
TEMPLATE=$1
TO_EMAIL=$2
SUBJECT=$3
shift 3

# Check for API key
if [ -z "$RESEND_API_KEY" ]; then
    echo "Error: RESEND_API_KEY not set"
    exit 1
fi

# Load template
TEMPLATE_FILE="$SCRIPT_DIR/$TEMPLATE.html"
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: Template not found: $TEMPLATE_FILE"
    exit 1
fi

HTML=$(cat "$TEMPLATE_FILE")

# Replace variables
for arg in "$@"; do
    KEY="${arg%%=*}"
    VALUE="${arg#*=}"
    HTML="${HTML//\{\{$KEY\}\}/$VALUE}"
done

# Remove any remaining template conditionals (simple approach)
HTML=$(echo "$HTML" | sed 's/{{#if [^}]*}}//g' | sed 's/{{\/if}}//g')
HTML=$(echo "$HTML" | sed 's/{{[^}]*}}//g')

# Send via Resend
curl -s -X POST 'https://api.resend.com/emails' \
    -H "Authorization: Bearer $RESEND_API_KEY" \
    -H 'Content-Type: application/json' \
    -d "{
        \"from\": \"DownStream <hello@downstream.ink>\",
        \"to\": [\"$TO_EMAIL\"],
        \"subject\": \"$SUBJECT\",
        \"html\": $(echo "$HTML" | jq -Rs .)
    }"

echo ""
echo "Email sent to $TO_EMAIL"
