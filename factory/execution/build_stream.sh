#!/bin/bash
#
# build_stream.sh - Build a stream for production deployment
#
# Usage: ./build_stream.sh <stream-name>
#
# Runs Next.js build with static export for the specified stream.
# Output goes to stream-<name>/out/
#
# Example:
#   ./build_stream.sh my-client
#

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <stream-name>"
    echo "Example: $0 my-client"
    exit 1
fi

NAME="$1"
DIR="stream-$NAME"

if [ ! -d "$DIR" ]; then
    echo "Error: Stream directory '$DIR' not found"
    exit 1
fi

echo "Building stream: $NAME"
echo ""

cd "$DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Run build
echo "Running Next.js build..."
npm run build

echo ""
echo "Build complete!"
echo "Output: $DIR/out/"
echo ""
echo "To preview locally:"
echo "  npx serve $DIR/out"
echo ""
echo "To deploy:"
echo "  Upload $DIR/out/ to your hosting provider"
echo ""
