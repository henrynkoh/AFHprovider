/**
 * Comprehensive phone number scraper
 * This script goes through all pages and extracts phone numbers for providers
 * that currently show "Contact via AFHC"
 * 
 * To run: npm run scrape-phones
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://adultfamilyhomecouncil.org/home-finder';
const TOTAL_PAGES = 143;
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'phone-scrape-progress.json');

let allProviders = [];
let providerMap = new Map(); // Map business name + city to provider index
let updatedCount = 0;
let foundCount = 0;
let errorCount = 0;

// Load existing providers
function loadProviders() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      allProviders = JSON.parse(content);
      console.log(`📂 Loaded ${allProviders.length} providers`);
      
      // Create map for quick lookup
      allProviders.forEach((provider, index) => {
        const key = `${provider.businessName.toLowerCase().trim()}_${provider.areaCity.toLowerCase().trim()}`;
        providerMap.set(key, index);
      });
      
      const needsPhone = allProviders.filter(p => 
        !p.phoneNumber || 
        p.phoneNumber === 'Contact via AFHC' ||
        p.phoneNumber.trim() === '' ||
        p.phoneNumber === 'Contact via AFHC'
      );
      console.log(`📞 Found ${needsPhone.length} providers needing phone numbers\n`);
      return needsPhone.length;
    }
  } catch (e) {
    console.error('Error loading providers:', e.message);
  }
  return 0;
}

// Save providers
function saveProviders() {
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProviders, null, 2));
  } catch (e) {
    console.error('Error saving providers:', e.message);
  }
}

// Save progress
function saveProgress(pageNumber) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      lastPage: pageNumber,
      updated: updatedCount,
      found: foundCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    }, null, 2));
  } catch (e) {
    // Ignore
  }
}

/**
 * Extract all providers from a page with their phone numbers
 */
