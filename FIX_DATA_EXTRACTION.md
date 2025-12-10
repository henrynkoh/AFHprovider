# Fixing Address and Phone Number Extraction

## Problem

The current data has:
- ✅ Business names (working)
- ❌ All cities show "Unknown, WA" 
- ❌ All phones show "Contact via AFHC"

## Solution

I've created an improved scraper that better extracts addresses and phone numbers.

## Quick Test (Recommended First)

Test the improved scraper on just 5 pages to see if it works:

```bash
npm run test-scrape
```

This will:
- Test on first 5 pages only
- Show you sample results with addresses and phones
- Save to `data/testProviders.json`
- Let you verify it's working before full re-scrape

## If Test Looks Good - Full Re-scrape

Once you confirm the test shows proper addresses and phones:

1. **Update the improved scraper** to do all 143 pages (I can help with this)
2. **Run full scrape**: `npm run scrape` (after updating)

## Alternative: Manual Enhancement

Since we have 572 providers with business names, you could:
1. Keep the current data
2. Manually add addresses/phones for the most important providers
3. Use the AFHC website to look up specific providers

## Next Steps

1. **Run test**: `npm run test-scrape`
2. **Check results**: Look at `data/testProviders.json`
3. **If good**: We'll update the scraper for full re-scrape
4. **If not**: We'll adjust the extraction logic

The improved scraper has better:
- Address pattern matching
- Phone number extraction from contact modals
- City extraction from addresses
- Error handling

Let me know what the test shows!

