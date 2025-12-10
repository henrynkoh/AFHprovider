# Scraper Setup Guide

## 🚀 Quick Start

### Step 1: Install Puppeteer

```bash
npm install puppeteer
```

This will install Puppeteer and Chromium (takes a few minutes, ~200MB download).

### Step 2: Run the Scraper

```bash
npm run scrape
```

Or directly:
```bash
node scripts/scrapeWithPuppeteer.js
```

## ⏱️ What to Expect

- **Time**: ~5-10 minutes for all 143 pages
- **Progress**: Shows progress every page
- **Saves**: Progress every 10 pages (can resume if interrupted)
- **Output**: Saves to `data/allProviders.json`

## 📊 Progress Updates

The scraper will show:
```
📄 Fetching page 1/143...
   Found 6 provider cards
   ✅ Extracted 6 providers from page 1
✅ Page 1 complete. Total: 6 providers

💾 Progress saved (60 providers so far)
```

## 🔄 Resume Capability

If the scraper stops (network error, etc.):
- Progress is saved automatically
- Just run `npm run scrape` again
- It will resume from where it left off

## ✅ Success Indicators

When complete, you'll see:
```
🎉 Successfully scraped 1500 providers!
💾 Saved to: data/allProviders.json
✨ Scraping complete!
```

## 🐛 Troubleshooting

### "Cannot find module 'puppeteer'"
- Run: `npm install puppeteer`

### "Chromium download failed"
- Check internet connection
- Try: `npm install puppeteer --force`

### Scraper stops mid-way
- This is normal if there's a network issue
- Just run `npm run scrape` again - it will resume

### No providers found on a page
- Some pages might be empty
- The scraper will continue to next page

## 📝 After Scraping

Once complete:
1. Check `data/allProviders.json` - should have many providers
2. Refresh your app at `http://localhost:3000`
3. All providers will appear in the table!

## 💡 Tips

- Run during off-peak hours for faster scraping
- Keep terminal open while scraping
- Don't close browser if running in non-headless mode
- Progress is saved, so safe to stop and resume

