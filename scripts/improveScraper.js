/**
 * Improved scraper with better address and phone extraction
 * This version focuses on properly extracting addresses and phone numbers
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://adultfamilyhomecouncil.org/home-finder';
const TOTAL_PAGES = 143;
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');

/**
 * Improved extraction - focuses on getting addresses and phone numbers
 */
async function extractProvidersFromPage(page, pageNumber) {
  const providers = [];
  
  try {
    await page.waitForSelector('body', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get all provider information from the page
    const pageData = await page.evaluate(() => {
      const providers = [];
      
      // Find all provider cards - look for elements with "Bed Available" text
      const allElements = Array.from(document.querySelectorAll('*'));
      const providerCards = allElements.filter(el => {
        const text = el.textContent || '';
        return text.includes('Bed Available') && 
               text.length > 100 && 
               text.length < 2000;
      });
      
      return providerCards.map((card, idx) => {
        const text = card.textContent || '';
        const html = card.innerHTML || '';
        
        // Extract business name - look for text after "Bed Available"
        let businessName = '';
        const nameMatch = text.match(/Bed Available\s+([A-Z][^\n]{5,80}?)(?:\n|$)/);
        if (nameMatch) {
          businessName = nameMatch[1].trim();
        } else {
          // Try finding h2, h3, or strong tags
          const nameEl = card.querySelector('h2, h3, h4, strong, [class*="name"], [class*="title"]');
          if (nameEl) {
            businessName = nameEl.textContent.trim();
          }
        }
        
        // Extract full address - look for street address pattern
        let fullAddress = '';
        const addressPatterns = [
          /(\d+\s+[A-Z0-9][^,\n]{5,50}(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place|Drive|Street|Avenue|Road)[^,\n]*(?:,\s*[^,\n]+){0,3},\s*[A-Z]{2}\s*\d{5})/,
          /([A-Z][^,\n]{5,50}(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)[^,\n]*(?:,\s*[^,\n]+){1,3},\s*[A-Z]{2}\s*\d{5})/,
          /(\d+[^,\n]{5,80},\s*[^,\n]+,\s*[A-Z]{2}\s*\d{5})/
        ];
        
        for (const pattern of addressPatterns) {
          const match = text.match(pattern);
          if (match) {
            fullAddress = match[1].trim();
            break;
          }
        }
        
        // Extract city from address
        let city = '';
        let state = 'WA';
        if (fullAddress) {
          const cityMatch = fullAddress.match(/,\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})/);
          if (cityMatch) {
            city = cityMatch[1].trim();
            state = cityMatch[2];
          }
        }
        
        // Extract distance
        const distanceMatch = text.match(/\(([^)]*miles?[^)]*)\)/i);
        const distance = distanceMatch ? distanceMatch[1].trim() : '';
        
        // Extract description
        let description = '';
        if (fullAddress) {
          const addrIndex = text.indexOf(fullAddress);
          if (addrIndex !== -1) {
            const afterAddr = text.substring(addrIndex + fullAddress.length);
            const descEnd = afterAddr.search(/(?:Compare|Contact|Bed Available|$)/i);
            description = afterAddr.substring(0, descEnd > 0 ? descEnd : 300).trim();
          }
        }
        
        return {
          index: idx,
          businessName: businessName || 'Unknown',
          fullAddress,
          city,
          state,
          distance,
          description: description.substring(0, 300),
          html: html.substring(0, 2000),
          text: text.substring(0, 1000)
        };
      }).filter(card => card.businessName !== 'Unknown');
    });
    
    console.log(`   Found ${pageData.length} provider cards`);
    
    // Now get phone numbers by clicking contact buttons
    for (let i = 0; i < pageData.length; i++) {
      const cardData = pageData[i];
      let phoneNumber = 'Contact via AFHC';
      
      try {
        // Strategy: Find contact buttons more precisely and extract phone numbers
        // First, try to find contact buttons near this provider's card
        const contactButtons = await page.$$eval('button, a, [class*="contact"], [class*="btn"]', (elements) => {
          return elements
            .map((el, idx) => ({
              index: idx,
              text: el.textContent?.trim() || '',
              tagName: el.tagName,
              className: el.className || '',
              href: el.href || '',
              innerHTML: el.innerHTML || ''
            }))
            .filter(el => el.text.toUpperCase().includes('CONTACT'));
        });
        
        console.log(`      Found ${contactButtons.length} contact buttons for page ${pageNumber}`);
        
        // Try each contact button
        for (let btnIdx = 0; btnIdx < Math.min(contactButtons.length, 10); btnIdx++) {
          const btnInfo = contactButtons[btnIdx];
          
          try {
            // Re-select the button
            const buttons = await page.$$('button, a, [class*="contact"], [class*="btn"]');
            if (btnIdx >= buttons.length) continue;
            
            const btn = buttons[btnIdx];
            const btnText = await btn.evaluate(el => el.textContent?.trim() || '');
            
            if (!btnText.toUpperCase().includes('CONTACT')) continue;
            
            // Scroll button into view
            await btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Click the button
            await btn.click();
            await new Promise(resolve => setTimeout(resolve, 2500)); // Wait longer for modal
            
            // Try multiple methods to get phone number
            const phoneData = await page.evaluate(() => {
              // Method 1: Look for phone in visible modals/overlays
              const modals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="dialog"], [role="dialog"], [class*="overlay"], [class*="contact-info"]');
              
              for (const modal of modals) {
                const text = modal.textContent || '';
                const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
                if (phoneMatch) {
                  return { phone: phoneMatch[0], source: 'modal' };
                }
              }
              
              // Method 2: Look for tel: links
              const telLinks = document.querySelectorAll('a[href^="tel:"]');
              for (const link of telLinks) {
                const href = link.getAttribute('href') || '';
                const phone = href.replace('tel:', '').trim();
                if (phone.match(/\d{3}.*\d{3}.*\d{4}/)) {
                  return { phone, source: 'tel-link' };
                }
              }
              
              // Method 3: Search entire page for phone pattern
              const bodyText = document.body.textContent || '';
              const phoneMatch = bodyText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
              if (phoneMatch) {
                return { phone: phoneMatch[0], source: 'page-text' };
              }
              
              return null;
            });
            
            if (phoneData && phoneData.phone) {
              phoneNumber = phoneData.phone;
              console.log(`      ✓ Got phone for ${cardData.businessName}: ${phoneNumber} (from ${phoneData.source})`);
              
              // Close modal if open
              try {
                const closeSelectors = [
                  '[class*="close"]',
                  'button[aria-label*="close" i]',
                  '[aria-label*="close" i]',
                  '.close',
                  'button:contains("Close")',
                  '[class*="dismiss"]'
                ];
                
                let closed = false;
                for (const selector of closeSelectors) {
                  try {
                    const closeBtn = await page.$(selector);
                    if (closeBtn) {
                      await closeBtn.click();
                      closed = true;
                      break;
                    }
                  } catch (e) {
                    // Try next selector
                  }
                }
                
                if (!closed) {
                  await page.keyboard.press('Escape');
                }
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (e) {
                // Modal might close automatically
              }
              
              break; // Found phone, move to next provider
            }
            
            // Close modal if we didn't find phone
            try {
              await page.keyboard.press('Escape');
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (e) {
              // Ignore
            }
            
          } catch (e) {
            // Try next button
            console.log(`      ⚠️  Error with button ${btnIdx}: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`      ⚠️  Phone extraction failed for ${cardData.businessName}: ${e.message}`);
      }
      
      // Create provider object
      const areaCity = cardData.city ? `${cardData.city}, ${cardData.state}` : 'Unknown, WA';
      
      const provider = {
        id: `page${pageNumber}-card${i + 1}`,
        areaCity,
        businessName: cardData.businessName,
        providerName: cardData.businessName,
        phoneNumber,
        website: `adultfamilyhomecouncil.org/home-finder`,
        yearStarted: 0,
        residentBeds: 0,
        privatePayMedicaidRatio: 'Not specified',
        others: [cardData.fullAddress, cardData.distance, cardData.description].filter(Boolean).join('. ').trim() || 'No additional information available'
      };
      
      providers.push(provider);
    }
    
  } catch (error) {
    console.error(`   Error:`, error.message);
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
 * Main function - re-scrape to get better data
 */
async function rescrapeProviders() {
  console.log('🔄 Re-scraping with improved extraction...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  let allProviders = [];
  
  try {
    // Test with first 5 pages to see if it works
    const testPages = 5;
    console.log(`Testing with first ${testPages} pages...\n`);
    
    for (let page = 1; page <= testPages; page++) {
      const providers = await scrapePage(browser, page);
      allProviders.push(...providers);
      
      console.log(`✅ Page ${page} complete. Total: ${allProviders.length} providers\n`);
      
      if (page < testPages) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Save test results
    const testFile = path.join(__dirname, '..', 'data', 'testProviders.json');
    fs.writeFileSync(testFile, JSON.stringify(allProviders, null, 2));
    console.log(`\n💾 Test results saved to: ${testFile}`);
    console.log(`📊 Sample providers with addresses and phones:`);
    allProviders.slice(0, 3).forEach(p => {
      console.log(`   - ${p.businessName}`);
      console.log(`     City: ${p.areaCity}`);
      console.log(`     Phone: ${p.phoneNumber}`);
      console.log(`     Address: ${p.others.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  rescrapeProviders()
    .then(() => {
      console.log('\n✨ Test complete! Check testProviders.json to see if addresses and phones are extracted correctly.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = { rescrapeProviders };

