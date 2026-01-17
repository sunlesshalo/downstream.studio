#!/bin/bash
# One-time project setup
# Run after cloning or copying template

echo "Setting up downstream-landing..."

# Make scripts executable
chmod +x scripts/*.sh
chmod +x init.sh

# Install dependencies
npm install

# Create .tmp directory for working files
mkdir -p .tmp

echo "Setup complete!"
echo "Run '/start' to begin a session."
