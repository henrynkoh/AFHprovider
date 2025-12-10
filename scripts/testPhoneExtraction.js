/**
 * Test script to debug phone number extraction
 * This will help us understand why phones aren't being found
 */

const puppeteer = require('puppeteer');

async function testPhoneExtraction() {
  console.log('🔍 Testing Phone Number Extraction\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  try {
    const url = 'https://adultfamilyhomecouncil.org/home-finder?near_address=Centralia%2C+Washington%2C+USA&location=46.7162136%2C-122.9542972&page=1';
    
    console.log('📄 Loading page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔍 Analyzing page structure...\n');
    
    // Get all buttons on the page
    const buttons = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      return allButtons.map((btn, idx) => {
        const text = btn.textContent?.trim() || '';
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const className = btn.className || '';
        const id = btn.id || '';
        const href = btn.getAttribute('href') || '';
        
        return {
          index: idx,
          text: text.substring(0, 50),
          ariaLabel: ariaLabel.substring(0, 50),
          className: className.substring(0, 100),
          id: id.substring(0, 50),
          href: href.substring(0, 100),
          tagName: btn.tagName,
          hasContact: text.toLowerCase().includes('contact') || 
                     ariaLabel.toLowerCase().includes('contact') ||
                     className.toLowerCase().includes('contact')
        };
      }).filter(btn => btn.hasContact || btn.text.length > 0);
    });
    
    console.log(`Found ${buttons.length} buttons on page\n`);
    console.log('Contact-related buttons:');
    buttons.slice(0, 10).forEach(btn => {
      if (btn.hasContact) {
        console.log(`  - "${btn.text}" (${btn.tagName}, class: ${btn.className})`);
      }
    });
    
    // Try to find provider cards
    const providerCards = await page.evaluate(() => {
      const cards = [];
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
      });
      
      return elements.slice(0, 3).map((card, idx) => {
        const text = card.textContent || '';
        const html = card.innerHTML || '';
        
        // Find business name
        const nameMatch = text.match(/([A-Z][A-Za-z\s&'.-]{5,60}?(?:\s+(?:LLC|AFH|Inc|Corp|Home|Care|Center|Manor|House|Residence)))/);
        const businessName = nameMatch ? nameMatch[1].trim() : 'Unknown';
        
        // Find contact button in this card
        const contactBtn = Array.from(card.querySelectorAll('button, a, [role="button"]')).find(btn => {
          const btnText = (btn.textContent || '').toLowerCase();
          const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
          const className = (btn.className || '').toLowerCase();
          return btnText.includes('contact') || ariaLabel.includes('contact') || className.includes('contact');
        });
        
        return {
          index: idx,
          businessName,
          hasContactButton: !!contactBtn,
          contactButtonText: contactBtn ? (contactBtn.textContent?.trim() || '') : '',
          contactButtonClass: contactBtn ? (contactBtn.className || '') : '',
          cardText: text.substring(0, 200)
        };
      });
    });
    
    console.log('\n📋 Provider Cards Found:');
    providerCards.forEach(card => {
      console.log(`\n  Card ${card.index + 1}: ${card.businessName}`);
      console.log(`    Has Contact Button: ${card.hasContactButton}`);
      if (card.hasContactButton) {
        console.log(`    Button Text: "${card.contactButtonText}"`);
        console.log(`    Button Class: "${card.contactButtonClass}"`);
      }
    });
    
    // Try clicking the first contact button
    if (providerCards.length > 0 && providerCards[0].hasContactButton) {
      console.log('\n🖱️  Attempting to click first contact button...');
      
      const clicked = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('Bed Available') && text.length > 50;
        });
        
        if (cards.length === 0) return false;
        
        const card = cards[0];
        const contactBtn = Array.from(card.querySelectorAll('button, a, [role="button"]')).find(btn => {
          const btnText = (btn.textContent || '').toLowerCase();
          return btnText.includes('contact');
        });
        
        if (contactBtn) {
          contactBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            contactBtn.click();
          }, 1000);
          return true;
        }
        
        return false;
      });
      
      if (clicked) {
        console.log('✅ Button clicked, waiting for modal...');
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Check for modal
        const modalInfo = await page.evaluate(() => {
          const modalSelectors = [
            '[class*="modal"]',
            '[class*="popup"]',
            '[class*="dialog"]',
            '[role="dialog"]',
            '[class*="overlay"]'
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
            // Check for any visible overlay
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const style = window.getComputedStyle(el);
              if (
                (style.position === 'fixed' || style.position === 'absolute') &&
                parseInt(style.zIndex) > 100 &&
                el.offsetParent !== null
              ) {
                modal = el;
                break;
              }
            }
          }
          
          if (modal) {
            const text = modal.textContent || modal.innerText || '';
            const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
            
            return {
              found: true,
              text: text.substring(0, 500),
              phone: phoneMatch ? phoneMatch[0] : null,
              className: modal.className || '',
              id: modal.id || ''
            };
          }
          
          return { found: false };
        });
        
        if (modalInfo.found) {
          console.log('\n✅ Modal found!');
          console.log(`   Modal class: ${modalInfo.className}`);
          console.log(`   Modal id: ${modalInfo.id}`);
          console.log(`   Modal text (first 500 chars): ${modalInfo.text.substring(0, 200)}`);
          if (modalInfo.phone) {
            console.log(`   📞 Phone found: ${modalInfo.phone}`);
          } else {
            console.log('   ⚠️  No phone number in modal text');
            
            // Check for tel: links
            const telLinks = await page.evaluate(() => {
              const links = Array.from(document.querySelectorAll('a[href^="tel:"]'));
              return links.map(link => ({
                href: link.getAttribute('href'),
                text: link.textContent?.trim()
              }));
            });
            
            if (telLinks.length > 0) {
              console.log(`   📞 Found ${telLinks.length} tel: links:`);
              telLinks.forEach(link => console.log(`      - ${link.href} (${link.text})`));
            }
            
            // Get all visible text on page
            const allText = await page.evaluate(() => {
              return document.body.textContent || '';
            });
            
            const phoneMatches = allText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g);
            if (phoneMatches && phoneMatches.length > 0) {
              console.log(`   📞 Found ${phoneMatches.length} phone patterns in page text:`);
              phoneMatches.slice(0, 5).forEach(phone => console.log(`      - ${phone}`));
            }
          }
        } else {
          console.log('\n❌ No modal found after clicking');
          
          // Check what's actually on the page
          const pageInfo = await page.evaluate(() => {
            const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
              const style = window.getComputedStyle(el);
              return (style.position === 'fixed' || style.position === 'absolute') &&
                     parseInt(style.zIndex) > 50 &&
                     el.offsetParent !== null;
            });
            
            return fixedElements.map(el => ({
              tag: el.tagName,
              class: el.className || '',
              id: el.id || '',
              text: (el.textContent || '').substring(0, 100),
              zIndex: window.getComputedStyle(el).zIndex
            }));
          });
          
          console.log(`\n   Found ${pageInfo.length} fixed/absolute elements with z-index > 50:`);
          pageInfo.slice(0, 5).forEach(info => {
            console.log(`      - ${info.tag} (z-index: ${info.zIndex}, class: ${info.class.substring(0, 50)})`);
            console.log(`        Text: ${info.text.substring(0, 80)}`);
          });
        }
        
        // Close modal
        await page.keyboard.press('Escape');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n✅ Test complete. Check the browser window to see what happened.');
    console.log('Press Ctrl+C to close...');
    
    // Keep browser open for inspection
    await new Promise(resolve => setTimeout(resolve, 30000));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testPhoneExtraction().catch(console.error);

