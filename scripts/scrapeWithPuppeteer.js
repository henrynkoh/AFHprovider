/**
 * Puppeteer-based scraper for AFH providers
 * This script scrapes all 143 pages from the Adult Family Home Council website
 * 
 * To run: npm run scrape
 * Make sure to install: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://adultfamilyhomecouncil.org/home-finder';
const TOTAL_PAGES = 143;
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'scraping-progress.json');

let allProviders = [];
let startPage = 1;

// Load progress if exists
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      allProviders = progress.providers || [];
      startPage = progress.lastPage + 1 || 1;
      console.log(`📂 Resuming from page ${startPage} (${allProviders.length} providers already collected)`);
    }
  } catch (e) {
    console.log('📝 Starting fresh scrape');
  }
}

// Save progress
function saveProgress(pageNumber) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      lastPage: pageNumber,
      providers: allProviders,
      timestamp: new Date().toISOString()
    }, null, 2));
  } catch (e) {
    console.error('Error saving progress:', e.message);
  }
}

/**
 * Extract provider information from page content
 */
async function extractProvidersFromPage(page, pageNumber) {
  const providers = [];
  
  try {
    // Wait for content to load
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for dynamic content
    
    // Extract all provider cards - improved extraction
    const providerCards = await page.evaluate(() => {
      const cards = [];
      
      // Get all text content from the page to find provider listings
      const bodyText = document.body.textContent || '';
      
      // Look for provider cards - try multiple approaches
      // Method 1: Look for elements containing "Bed Available"
      const bedAvailableElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Bed Available') && text.length > 50;
      });
      
      // Method 2: Look for elements with addresses
      const addressElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return /\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court)[^,\n]*,\s*[^,\n]+,\s*[A-Z]{2}\s*\d{5}/.test(text);
      });
      
      // Combine and deduplicate
      const allElements = [...new Set([...bedAvailableElements, ...addressElements])];
      
      return allElements.map((card, index) => {
        const text = card.textContent || '';
        const innerHTML = card.innerHTML || '';
        
        // Extract business name - improved pattern
        let businessName = '';
        const namePatterns = [
          /(?:^|\n)([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|LLC|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/,
          /Bed Available\s+([A-Z][A-Za-z\s&'.-]{5,60}?)(?:\n|$)/,
          /^([A-Z][A-Za-z\s&'.-]{5,60}?)\s*\n/
        ];
        
        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            businessName = match[1].trim();
            break;
          }
        }
        
        // Extract address - improved pattern
        const addressPattern = /(\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)[^,\n]*(?:,\s*[^,\n]+){0,2},\s*[A-Z]{2}\s*\d{5})/;
        const addressMatch = text.match(addressPattern);
        const address = addressMatch ? addressMatch[1].trim() : '';
        
        // Extract distance
        const distanceMatch = text.match(/\(([^)]*miles?[^)]*)\)/i);
        const distance = distanceMatch ? distanceMatch[1].trim() : '';
        
        // Extract description - text between address and buttons
        let description = '';
        if (address) {
          const addressIndex = text.indexOf(address);
          if (addressIndex !== -1) {
            const afterAddress = text.substring(addressIndex + address.length);
            const descEnd = afterAddress.search(/(?:Compare|Contact|Bed Available|$)/i);
            description = afterAddress.substring(0, descEnd > 0 ? descEnd : 200).trim();
          }
        }
        
        return {
          index,
          businessName: businessName || 'Unknown',
          address,
          distance,
          description: description.substring(0, 200),
          html: innerHTML.substring(0, 1000),
          fullText: text.substring(0, 500)
        };
      }).filter(card => card.businessName !== 'Unknown' || card.address);
    });
    
    console.log(`   Found ${providerCards.length} provider cards`);
    
    // If no cards found, try a simpler approach - get all text and parse
    if (providerCards.length === 0) {
      console.log(`   ⚠️  No cards found with selectors, trying alternative method...`);
      const pageText = await page.evaluate(() => document.body.textContent || '');
      
      // Look for provider patterns in raw text
      const providerMatches = pageText.match(/([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|LLC|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/g);
      if (providerMatches && providerMatches.length > 0) {
        console.log(`   Found ${providerMatches.length} potential provider names in text`);
        // Create basic provider entries from matches
        providerMatches.slice(0, 20).forEach((name, idx) => {
          providerCards.push({
            index: idx,
            businessName: name.trim(),
            address: '',
            distance: '',
            description: '',
            html: '',
            fullText: pageText.substring(0, 500)
          });
        });
      }
    }
    
    // Process each card and get phone numbers
    for (let i = 0; i < providerCards.length; i++) {
      const card = providerCards[i];
      
      if (!card.businessName || card.businessName.length < 3 || card.businessName === 'Unknown') {
        continue; // Skip invalid cards
      }
      
      let phoneNumber = 'Contact via AFHC';
      
      // Try to get phone number by clicking contact button
      try {
        // Find the contact button for this card
        const contactButtons = await page.$$('button, a, [class*="contact"], [class*="btn"]');
        
        for (const btn of contactButtons) {
          const btnText = await btn.evaluate(el => el.textContent?.trim() || '');
          if (btnText.toUpperCase().includes('CONTACT')) {
            // Check if this button is near our card
            const btnHTML = await btn.evaluate(el => el.outerHTML);
            if (card.html.includes(btnHTML.substring(0, 100)) || 
                await page.evaluate((btn, cardHtml) => {
                  const rect = btn.getBoundingClientRect();
                  return cardHtml.includes(btn.textContent);
                }, btn, card.html)) {
              
              await btn.click();
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Extract phone from modal
              try {
                const phoneText = await page.evaluate(() => {
                  const modal = document.querySelector('[class*="modal"], [class*="popup"], [role="dialog"], [class*="overlay"]');
                  return modal?.textContent || '';
                });
                
                const phoneMatch = phoneText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                if (phoneMatch) {
                  phoneNumber = phoneMatch[0];
                }
                
                // Close modal
                const closeBtn = await page.$('[class*="close"], button[aria-label*="close" i], [aria-label*="close" i]');
                if (closeBtn) {
                  await closeBtn.click();
                } else {
                  await page.keyboard.press('Escape');
                }
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (e) {
                // Modal might have closed
              }
              
              break;
            }
          }
        }
      } catch (e) {
        // Couldn't get phone - that's okay
      }
      
      // Extract area/city from address
      let areaCity = 'Unknown, WA';
      try {
        const cityMatch = card.address.match(/,?\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?/);
        if (cityMatch) {
          areaCity = `${cityMatch[1].trim()}, ${cityMatch[2]}`;
        }
      } catch (e) {
        // Keep default
      }
      
      // Create provider object
      const provider = {
        id: `page${pageNumber}-card${i + 1}`,
        areaCity,
        businessName: card.businessName,
        providerName: card.businessName, // Use business name as provider name
        phoneNumber,
        website: `adultfamilyhomecouncil.org/home-finder`,
        yearStarted: 0,
        residentBeds: 0,
        privatePayMedicaidRatio: 'Not specified',
        others: [card.address, card.distance, card.description].filter(Boolean).join('. ').trim() || 'No additional information available'
      };
      
      providers.push(provider);
    }
    
  } catch (error) {
    console.error(`   Error extracting providers:`, error.message);
  }
  
  return providers;
}

/**
 * Scrape a single page
 */
async function scrapePage(browser, pageNumber) {
  const page = await browser.newPage();
  
  try {
    const url = `${BASE_URL}?near_address=Centralia%2C+Washington%2C+USA&location=46.7162136%2C-122.9542972&page=${pageNumber}`;
    
    console.log(`📄 Fetching page ${pageNumber}/${TOTAL_PAGES}...`);
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const pageProviders = await extractProvidersFromPage(page, pageNumber);
    
    console.log(`   ✅ Extracted ${pageProviders.length} providers from page ${pageNumber}`);
    
    return pageProviders;
  } catch (error) {
    console.error(`   ❌ Error scraping page ${pageNumber}:`, error.message);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Main scraping function
 */
async function scrapeAllProviders() {
  console.log('🚀 Starting AFH Provider Scraper');
  console.log(`📊 Target: ${TOTAL_PAGES} pages\n`);
  
  // Load progress
  loadProgress();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    for (let page = startPage; page <= TOTAL_PAGES; page++) {
      const providers = await scrapePage(browser, page);
      allProviders.push(...providers);
      
      console.log(`✅ Page ${page} complete. Total: ${allProviders.length} providers\n`);
      
      // Save progress every 10 pages
      if (page % 10 === 0) {
        saveProgress(page);
        console.log(`💾 Progress saved (${allProviders.length} providers so far)\n`);
      }
      
      // Rate limiting - be respectful
      if (page < TOTAL_PAGES) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Final save
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProviders, null, 2));
    console.log(`\n🎉 Successfully scraped ${allProviders.length} providers!`);
    console.log(`💾 Saved to: ${OUTPUT_FILE}`);
    
    // Clean up progress file
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    // Save what we have
    if (allProviders.length > 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProviders, null, 2));
      saveProgress(Math.max(startPage - 1, 1));
      console.log(`\n💾 Saved ${allProviders.length} providers collected so far.`);
      console.log(`🔄 Run again to resume from where it stopped.`);
    }
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  scrapeAllProviders()
    .then(() => {
      console.log('\n✨ Scraping complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Scraping failed:', error);
      process.exit(1);
    });
}

module.exports = { scrapeAllProviders };
