#!/bin/bash
# Session initialization script
# Customize for your project's startup needs

echo "Initializing downstream-landing session..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start dev server in background (optional - uncomment if desired)
# npm run dev &

echo "Ready to work!"
