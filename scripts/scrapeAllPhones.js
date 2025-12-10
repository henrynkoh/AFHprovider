/**
 * Comprehensive phone number scraper - scrapes all providers fresh with phone numbers
 * This script goes through all pages, extracts providers with phone numbers,
 * then merges phone numbers into the existing database
 * 
 * To run: node scripts/scrapeAllPhones.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://adultfamilyhomecouncil.org/home-finder';
const TOTAL_PAGES = 143;
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');
const SCRAPED_FILE = path.join(__dirname, '..', 'data', 'scrapedWithPhones.json');
const PROGRESS_FILE = path.join(__dirname, '..', 'data', 'phone-scrape-progress.json');

let allProviders = [];
let scrapedProviders = [];
let updatedCount = 0;

// Load existing providers
function loadProviders() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
      allProviders = JSON.parse(content);
      console.log(`📂 Loaded ${allProviders.length} existing providers`);
    }
  } catch (e) {
    console.error('Error loading providers:', e.message);
  }
}

// Load scraped providers
function loadScraped() {
  try {
    if (fs.existsSync(SCRAPED_FILE)) {
      const content = fs.readFileSync(SCRAPED_FILE, 'utf-8');
      scrapedProviders = JSON.parse(content);
      console.log(`📂 Loaded ${scrapedProviders.length} previously scraped providers`);
    }
  } catch (e) {
    // Start fresh
  }
}

// Save scraped providers
function saveScraped() {
  try {
    fs.writeFileSync(SCRAPED_FILE, JSON.stringify(scrapedProviders, null, 2));
  } catch (e) {
    console.error('Error saving scraped providers:', e.message);
  }
}

// Save progress
function saveProgress(pageNumber) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      lastPage: pageNumber,
      scraped: scrapedProviders.length,
      updated: updatedCount,
      timestamp: new Date().toISOString()
    }, null, 2));
  } catch (e) {
    // Ignore
  }
}

/**
 * Extract phone number by clicking contact button
 */