async function extractProvidersWithPhones(page, pageNumber) {
  const providers = [];
  
  try {
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get all provider cards on the page
    const pageData = await page.evaluate(() => {
      const cards = [];
      
      // Find all elements that might be provider cards
      const possibleCards = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return (
          text.includes('Bed Available') ||
          text.match(/\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)/) ||
          (text.length > 100 && text.match(/[A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence))/))
        );
      });
      
      // Extract data from each potential card
      possibleCards.forEach((card, idx) => {
        const text = card.textContent || '';
        const html = card.innerHTML || '';
        
        // Extract business name
        let businessName = '';
        const nameMatch = text.match(/([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/);
        if (nameMatch) {
          businessName = nameMatch[1].trim();
        }
        
        // Extract address
        const addressMatch = text.match(/(\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)[^,\n]*(?:,\s*[^,\n]+){0,2},\s*[A-Z]{2}\s*\d{5})/);
        const address = addressMatch ? addressMatch[1].trim() : '';
        
        // Extract city
        let city = 'Unknown, WA';
        if (address) {
          const cityMatch = address.match(/,?\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})?/);
          if (cityMatch) {
            city = `${cityMatch[1].trim()}, ${cityMatch[2]}`;
          }
        }
        
        // Find contact button in this card
        const contactBtn = card.querySelector('button, a, [role="button"]');
        const hasContactBtn = contactBtn && (
          (contactBtn.textContent || '').toLowerCase().includes('contact') ||
          (contactBtn.getAttribute('aria-label') || '').toLowerCase().includes('contact') ||
          (contactBtn.className || '').toLowerCase().includes('contact')
        );
        
        if (businessName || address) {
          cards.push({
            index: idx,
            businessName: businessName || 'Unknown',
            address,
            city,
            html: html.substring(0, 2000),
            text: text.substring(0, 1000),
            hasContactBtn: !!hasContactBtn,
            contactBtnSelector: hasContactBtn ? 'button, a, [role="button"]' : null
          });
        }
      });
      
      return cards;
    });
    
    console.log(`   Found ${pageData.length} provider cards on page ${pageNumber}`);
    
    // Debug: Show first few business names found
    if (pageNumber <= 3 && pageData.length > 0) {
      console.log(`   Sample names found: ${pageData.slice(0, 3).map(c => c.businessName).join(', ')}`);
    }
    
    // Process each card to get phone number
    for (let i = 0; i < pageData.length; i++) {
      const card = pageData[i];
      
      if (!card.businessName || card.businessName === 'Unknown') {
        continue;
      }
      
      // Check if we have this provider in our database - use fuzzy matching
      let providerIndex = undefined;
      
      // Strategy 1: Exact match
      const exactKey = `${card.businessName.toLowerCase().trim()}_${card.city.toLowerCase().trim()}`;
      providerIndex = providerMap.get(exactKey);
      
      // Strategy 2: Fuzzy match by business name (partial match)
      if (providerIndex === undefined) {
        const cardNameLower = card.businessName.toLowerCase().trim();
        const cardCityLower = card.city.toLowerCase().trim();
        
        // Try to find a match by comparing business names
        for (let idx = 0; idx < allProviders.length; idx++) {
          const provider = allProviders[idx];
          const providerNameLower = provider.businessName.toLowerCase().trim();
          const providerCityLower = provider.areaCity.toLowerCase().trim();
          
          // Check if names are similar (one contains the other or vice versa)
          const namesMatch = 
            cardNameLower.includes(providerNameLower.substring(0, Math.min(15, providerNameLower.length))) ||
            providerNameLower.includes(cardNameLower.substring(0, Math.min(15, cardNameLower.length))) ||
            cardNameLower.replace(/[^a-z0-9]/g, '') === providerNameLower.replace(/[^a-z0-9]/g, '');
          
          // Check if cities match
          const citiesMatch = 
            cardCityLower === providerCityLower ||
            cardCityLower.includes(providerCityLower.split(',')[0]) ||
            providerCityLower.includes(cardCityLower.split(',')[0]);
          
          if (namesMatch && citiesMatch) {
            providerIndex = idx;
            console.log(`   🔍 Fuzzy match found: "${card.businessName}" matches "${provider.businessName}"`);
            break;
          }
        }
      }
      
      if (providerIndex === undefined) {
        // Debug: Show what we're looking for vs what we found (first few only)
        if (pageNumber <= 3 && i < 5) {
          const sampleKeys = Array.from(providerMap.keys()).slice(0, 5);
          console.log(`   ⚠️  No match for "${card.businessName}" in ${card.city}. Sample DB keys: ${sampleKeys.join(', ')}`);
        }
        continue; // Provider not in our database
      }
      
      const provider = allProviders[providerIndex];
      
      // Skip if already has phone number
      if (provider.phoneNumber && 
          provider.phoneNumber !== 'Contact via AFHC' && 
          provider.phoneNumber.trim() !== '' &&
          provider.phoneNumber.length >= 10) {
        continue;
      }
      
      foundCount++;
      console.log(`   📞 Attempting to get phone for: ${provider.businessName}`);
      
      let phoneNumber = null;
      
      // Try to click contact button and get phone
      try {
        // Find the contact button for this specific card
        const contactButton = await page.evaluateHandle((cardHtml, cardText) => {
          const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
          for (const btn of buttons) {
            const btnText = btn.textContent?.trim() || '';
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const className = btn.className || '';
            
            if (
              (btnText.toLowerCase().includes('contact') ||
               ariaLabel.toLowerCase().includes('contact') ||
               className.toLowerCase().includes('contact')) &&
              (cardHtml.includes(btn.outerHTML.substring(0, 100)) ||
               cardText.includes(btnText.substring(0, 20)))
            ) {
              return btn;
            }
          }
          return null;
        }, card.html, card.text);
        
        if (contactButton && contactButton.asElement()) {
          // Scroll to button
          await contactButton.asElement().scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Click button
          await contactButton.asElement().click();
          await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for modal
          
          // Extract phone from modal
          phoneNumber = await page.evaluate(() => {
            // Find visible modal
            const modalSelectors = [
              '[class*="modal"]',
              '[class*="popup"]',
              '[class*="dialog"]',
              '[role="dialog"]',
              '[class*="overlay"]',
              '[id*="modal"]',
              '[id*="popup"]'
            ];
            
            let modal = null;
            for (const selector of modalSelectors) {
              const elements = document.querySelectorAll(selector);
              for (const el of elements) {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null) {
                  modal = el;
                  break;
                }
              }
              if (modal) break;
            }
            
            if (!modal) {
              // Try to find any fixed/absolute positioned element with high z-index
              const allElements = document.querySelectorAll('*');
              for (const el of allElements) {
                const style = window.getComputedStyle(el);
                if (
                  (style.position === 'fixed' || style.position === 'absolute') &&
                  parseInt(style.zIndex) > 100 &&
                  el.offsetParent !== null
                ) {
                  const text = el.textContent || '';
                  if (text.length > 50 && text.length < 2000) {
                    modal = el;
                    break;
                  }
                }
              }
            }
            
            if (modal) {
              const modalText = modal.textContent || modal.innerText || '';
              
              // Try multiple phone patterns
              const phonePatterns = [
                /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
                /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
                /\+1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
                /Phone[:\s]+([\(\)\d\s\-\.]+)/i,
                /Tel[:\s]+([\(\)\d\s\-\.]+)/i,
                /Call[:\s]+([\(\)\d\s\-\.]+)/i,
                /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
              ];
              
              for (const pattern of phonePatterns) {
                const match = modalText.match(pattern);
                if (match) {
                  let phone = (match[1] || match[0]).trim();
                  // Clean phone number
                  phone = phone.replace(/[^\d\(\)\-\s\.]/g, '').trim();
                  // Remove country code if present
                  phone = phone.replace(/^\+?1[-.\s]?/, '');
                  if (phone.length >= 10) {
                    return phone;
                  }
                }
              }
            }
            
            return null;
          });
          
          // Close modal
          if (phoneNumber) {
            try {
              const closeBtn = await page.evaluateHandle(() => {
                const closeSelectors = [
                  'button[aria-label*="close" i]',
                  '[aria-label*="close" i]',
                  '[class*="close"]',
                  '.close',
                  '[data-dismiss="modal"]',
                  'button:has(svg)'
                ];
                
                for (const selector of closeSelectors) {
                  const btn = document.querySelector(selector);
                  if (btn && btn.offsetParent !== null) {
                    return btn;
                  }
                }
                return null;
              });
              
              if (closeBtn && closeBtn.asElement()) {
                await closeBtn.asElement().click();
              } else {
                await page.keyboard.press('Escape');
              }
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
              await page.keyboard.press('Escape');
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
      } catch (error) {
        console.error(`     ⚠️  Error extracting phone: ${error.message}`);
        errorCount++;
      }
      
      // Update provider if we got a phone number
      if (phoneNumber && phoneNumber.length >= 10) {
        allProviders[providerIndex].phoneNumber = phoneNumber;
        updatedCount++;
        console.log(`     ✅ Updated: ${phoneNumber}`);
        
        // Save every 5 updates
        if (updatedCount % 5 === 0) {
          saveProviders();
        }
      } else {
        console.log(`     ⏭️  No phone found`);
      }
      
      // Small delay between providers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error(`   ❌ Error on page ${pageNumber}:`, error.message);
    errorCount++;
  }
  
  return providers;
}

/**
 * Scrape all pages for phone numbers
 */
async function scrapeAllPhoneNumbers() {
  console.log('🚀 Starting Phone Number Scraper\n');
  
  const needsPhone = loadProviders();
  
  if (needsPhone === 0) {
    console.log('✅ All providers already have phone numbers!');
    return;
  }
  
  // Load progress
  let startPage = 1;
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
      startPage = progress.lastPage + 1 || 1;
      console.log(`📂 Resuming from page ${startPage}\n`);
    }
  } catch (e) {
    // Start fresh
  }
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    for (let pageNumber = startPage; pageNumber <= TOTAL_PAGES; pageNumber++) {
      console.log(`\n📄 Processing page ${pageNumber}/${TOTAL_PAGES}`);
      
      const url = `${BASE_URL}?near_address=Centralia%2C+Washington%2C+USA&location=46.7162136%2C-122.9542972&page=${pageNumber}`;
      
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      });
      
      await extractProvidersWithPhones(page, pageNumber);
      
      // Save progress
      saveProgress(pageNumber);
      saveProviders();
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n✅ Scraping Complete!`);
    console.log(`   📞 Updated: ${updatedCount}`);
    console.log(`   🔍 Found: ${foundCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
    saveProviders();
  }
}

// Run if called directly
if (require.main === module) {
  scrapeAllPhoneNumbers().catch(console.error);
}

module.exports = { scrapeAllPhoneNumbers };
