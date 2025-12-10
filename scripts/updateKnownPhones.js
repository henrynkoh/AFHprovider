/**
 * Script to update known phone numbers in allProviders.json
 * Uses the phone numbers we verified earlier
 */

const fs = require('fs');
const path = require('path');

const PROVIDERS_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');

// Known phone numbers from our earlier verification
// Use exact business name matches only to avoid false matches
const knownPhones = {
  'Arianna Care LLC': '(360) 807-4237',
  'Beloved AFH': '(360) 669-0806',
  'Stars AFH LLC': '(201) 800-5723',
  "Vivian's House Young Adult Center": '(360) 736-9178',
  "Vivian's House": '(360) 736-9178',
};

// Very specific patterns - match at the START of the business name only
// This prevents matching addresses or other text that might contain these words
const phonePatterns = [
  // Match "Arianna Care LLC" at the start (may have address after)
  { pattern: /^Arianna Care LLC/i, phone: '(360) 807-4237', name: 'Arianna Care LLC' },
  { pattern: /^Arianna Care\s/i, phone: '(360) 807-4237', name: 'Arianna Care' },
  // Match "Beloved AFH" at the start
  { pattern: /^Beloved AFH\s/i, phone: '(360) 669-0806', name: 'Beloved AFH' },
  // Match "Stars AFH LLC" at the start
  { pattern: /^Stars AFH LLC/i, phone: '(201) 800-5723', name: 'Stars AFH LLC' },
  // Match "Vivian's House Young Adult Center" at the start
  { pattern: /^Vivian'?s House Young Adult Center/i, phone: '(360) 736-9178', name: "Vivian's House Young Adult Center" },
  { pattern: /^Vivian'?s House\s/i, phone: '(360) 736-9178', name: "Vivian's House" },
];

function updatePhoneNumbers() {
  try {
    console.log('📞 Updating known phone numbers...\n');
    
    const data = JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf-8'));
    let updated = 0;
    
    // First pass: Reset all incorrectly updated phone numbers
    console.log('🔄 Step 1: Resetting incorrectly updated phone numbers...\n');
    let reset = 0;
    data.forEach((provider) => {
      const rawName = provider.businessName.trim();
      const cleanName = rawName
        .replace(/\s+\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)[^,\n]*,?.*$/gi, '')
        .replace(/,\s*[^,\n]+,\s*[A-Z]{2}\s*\d{5}.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Check if this provider should have this phone number
      const shouldHavePhone = knownPhones[rawName] || knownPhones[cleanName] ||
        phonePatterns.some(({ pattern }) => pattern.test(rawName) || pattern.test(cleanName));
      
      // If it has a phone number but shouldn't, reset it
      if (provider.phoneNumber && provider.phoneNumber !== 'Contact via AFHC') {
        if (!shouldHavePhone) {
          provider.phoneNumber = 'Contact via AFHC';
          reset++;
          if (reset <= 10) { // Only show first 10 to avoid spam
            console.log(`↻ Reset: ${rawName.substring(0, 50)} → Contact via AFHC`);
          }
        }
      }
    });
    
    if (reset > 10) {
      console.log(`... and ${reset - 10} more resets`);
    }
    console.log(`\n✅ Reset ${reset} incorrectly updated phone numbers\n`);
    
    // Second pass: Update correct phone numbers
    console.log('📞 Step 2: Updating known phone numbers...\n');
    data.forEach((provider, index) => {
      // Get the raw business name
      const rawName = provider.businessName.trim();
      
      // Extract just the business name part (remove address that might be appended)
      let cleanName = rawName
        .replace(/\s+\d+\s+[A-Z][^,\n]+(?:Ave|St|Rd|Dr|Ct|Blvd|Way|Lane|Court|Place)[^,\n]*,?.*$/gi, '')
        .replace(/,\s*[^,\n]+,\s*[A-Z]{2}\s*\d{5}.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Skip if already has the correct phone number
      const currentPhone = provider.phoneNumber;
      const expectedPhone = knownPhones[rawName] || knownPhones[cleanName];
      if (currentPhone === expectedPhone) {
        return; // Already correct
      }
      
      // Try exact match first (most reliable)
      if (knownPhones[rawName]) {
        provider.phoneNumber = knownPhones[rawName];
        updated++;
        console.log(`✓ Updated: ${rawName.substring(0, 50)} → ${provider.phoneNumber}`);
        return;
      }
      
      // Try exact match on cleaned name
      if (knownPhones[cleanName]) {
        provider.phoneNumber = knownPhones[cleanName];
        updated++;
        console.log(`✓ Updated: ${cleanName.substring(0, 50)} → ${provider.phoneNumber}`);
        return;
      }
      
      // Try very specific pattern matching - match at the START of the name only
      for (const { pattern, phone, name } of phonePatterns) {
        // Test if pattern matches at the beginning of the name
        if (pattern.test(rawName) || pattern.test(cleanName)) {
          if (provider.phoneNumber !== phone) {
            provider.phoneNumber = phone;
            updated++;
            console.log(`✓ Updated: ${name} → ${provider.phoneNumber}`);
          }
          break;
        }
      }
    });
    
    // Save updated data
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(data, null, 2));
    
    console.log(`\n✅ Updated ${updated} phone numbers!`);
    console.log(`💾 Saved to: ${PROVIDERS_FILE}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updatePhoneNumbers();
}

module.exports = { updatePhoneNumbers };

