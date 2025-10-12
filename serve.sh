#!/bin/bash

# Blog Development Server Script
# This script ensures you're using the correct Ruby version and starts Jekyll

echo "🚀 Starting Blog Development Server"
echo "=================================="
echo ""

# Set PATH to use Homebrew Ruby
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"

# Check Ruby version
echo "📋 Ruby version:"
ruby --version
echo ""

# Check Jekyll version
echo "📋 Jekyll version:"
bundle exec jekyll --version
echo ""

# Start Jekyll server
echo "🌐 Starting Jekyll server..."
echo "Your blog will be available at: http://localhost:4000"
echo "Press Ctrl+C to stop the server"
echo ""

bundle exec jekyll serve --host 0.0.0.0 --port 4000