async function getPhoneFromContactButton(page, cardElement) {
  try {
    // Find contact button in the card
    const contactButton = await page.evaluateHandle((card) => {
      const buttons = Array.from(card.querySelectorAll('button, a, [role="button"]'));
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        const className = (btn.className || '').toLowerCase();
        
        if (text.includes('contact') || ariaLabel.includes('contact') || className.includes('contact')) {
          return btn;
        }
      }
      return null;
    }, cardElement);
    
    if (!contactButton || !contactButton.asElement()) {
      return null;
    }
    
    // Scroll to button
    await contactButton.asElement().scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click button
    await contactButton.asElement().click();
    
    // Wait for modal to appear - try multiple times
    let modalAppeared = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      modalAppeared = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (el.tagName === 'BUTTON' || el.tagName === 'A') continue;
          const style = window.getComputedStyle(el);
          if (
            (style.position === 'fixed' || style.position === 'absolute') &&
            parseInt(style.zIndex) > 100 &&
            el.offsetParent !== null
          ) {
            const text = el.textContent || '';
            if (text.length > 50 && text.length < 5000 && 
                !text.toLowerCase().trim().startsWith('contact') &&
                (text.match(/\d{3}.*\d{3}.*\d{4}/) || el.querySelector('a[href^="tel:"]'))) {
              return true;
            }
          }
        }
        return false;
      });
      if (modalAppeared) break;
    }
    
    // Extract phone from modal
    const phoneNumber = await page.evaluate(() => {
      // First, exclude buttons from our search
      const excludeTags = ['BUTTON', 'A'];
      
      // Find visible modal - but NOT buttons
      const modalSelectors = [
        '[class*="modal"]:not(button):not(a)',
        '[class*="popup"]:not(button):not(a)',
        '[class*="dialog"]:not(button):not(a)',
        '[role="dialog"]:not(button):not(a)',
        '[class*="overlay"]:not(button):not(a)',
        '[id*="modal"]:not(button):not(a)',
        '[id*="popup"]:not(button):not(a)'
      ];
      
      let modal = null;
      for (const selector of modalSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            // Skip buttons and links
            if (excludeTags.includes(el.tagName)) continue;
            
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && 
                style.visibility !== 'hidden' && 
                el.offsetParent !== null &&
                (style.position === 'fixed' || style.position === 'absolute' || parseInt(style.zIndex) > 100)) {
              const text = el.textContent || '';
              // Make sure it's not just the button text
              if (text.length > 20 && !text.toLowerCase().includes('contact') && text.length < 5000) {
                modal = el;
                break;
              }
            }
          }
          if (modal) break;
        } catch (e) {
          // Continue with next selector
        }
      }
      
      if (!modal) {
        // Try to find any fixed/absolute element with high z-index (but not buttons)
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (excludeTags.includes(el.tagName)) continue;
          
          const style = window.getComputedStyle(el);
          if (
            (style.position === 'fixed' || style.position === 'absolute') &&
            parseInt(style.zIndex) > 100 &&
            el.offsetParent !== null
          ) {
            const text = el.textContent || '';
            // Make sure it has substantial content and isn't just a button
            if (text.length > 50 && text.length < 5000 && !text.toLowerCase().trim().startsWith('contact')) {
              modal = el;
              break;
            }
          }
        }
      }
      
      // First check for tel: links anywhere on the page (most reliable)
      const telLinks = document.querySelectorAll('a[href^="tel:"]');
      if (telLinks.length > 0) {
        const href = telLinks[0].getAttribute('href') || '';
        let phone = href.replace('tel:', '').trim();
        phone = phone.replace(/[^\d]/g, '');
        if (phone.length >= 10) {
          return phone;
        }
      }
      
      // Search in modal if found
      if (modal) {
        const modalText = modal.textContent || modal.innerText || '';
        
        // Try multiple phone patterns in modal
        const phonePatterns = [
          /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
          /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
          /Phone[:\s]+([\(\)\d\s\-\.]+)/i,
          /Tel[:\s]+([\(\)\d\s\-\.]+)/i,
          /Call[:\s]+([\(\)\d\s\-\.]+)/i,
          /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/
        ];
        
        for (const pattern of phonePatterns) {
          const match = modalText.match(pattern);
          if (match) {
            let phone = (match[1] || match[0]).trim();
            phone = phone.replace(/[^\d\(\)\-\s\.]/g, '').trim();
            phone = phone.replace(/^\+?1[-.\s]?/, '');
            if (phone.length >= 10) {
              return phone;
            }
          }
        }
      }
      
      // If no phone in modal, search for newly appeared content
      // Look for elements that appeared after the click (high z-index, fixed/absolute)
      const newElements = Array.from(document.querySelectorAll('*')).filter(el => {
        if (excludeTags.includes(el.tagName)) return false;
        const style = window.getComputedStyle(el);
        return (
          (style.position === 'fixed' || style.position === 'absolute') &&
          parseInt(style.zIndex) > 100 &&
          el.offsetParent !== null
        );
      });
      
      for (const el of newElements) {
        const text = el.textContent || '';
        const phoneMatch = text.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
          let phone = phoneMatch[0].trim();
          phone = phone.replace(/[^\d]/g, '');
          if (phone.length === 10 || phone.length === 11) {
            if (phone.length === 11 && phone.startsWith('1')) {
              phone = phone.substring(1);
            }
            if (phone.length === 10) {
              return phone;
            }
          }
        }
      }
      
      // Last resort: search entire page but prefer numbers in visible overlays
      const bodyText = document.body.textContent || '';
      const phoneMatches = bodyText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g);
      if (phoneMatches && phoneMatches.length > 0) {
        // Return the first valid phone number
        for (const match of phoneMatches) {
          let phone = match.trim();
          phone = phone.replace(/[^\d]/g, '');
          if (phone.length === 10 || phone.length === 11) {
            if (phone.length === 11 && phone.startsWith('1')) {
              phone = phone.substring(1);
            }
            if (phone.length === 10) {
              return phone;
            }
          }
        }
      }
      
      return null;
    });
    
    // Close modal
    try {
      const closeBtn = await page.evaluateHandle(() => {
        const closeSelectors = [
          'button[aria-label*="close" i]',
          '[aria-label*="close" i]',
          '[class*="close"]',
          '.close'
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
    
    return phoneNumber;
  } catch (error) {
    // Try to close modal
    try {
      await page.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      // Ignore
    }
    return null;
  }
}

/**
 * Force close ALL modals aggressively
 */
async function forceCloseAllModals(page) {
  try {
    // Multiple escape presses
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Remove modals from DOM
    await page.evaluate(() => {
      // Find and remove all modals
      const allElements = Array.from(document.querySelectorAll('*'));
      const modals = allElements.filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.position === 'fixed' || style.position === 'absolute') &&
               parseInt(style.zIndex) > 100 &&
               style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               el.offsetParent !== null &&
               rect.width > 100 &&
               rect.height > 100;
      });
      
      modals.forEach(modal => {
        // Try to find and click close buttons
        const closeButtons = modal.querySelectorAll('[aria-label*="close" i], [class*="close" i], button[class*="x" i]');
        closeButtons.forEach(btn => {
          try {
            btn.click();
          } catch (e) {}
        });
        
        // Force remove from DOM
        try {
          modal.style.display = 'none';
          modal.remove();
        } catch (e) {}
      });
      
      // Also remove any backdrop/overlay elements
      const overlays = document.querySelectorAll('[class*="backdrop" i], [class*="overlay" i], [class*="modal-backdrop" i]');
      overlays.forEach(overlay => {
        try {
          overlay.style.display = 'none';
          overlay.remove();
        } catch (e) {}
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (e) {
    // Ignore
  }
}

/**
 * Extract phone for a single provider - COMPLETELY NEW APPROACH: Network interception + polling
 */
async function extractPhoneForProvider(browser, url, businessName, cardIndex) {
  let phoneNumber = 'Contact via AFHC';
  let providerPage = null;
  
  try {
    providerPage = await browser.newPage();
    await providerPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set up network request interception to catch API calls
    let apiResponseData = null;
    providerPage.on('response', async (response) => {
      const url = response.url();
      // Check if this is an API call that might contain phone data
      if (url.includes('contact') || url.includes('phone') || url.includes('provider') || url.includes('api')) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('json') || contentType.includes('text')) {
            const text = await response.text();
            // Check if response contains phone number
            const phoneMatch = text.match(/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
            if (phoneMatch) {
              apiResponseData = text;
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    });
    
    await providerPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get phones BEFORE clicking
    const phonesBefore = await providerPage.evaluate(() => {
      const phones = new Set();
      document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        let phone = href.replace('tel:', '').trim().replace(/[^\d]/g, '');
        if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);
        if (phone.length === 10) phones.add(phone);
      });
      return Array.from(phones);
    });
    
    const namePart = businessName.substring(0, Math.min(25, businessName.length)).toLowerCase();
    
    // Find and click contact button using multiple strategies
    let buttonClicked = false;
    
    // Strategy 1: Find button using evaluateHandle
    try {
      const buttonHandle = await providerPage.evaluateHandle((targetName) => {
        const namePart = targetName.substring(0, Math.min(25, targetName.length)).toLowerCase();
        const cards = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
        });
        
        for (const card of cards) {
          const cardText = (card.textContent || '').toLowerCase();
          if (cardText.includes(namePart)) {
            const buttons = Array.from(card.querySelectorAll('button, a, [role="button"], div[onclick], span[onclick]'));
            for (const btn of buttons) {
              const text = (btn.textContent || '').toLowerCase().trim();
              const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
              if (text.includes('contact') || ariaLabel.includes('contact')) {
                return btn;
              }
            }
          }
        }
        return null;
      }, businessName);
      
      if (buttonHandle && buttonHandle.asElement()) {
        const btn = buttonHandle.asElement();
        await btn.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 1500));
        await btn.click({ delay: 200 });
        buttonClicked = true;
      }
    } catch (e) {
      // Try next strategy
    }
    
    // Strategy 2: Direct DOM click if handle didn't work
    if (!buttonClicked) {
      buttonClicked = await providerPage.evaluate((targetName) => {
        const namePart = targetName.substring(0, Math.min(25, targetName.length)).toLowerCase();
        const cards = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
        });
        
        for (const card of cards) {
          const cardText = (card.textContent || '').toLowerCase();
          if (cardText.includes(namePart)) {
            const buttons = Array.from(card.querySelectorAll('button, a, [role="button"], div, span'));
            for (const btn of buttons) {
              const text = (btn.textContent || '').toLowerCase().trim();
              if (text === 'contact' || text.includes('contact')) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Try multiple click methods
                if (btn.click) btn.click();
                ['mousedown', 'mouseup', 'click'].forEach(type => {
                  const evt = new MouseEvent(type, { bubbles: true, cancelable: true, view: window });
                  btn.dispatchEvent(evt);
                });
                return true;
              }
            }
          }
        }
        return false;
      }, businessName);
    }
    
    if (!buttonClicked) {
      await providerPage.close();
      return phoneNumber;
    }
    
    // Wait for phone to appear using polling approach
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for phone in multiple ways
      const result = await providerPage.evaluate((targetName, phonesBeforeList) => {
        // Method 1: Check for NEW tel: links
        const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
        for (const link of telLinks) {
          const href = link.getAttribute('href') || '';
          let phone = href.replace('tel:', '').trim().replace(/[^\d]/g, '');
          if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);
          if (phone.length === 10 && !phonesBeforeList.includes(phone)) {
            return { found: true, phone };
          }
        }
        
        // Method 2: Check all visible elements for phone patterns
        const allText = document.body.innerText || document.body.textContent || '';
        const phoneMatches = allText.match(/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g);
        if (phoneMatches) {
          for (const match of phoneMatches) {
            let phone = match.replace(/[^\d]/g, '');
            if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);
            if (phone.length === 10 && !phonesBeforeList.includes(phone)) {
              // Check if this phone is in a visible modal/popup
              const phoneElement = Array.from(document.querySelectorAll('*')).find(el => {
                const text = el.innerText || el.textContent || '';
                return text.includes(match) && 
                       (window.getComputedStyle(el).position === 'fixed' || 
                        window.getComputedStyle(el).position === 'absolute') &&
                       parseInt(window.getComputedStyle(el).zIndex) > 50;
              });
              if (phoneElement) {
                return { found: true, phone };
              }
            }
          }
        }
        
        // Method 3: Check modals specifically
        const allElements = Array.from(document.querySelectorAll('*'));
        const modals = allElements.filter(el => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (style.position === 'fixed' || style.position === 'absolute') &&
                 parseInt(style.zIndex) > 50 &&
                 style.display !== 'none' &&
                 style.visibility !== 'hidden' &&
                 el.offsetParent !== null &&
                 rect.width > 100 &&
                 rect.height > 100;
        });
        
        if (modals.length > 0) {
          modals.sort((a, b) => {
            const aZ = parseInt(window.getComputedStyle(a).zIndex) || 0;
            const bZ = parseInt(window.getComputedStyle(b).zIndex) || 0;
            return bZ - aZ;
          });
          
          const topModal = modals[0];
          const modalText = topModal.innerText || topModal.textContent || '';
          
          // Extract phone from modal
          const modalPhoneMatch = modalText.match(/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
          if (modalPhoneMatch) {
            let phone = modalPhoneMatch[0].replace(/[^\d]/g, '');
            if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);
            if (phone.length === 10 && !phonesBeforeList.includes(phone)) {
              return { found: true, phone };
            }
          }
        }
        
        return { found: false };
      }, businessName, phonesBefore);
      
      if (result.found) {
        phoneNumber = result.phone;
        break;
      }
      
      // Also check API response data
      if (apiResponseData) {
        const phoneMatch = apiResponseData.match(/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
        if (phoneMatch) {
          let phone = phoneMatch[0].replace(/[^\d]/g, '');
          if (phone.length === 11 && phone.startsWith('1')) phone = phone.substring(1);
          if (phone.length === 10) {
            phoneNumber = phone;
            break;
          }
        }
      }
    }
    
    // Close modal
    try {
      await providerPage.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      // Ignore
    }
    
  } catch (error) {
    phoneNumber = 'Contact via AFHC';
  } finally {
    if (providerPage) {
      try {
        await providerPage.close();
      } catch (e) {
        // Ignore
      }
    }
  }
  
  return phoneNumber;
}

