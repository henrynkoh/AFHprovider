# Automated Data Collection

## Quick Start

To automatically populate `data/allProviders.json` with all providers from 143 pages:

```bash
# Install Puppeteer (one-time setup)
npm install puppeteer

# Run the scraper
npm run scrape
```

Or use the shell script:
```bash
chmod +x scripts/runScraper.sh
./scripts/runScraper.sh
```

## What the Scraper Does

1. **Opens a headless browser** using Puppeteer
2. **Visits each of the 143 pages** on the AFHC website
3. **Extracts provider information** from each listing:
   - Business name
   - Provider name
   - Address and area/city
   - Phone number (by clicking Contact buttons)
   - Website links
   - Descriptions
4. **Saves all data** to `data/allProviders.json`

## Expected Output

The scraper will:
- Process all 143 pages
- Extract ~6-12 providers per page
- Collect phone numbers from contact pop-ups
- Save everything in the same format as your table

## Time Estimate

- ~2 seconds per page (with rate limiting)
- Total time: ~5-10 minutes for all 143 pages

## Troubleshooting

If the scraper fails:
1. Check your internet connection
2. Ensure Puppeteer is installed: `npm install puppeteer`
3. The script saves progress, so you can re-run it
4. Check `data/allProviders.json` for partial results

## Manual Alternative

If automated scraping doesn't work, you can manually collect data by:
1. Visiting each page on the AFHC website
2. Clicking "Contact" on each provider
3. Adding the data to `data/allProviders.json`

