# Data Collection Guide

This guide explains how to collect all provider data from all 143 pages of the Adult Family Home Council website.

## Current Status

- ✅ Application structure is set up
- ✅ API route created (`/app/api/providers/route.ts`)
- ✅ Frontend updated to fetch from API
- ⏳ Data collection script needs implementation
- ⏳ Need to collect data from all 143 pages

## Approach

Since the AFHC website requires JavaScript rendering and has contact information in pop-ups, you have a few options:

### Option 1: Manual Data Collection (Recommended for now)

1. Visit: https://adultfamilyhomecouncil.org/home-finder?near_address=Centralia%2C+Washington%2C+USA
2. For each page (1-143):
   - Click through each provider card
   - Click "CONTACT" button to get phone number
   - Extract all information
   - Add to `data/allProviders.json`

### Option 2: Automated Scraping with Puppeteer

1. Install Puppeteer:
   ```bash
   npm install puppeteer @types/puppeteer
   ```

2. Update `scripts/collectProviders.ts` to use Puppeteer
3. Run the script:
   ```bash
   npx tsx scripts/collectProviders.ts
   ```

### Option 3: Use Browser Extension

Use a browser extension like "Web Scraper" or "Data Miner" to extract data from all pages.

## Data Structure

Each provider should follow this structure:

```json
{
  "id": "unique-id",
  "areaCity": "City, State",
  "businessName": "Business Name",
  "providerName": "Provider Name",
  "phoneNumber": "(XXX) XXX-XXXX",
  "website": "website-url",
  "yearStarted": 2020,
  "residentBeds": 6,
  "privatePayMedicaidRatio": "50/50",
  "others": "Additional information"
}
```

## Steps to Complete

1. **Collect Data**: Use one of the methods above to collect all provider data
2. **Save to File**: Save all providers to `data/allProviders.json`
3. **Update API**: The API route will automatically load from this file if it exists
4. **Test**: Verify all providers display correctly in the table

## Notes

- The AFHC website has 143 pages of results
- Each page typically shows multiple providers
- Contact information (phone numbers) are in pop-up modals
- Be respectful with rate limiting if automating
- Some fields may not be available for all providers

## Current Data

Currently, we have 12 sample providers in `data/sampleData.ts` with verified phone numbers from Centralia, WA area.