/**
 * Extract all providers from a page with phone numbers - NEW APPROACH
 */
async function extractProvidersFromPage(browser, pageNumber) {
  const providers = [];
  const url = `${BASE_URL}?near_address=Centralia%2C+Washington%2C+USA&location=46.7162136%2C-122.9542972&page=${pageNumber}`;
  
  // Create a temporary page just to get the list of providers
  const listPage = await browser.newPage();
  await listPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  try {
    // Load page once to get all provider cards
    await listPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get all provider cards
    const pageData = await listPage.evaluate(() => {
      const cards = [];
      
      // Find elements containing "Bed Available"
      const bedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
      });
      
      bedElements.forEach((card, idx) => {
        const text = card.textContent || '';
        const html = card.innerHTML || '';
        
        // Extract business name
        let businessName = '';
        const namePatterns = [
          /Bed Available\s+([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/,
          /^([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/,
          /([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence)))\s*Bed Available/
        ];
        
        for (const pattern of namePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            businessName = match[1].trim();
            break;
          }
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
        
        if (businessName || address) {
          cards.push({
            index: idx,
            businessName: businessName || 'Unknown',
            address,
            city,
            html: html.substring(0, 3000),
            text: text.substring(0, 1500),
            element: card
          });
        }
      });
      
      return cards;
    });
    
    console.log(`   Found ${pageData.length} provider cards`);
    
    // Process each card - NEW APPROACH: reload page for each provider
    for (let i = 0; i < pageData.length; i++) {
      const card = pageData[i];
      
      if (!card.businessName || card.businessName === 'Unknown') {
        continue;
      }
      
      console.log(`   [${i + 1}/${pageData.length}] Processing: ${card.businessName}`);
      
      // Extract phone using a fresh page for each provider
      const phoneNumber = await extractPhoneForProvider(browser, url, card.businessName, i);
      
      if (phoneNumber !== 'Contact via AFHC') {
        console.log(`     ✅ Got phone: ${phoneNumber}`);
      } else {
        console.log(`     ⏭️  No phone found`);
      }
      
      const provider = {
        id: `page${pageNumber}-card${i + 1}`,
        areaCity: card.city,
        businessName: card.businessName,
        providerName: card.businessName,
        phoneNumber,
        website: 'adultfamilyhomecouncil.org/home-finder',
        yearStarted: 0,
        residentBeds: 0,
        privatePayMedicaidRatio: 'Not specified',
        others: card.address || 'No additional information available'
      };
      
      providers.push(provider);
      scrapedProviders.push(provider);
      
      // Small delay between providers
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
  } catch (error) {
    console.error(`   ❌ Error on page ${pageNumber}:`, error.message);
  } finally {
    // Close the list page
    try {
      await listPage.close();
    } catch (e) {
      // Ignore
    }
  }
  
  return providers;
}

/**
 * Merge phone numbers into existing database
 */
function mergePhoneNumbers() {
  console.log('\n🔄 Merging phone numbers into existing database...\n');
  
  let merged = 0;
  
  scrapedProviders.forEach(scraped => {
    if (scraped.phoneNumber === 'Contact via AFHC') {
      return; // Skip if no phone
    }
    
    // Find matching provider in existing database
    const scrapedNameLower = scraped.businessName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const scrapedCityLower = scraped.areaCity.toLowerCase().trim();
    
    for (let i = 0; i < allProviders.length; i++) {
      const existing = allProviders[i];
      const existingNameLower = existing.businessName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const existingCityLower = existing.areaCity.toLowerCase().trim();
      
      // Check if names match (fuzzy)
      const namesMatch = 
        scrapedNameLower.includes(existingNameLower.substring(0, Math.min(15, existingNameLower.length))) ||
        existingNameLower.includes(scrapedNameLower.substring(0, Math.min(15, scrapedNameLower.length))) ||
        scrapedNameLower === existingNameLower;
      
      // Check if cities match
      const citiesMatch = 
        scrapedCityLower === existingCityLower ||
        scrapedCityLower.includes(existingCityLower.split(',')[0]) ||
        existingCityLower.includes(scrapedCityLower.split(',')[0]);
      
      if (namesMatch && citiesMatch) {
        // Update phone number if existing doesn't have one
        if (existing.phoneNumber === 'Contact via AFHC' || 
            !existing.phoneNumber ||
            existing.phoneNumber.trim() === '') {
          existing.phoneNumber = scraped.phoneNumber;
          merged++;
          console.log(`   ✅ Updated: ${existing.businessName} -> ${scraped.phoneNumber}`);
        }
        break;
      }
    }
  });
  
  console.log(`\n✅ Merged ${merged} phone numbers`);
  return merged;
}

/**
 * Main scraping function
 */
async function scrapeAllPhones() {
  console.log('🚀 Starting Comprehensive Phone Number Scraper\n');
  
  loadProviders();
  loadScraped();
  
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
  
  // No main page needed - each provider gets its own page
  
  try {
        for (let pageNumber = startPage; pageNumber <= TOTAL_PAGES; pageNumber++) {
          console.log(`\n📄 Processing page ${pageNumber}/${TOTAL_PAGES}`);

          await extractProvidersFromPage(browser, pageNumber);
      
      // Save progress
      saveProgress(pageNumber);
      saveScraped();
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Merge phone numbers
    const merged = mergePhoneNumbers();
    
    // Save final database
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProviders, null, 2));
    
    console.log(`\n✅ Scraping Complete!`);
    console.log(`   📞 Scraped: ${scrapedProviders.length} providers`);
    console.log(`   🔄 Merged: ${merged} phone numbers`);
    console.log(`   💾 Total providers: ${allProviders.length}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
    saveScraped();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allProviders, null, 2));
  }
}

// Run if called directly
if (require.main === module) {
  scrapeAllPhones().catch(console.error);
}

module.exports = { scrapeAllPhones };

