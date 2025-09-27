#!/bin/bash
# Fallback build script for Vercel
echo "Starting build process..."

# Try to build with different methods
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm build
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm run build:vite
else
    echo "Using npx directly..."
    npx vite build
fi

echo "Build completed!"