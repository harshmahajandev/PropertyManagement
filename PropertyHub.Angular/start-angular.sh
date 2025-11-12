#!/bin/bash

echo "=========================================="
echo "PropertyHub Angular Application Startup"
echo "=========================================="

echo "1. Checking if you're in the right directory..."
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in PropertyHub.Angular directory"
    echo "Please navigate to: PropertyHub/PropertyHub.Angular"
    exit 1
fi

echo "✅ Found package.json"

echo ""
echo "2. Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  Some dependency issues detected, trying with legacy peer deps..."
    npm install --legacy-peer-deps
fi

echo ""
echo "3. Starting Angular development server..."
echo "The server will start on http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start