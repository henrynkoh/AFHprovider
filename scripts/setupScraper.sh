#!/bin/bash

echo "🔧 Setting up AFH Provider Scraper..."
echo ""

# Check if Puppeteer is installed
if ! npm list puppeteer &> /dev/null; then
    echo "📦 Installing Puppeteer (this may take a few minutes)..."
    npm install puppeteer
    echo "✅ Puppeteer installed!"
else
    echo "✅ Puppeteer already installed"
fi

echo ""
echo "🚀 Ready to scrape!"
echo ""
echo "To start scraping, run:"
echo "  npm run scrape"
echo ""
echo "Or:"
echo "  node scripts/scrapeWithPuppeteer.js"
echo ""

