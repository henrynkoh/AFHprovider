#!/bin/bash

# Script to install dependencies and run the scraper
echo "🔧 Installing Puppeteer..."
npm install puppeteer

echo ""
echo "🚀 Starting scraper..."
node scripts/scrapeWithPuppeteer.js

echo ""
echo "✅ Done! Check data/allProviders.json for results."

