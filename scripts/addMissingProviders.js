/**
 * Add missing verified providers (Arianna Care, Beloved AFH) to allProviders.json
 */

const fs = require('fs');
const path = require('path');

const PROVIDERS_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');

const missingProviders = [
  {
    id: "verified-arianna",
    areaCity: "Centralia, WA",
    businessName: "Arianna Care LLC",
    providerName: "Arianna Care",
    phoneNumber: "(360) 807-4237",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 6,
    privatePayMedicaidRatio: "Not specified",
    others: "610 Hamilton Ave, Centralia, WA 98531 (0.55 miles from Centralia). Licensed adult family home",
  },
  {
    id: "verified-beloved",
    areaCity: "Centralia, WA",
    businessName: "Beloved AFH",
    providerName: "Beloved AFH",
    phoneNumber: "(360) 669-0806",
    website: "adultfamilyhomecouncil.org/home-finder/756436-beloved-afh",
    yearStarted: 0,
    residentBeds: 6,
    privatePayMedicaidRatio: "Private pay & Medicaid",
    others: "701 Marsh Ave Apt B, Centralia, WA 98531 (0.85 miles away). License #756436. Specialties: Mental Health, Dementia, Developmental Disabilities. We Medicaid shared male beds available. Additional language: Swahili",
  },
];

function addMissingProviders() {
  try {
    console.log('➕ Adding missing verified providers...\n');
    
    const allProviders = JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf-8'));
    const existingNames = new Set(allProviders.map(p => p.businessName.toLowerCase().trim()));
    
    let added = 0;
    
    missingProviders.forEach(provider => {
      const nameLower = provider.businessName.toLowerCase().trim();
      
      if (!existingNames.has(nameLower)) {
        allProviders.push(provider);
        existingNames.add(nameLower);
        added++;
        console.log(`✓ Added: ${provider.businessName} (${provider.phoneNumber})`);
      } else {
        console.log(`⊘ Already exists: ${provider.businessName}`);
      }
    });
    
    // Save updated data
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(allProviders, null, 2));
    
    console.log(`\n✅ Added ${added} missing providers!`);
    console.log(`💾 Total providers: ${allProviders.length}`);
    console.log(`💾 Saved to: ${PROVIDERS_FILE}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addMissingProviders();
}

module.exports = { addMissingProviders };

