const puppeteer = require('puppeteer');

async function debugPage() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const url = 'https://adultfamilyhomecouncil.org/home-finder?near_address=Centralia%2C+Washington%2C+USA&location=46.7162136%2C-122.9542972&page=1';
  
  console.log('Loading page...');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n=== PAGE STRUCTURE DEBUG ===\n');

  // Get all provider cards
  const cards = await page.evaluate(() => {
    const allCards = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent || '';
      return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
    });
    return allCards.length;
  });
  console.log(`Found ${cards} provider cards\n`);

  // Debug first provider card
  const firstCardInfo = await page.evaluate(() => {
    const allCards = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent || '';
      return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
    });
    
    if (allCards.length === 0) return null;
    
    const card = allCards[0];
    const cardText = card.textContent || '';
    
    // Find all buttons/links in this card
    const buttons = Array.from(card.querySelectorAll('button, a, [role="button"], [onclick], div[onclick], span[onclick]'));
    
    const buttonInfo = buttons.map(btn => ({
      tag: btn.tagName,
      text: (btn.textContent || '').substring(0, 50),
      className: btn.className || '',
      id: btn.id || '',
      href: btn.href || '',
      onclick: btn.onclick ? 'has onclick' : 'no onclick',
      ariaLabel: btn.getAttribute('aria-label') || ''
    }));
    
    // Check for tel: links on the page
    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]')).map(link => ({
      href: link.getAttribute('href'),
      text: link.textContent || ''
    }));
    
    // Check for modals
    const modals = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return (style.position === 'fixed' || style.position === 'absolute') &&
             parseInt(style.zIndex) > 100;
    });
    
    return {
      cardText: cardText.substring(0, 200),
      buttons: buttonInfo,
      telLinks: telLinks,
      modalCount: modals.length,
      cardHTML: card.innerHTML.substring(0, 500)
    };
  });

  console.log('First Card Info:');
  console.log(JSON.stringify(firstCardInfo, null, 2));

  // Try clicking the first contact button
  console.log('\n=== TRYING TO CLICK CONTACT BUTTON ===\n');
  
  const clickResult = await page.evaluate(() => {
    const allCards = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent || '';
      return text.includes('Bed Available') && text.length > 50 && text.length < 2000;
    });
    
    if (allCards.length === 0) return { success: false, error: 'No cards found' };
    
    const card = allCards[0];
    const buttons = Array.from(card.querySelectorAll('button, a, [role="button"], [onclick]'));
    
    const contactBtn = buttons.find(btn => {
      const text = (btn.textContent || '').toLowerCase();
      return text.includes('contact');
    });
    
    if (!contactBtn) return { success: false, error: 'No contact button found', buttons: buttons.map(b => b.textContent) };
    
    contactBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    contactBtn.click();
    
    return { success: true, buttonText: contactBtn.textContent };
  });

  console.log('Click result:', JSON.stringify(clickResult, null, 2));

  // Wait and check for modal
  await new Promise(resolve => setTimeout(resolve, 5000));

  const afterClick = await page.evaluate(() => {
    // Check for new tel: links
    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]')).map(link => ({
      href: link.getAttribute('href'),
      text: link.textContent || '',
      visible: link.offsetParent !== null
    }));
    
    // Check for visible modals
    const modals = Array.from(document.querySelectorAll('*')).filter(el => {
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
    
    return {
      telLinks: telLinks,
      modalCount: modals.length,
      modalText: modals.length > 0 ? (modals[0].textContent || '').substring(0, 300) : null
    };
  });

  console.log('\n=== AFTER CLICK ===');
  console.log(JSON.stringify(afterClick, null, 2));

  console.log('\n\nWaiting 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
}

debugPage().catch(console.error);

