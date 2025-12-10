# Update Phone Numbers

## Current Issue

✅ **Addresses**: Working! (Centralia, WA, etc.)
❌ **Phone Numbers**: All show "Contact via AFHC"

## Quick Fix: Update Known Phone Numbers

I've created a script that updates the phone numbers we verified earlier:

```bash
npm run update-phones
```

This will update:
- Arianna Care LLC → (360) 807-4237
- Beloved AFH → (360) 669-0806
- Stars AFH LLC → (201) 800-5723
- Vivian's House → (360) 736-9178

## Why Phone Extraction Isn't Working

The contact button clicking in Puppeteer isn't working because:
1. The modal might require specific JavaScript events
2. The modal might be in an iframe or shadow DOM
3. The website might detect automated clicking

## Solutions

### Option 1: Use Known Phones (Quick)
Run: `npm run update-phones`
- Updates the 4 providers we know
- At least some will have real phone numbers

### Option 2: Manual Updates
1. Visit AFHC website
2. Click "Contact" for each provider
3. Add phone numbers to the JSON file

### Option 3: Improve Scraper (Long-term)
- Use non-headless mode to see what's happening
- Add screenshots to debug
- Try different click methods

## Recommendation

Run `npm run update-phones` first to at least get some real phone numbers showing!

