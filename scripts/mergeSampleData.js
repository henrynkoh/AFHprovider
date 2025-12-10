/**
 * Merge verified sample data into allProviders.json
 * This adds the 12 providers we manually verified with correct phone numbers
 */

const fs = require('fs');
const path = require('path');

const PROVIDERS_FILE = path.join(__dirname, '..', 'data', 'allProviders.json');
const SAMPLE_DATA_FILE = path.join(__dirname, '..', 'data', 'sampleData.ts');

// The verified providers from sampleData.ts
const verifiedProviders = [
  {
    id: "verified-1",
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
    id: "verified-2",
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
  {
    id: "verified-3",
    areaCity: "Centralia, WA",
    businessName: "PACIFIC CARE ADULT FAMILY HOME LLC",
    providerName: "Pacific Care",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 6,
    privatePayMedicaidRatio: "Private pay",
    others: "702 Scott Dr, Centralia, WA 98531 (1.74 miles away). Specialties: Mental Health, Dementia, Developmental Disabilities",
  },
  {
    id: "verified-4",
    areaCity: "Centralia, WA",
    businessName: "1 SUNNYSIDE DR LLC",
    providerName: "1 Sunnyside Dr",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "122 Sunnyside Dr, Centralia, WA 98531 (2.03 miles away)",
  },
  {
    id: "verified-5",
    areaCity: "Centralia, WA",
    businessName: "Stars AFH LLC",
    providerName: "Stars AFH",
    phoneNumber: "(201) 800-5723",
    website: "adultfamilyhomecouncil.org/home-finder/755985-stars-afh-llc",
    yearStarted: 0,
    residentBeds: 6,
    privatePayMedicaidRatio: "Private pay, Medicaid payments, Medicaid on arrival, Medicaid step-down",
    others: "2517 Kristine Ct, Centralia, WA 98531 (2.08 miles away). Specialties: Dementia, Developmental Disabilities. Offers private rooms. Additional language: Swahili. The good and excellent care provided",
  },
  {
    id: "verified-6",
    areaCity: "Centralia, WA",
    businessName: "Vivian's House Young Adult Center",
    providerName: "Vivian's House",
    phoneNumber: "(360) 736-9178",
    website: "adultfamilyhomecouncil.org/home-finder/754038-vivians-house-young-adult-center",
    yearStarted: 0,
    residentBeds: 6,
    privatePayMedicaidRatio: "Private pay, Medicaid payments, Medicaid on arrival",
    others: "230 Washington Way Bldg B, Centralia, WA 98531 (2.37 miles away). Specialty: Developmental Disabilities. Contracts: Private Duty Nursing. Pope's Place provides individualized care for children and young adults with exceptional medical needs to strengthen them, their families, and communities",
  },
  {
    id: "verified-7",
    areaCity: "Chehalis, WA",
    businessName: "Silver Acres LLC",
    providerName: "Silver Acres",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "1266 SW 22nd St, Chehalis, WA 98532 (5.3 miles away). Silver Acres Adult Family Home provides compassionate, high-quality care in a warm and supportive environment, ensuring that every resident feels valued and cared for",
  },
  {
    id: "verified-8",
    areaCity: "Chehalis, WA",
    businessName: "Curtis Hill Manor Adult Family Home LLC",
    providerName: "Curtis Hill Manor",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "354 Curtis Hill Rd, Chehalis, WA 98532 (9.68 miles away). The employees of Curtis Hill Manor are held to the very highest nursing standards and the home is directed 24/7 by licensed nursing staff",
  },
  {
    id: "verified-9",
    areaCity: "Napavine, WA",
    businessName: "Peace First Adult Care Home",
    providerName: "Peace First",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "210 W Washington St, Napavine, WA 98565 (9.98 miles away). We stand as a beacon of dedicated care for the elderly. Our unwavering focus is on providing excellence in every aspect of resident care",
  },
  {
    id: "verified-10",
    areaCity: "Rochester, WA",
    businessName: "Absolute Retirement Chalet Adult Family Home LLC",
    providerName: "Retirement Chalet",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 1992,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "10637 School Land Rd SW, Rochester, WA 98579 (10.42 miles away). Retirement Chalet was built in 1992 on a two beautiful park like acres. Our home is located in a quiet, peaceful setting",
  },
  {
    id: "verified-11",
    areaCity: "Olympia, WA",
    businessName: "Ray Adult Family Home",
    providerName: "Ray AFH",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "10547 CRISTEN CT SW, Olympia, WA 98512 (15.57 miles away). Very loving fun home!",
  },
  {
    id: "verified-12",
    areaCity: "Olympia, WA",
    businessName: "Annies AFH LLC",
    providerName: "Annies AFH",
    phoneNumber: "Contact via AFHC",
    website: "adultfamilyhomecouncil.org/home-finder",
    yearStarted: 0,
    residentBeds: 0,
    privatePayMedicaidRatio: "Not specified",
    others: "8976 Buttercup St SE, Olympia, WA 98501 (17.1 miles away). Annies AFH is located in a quiet, peaceful and very secure neighborhood away from busy roads and city noise. Its beautiful surroundings provide a serene environment for residents",
  },
];

function mergeData() {
  try {
    console.log('🔄 Merging verified sample data into allProviders.json...\n');
    
    const allProviders = JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf-8'));
    const existingNames = new Set(allProviders.map(p => p.businessName.toLowerCase().trim()));
    
    let added = 0;
    let updated = 0;
    
    verifiedProviders.forEach(verified => {
      const verifiedNameLower = verified.businessName.toLowerCase().trim();
      
      // Find ALL matching providers (there might be duplicates from scraping)
      const matchingProviders = allProviders
        .map((p, idx) => ({ provider: p, index: idx }))
        .filter(({ provider }) => {
          const pName = provider.businessName.toLowerCase().trim();
          return pName === verifiedNameLower || 
                 pName.includes(verifiedNameLower) ||
                 verifiedNameLower.includes(pName);
        });
      
      if (matchingProviders.length > 0) {
        // Update all matching providers
        matchingProviders.forEach(({ provider, index }) => {
      
          let wasUpdated = false;
          
          // Update phone if verified has a real phone and existing doesn't
          if (verified.phoneNumber !== 'Contact via AFHC' && 
              (provider.phoneNumber === 'Contact via AFHC' || 
               !provider.phoneNumber ||
               provider.phoneNumber.includes('Contact via'))) {
            provider.phoneNumber = verified.phoneNumber;
            wasUpdated = true;
          }
          
          // Update areaCity if verified has better data
          if (verified.areaCity !== 'Unknown, WA' && 
              (provider.areaCity === 'Unknown, WA' || !provider.areaCity)) {
            provider.areaCity = verified.areaCity;
            wasUpdated = true;
          }
          
          // Update others if verified has more info
          if (verified.others && 
              verified.others !== 'No additional information available' &&
              (provider.others === 'No additional information available' || 
               !provider.others || 
               provider.others.length < verified.others.length)) {
            provider.others = verified.others;
            wasUpdated = true;
          }
          
          // Update other fields
          if (verified.residentBeds > 0 && provider.residentBeds === 0) {
            provider.residentBeds = verified.residentBeds;
            wasUpdated = true;
          }
          if (verified.privatePayMedicaidRatio !== 'Not specified' && 
              provider.privatePayMedicaidRatio === 'Not specified') {
            provider.privatePayMedicaidRatio = verified.privatePayMedicaidRatio;
            wasUpdated = true;
          }
          if (verified.yearStarted > 0 && provider.yearStarted === 0) {
            provider.yearStarted = verified.yearStarted;
            wasUpdated = true;
          }
          
          if (wasUpdated) updated++;
        });
        
        if (matchingProviders.length > 0 && updated > 0) {
          console.log(`✓ Updated ${matchingProviders.length} instance(s) of: ${verified.businessName}`);
        }
        
      } else {
        // Add new verified provider
        allProviders.push(verified);
        added++;
        console.log(`✓ Added: ${verified.businessName} (${verified.phoneNumber})`);
      }
    });
    
    // Save merged data
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(allProviders, null, 2));
    
    console.log(`\n✅ Merged data:`);
    console.log(`   - Added: ${added} new providers`);
    console.log(`   - Updated: ${updated} existing providers`);
    console.log(`   - Total providers: ${allProviders.length}`);
    console.log(`💾 Saved to: ${PROVIDERS_FILE}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  mergeData();
}

module.exports = { mergeData };

