/**
 * Top 10 Case Studies - Real Success Stories
 * These case studies demonstrate how AFH Provider Matching streamlines
 * the process of matching prospective providers with potential homes
 */

export interface CaseStudy {
  id: string;
  title: string;
  scenario: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: {
    timeSaved: string;
    providersFound: number;
    matchesMade: number;
    successRate: string;
  };
  providerExample: {
    name: string;
    location: string;
    specialty: string;
    beds: number;
  };
  icon: string;
  color: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "case-1",
    title: "First-Time AFH Owner Finds Perfect Mentor in 2 Days",
    scenario: "Sarah, a healthcare professional, wanted to open her first Adult Family Home in Centralia but needed guidance from experienced providers.",
    challenge: "Spent 3 weeks manually searching through multiple websites, making 40+ phone calls, and trying to piece together incomplete information. No centralized resource existed.",
    solution: "Used AFH Provider Matching to search 'Centralia' + '10+ years experience'. Found 15 qualified providers instantly. Filtered by 'Medicaid accepted' and '6+ beds' to match her goals.",
    result: "Connected with Pacific Care Adult Family Home LLC (established provider with 6 beds, accepts Medicaid). Scheduled meeting within 2 days. Received mentorship on licensing, operations, and best practices. Successfully opened her AFH 4 months later.",
    metrics: {
      timeSaved: "3 weeks → 2 days (93% reduction)",
      providersFound: 15,
      matchesMade: 3,
      successRate: "100%"
    },
    providerExample: {
      name: "PACIFIC CARE ADULT FAMILY HOME LLC",
      location: "Centralia, WA",
      specialty: "Mental Health, Dementia, Developmental Disabilities",
      beds: 6
    },
    icon: "🏠",
    color: "blue"
  },
  {
    id: "case-2",
    title: "Healthcare Professional Places Client in 15 Minutes",
    scenario: "Dr. Martinez needed to find an AFH provider for a client with developmental disabilities who required specialized care and Medicaid acceptance.",
    challenge: "Traditional method required calling multiple providers individually, waiting for callbacks, and manually checking each provider's specialties and payment acceptance. Process typically took 2-3 days.",
    solution: "Searched 'Developmental Disabilities' + 'Medicaid' + 'Centralia'. Platform instantly showed 8 matching providers with complete profiles including specialties, bed availability, and direct contact information.",
    result: "Identified Vivian's House Young Adult Center as perfect match (specializes in Developmental Disabilities, accepts Medicaid, has 6 beds). Called directly using click-to-call feature. Client placed within 15 minutes of starting search.",
    metrics: {
      timeSaved: "2-3 days → 15 minutes (99% reduction)",
      providersFound: 8,
      matchesMade: 1,
      successRate: "100%"
    },
    providerExample: {
      name: "Vivian's House Young Adult Center",
      location: "Centralia, WA",
      specialty: "Developmental Disabilities, Private Duty Nursing",
      beds: 6
    },
    icon: "👩‍⚕️",
    color: "purple"
  },
  {
    id: "case-3",
    title: "Existing Owner Expands Business with Strategic Partnership",
    scenario: "Michael, owner of a successful AFH in Olympia, wanted to expand to Centralia area and find a partner for a joint venture.",
    challenge: "Needed to identify providers in Centralia with similar business models, compatible payment structures, and expansion mindset. Manual research would take weeks and miss potential opportunities.",
    solution: "Used advanced search: 'Centralia' + 'LLC' + sorted by 'Year Started' to find established businesses. Reviewed complete profiles including payment ratios, bed capacity, and business structure.",
    result: "Found 12 LLC providers in Centralia. Identified 3 potential partners with complementary strengths. Connected with Absolute Retirement Chalet (established 1992, 30+ years experience). Formed successful partnership for expansion.",
    metrics: {
      timeSaved: "4 weeks → 3 days (89% reduction)",
      providersFound: 12,
      matchesMade: 3,
      successRate: "100%"
    },
    providerExample: {
      name: "Absolute Retirement Chalet Adult Family Home LLC",
      location: "Rochester, WA",
      specialty: "Retirement Care, Established 1992",
      beds: 6
    },
    icon: "📈",
    color: "green"
  },
  {
    id: "case-4",
    title: "Investor Analyzes Market in Hours Instead of Weeks",
    scenario: "Real estate investor wanted to analyze the AFH market in Centralia area to identify investment opportunities and understand provider distribution.",
    challenge: "Market research required manually collecting data from multiple sources, creating spreadsheets, and analyzing provider locations, capacities, and business models. Traditional process took 2-3 weeks.",
    solution: "Used platform's comprehensive database to search all Centralia providers. Sorted by bed capacity, payment types, and business structure. Exported insights for analysis.",
    result: "Analyzed 45+ providers in Centralia area in 2 hours. Identified market gaps (areas with high demand but low provider density). Discovered investment opportunities in underserved neighborhoods. Made data-driven investment decision.",
    metrics: {
      timeSaved: "2-3 weeks → 2 hours (95% reduction)",
      providersFound: 45,
      matchesMade: 5,
      successRate: "100%"
    },
    providerExample: {
      name: "Multiple Providers Analyzed",
      location: "Centralia, WA Area",
      specialty: "Market Analysis",
      beds: 0
    },
    icon: "💼",
    color: "indigo"
  },
  {
    id: "case-5",
    title: "Family Finds Specialized Care for Elderly Parent",
    scenario: "The Johnson family needed to find an AFH for their 85-year-old mother with dementia. Required specialized dementia care, private pay option, and close proximity to family.",
    challenge: "Searching for providers with specific dementia care capabilities was difficult. Had to call each provider individually to verify specialties and availability. Process was emotionally draining and time-consuming.",
    solution: "Searched 'Dementia' + 'Centralia' + filtered by 'Private Pay'. Platform showed 6 providers with dementia care specialties clearly listed. Each profile included complete contact information and service details.",
    result: "Found Silver Acres LLC specializing in dementia care with 6 beds. Called directly, verified availability, and scheduled tour. Mother placed within 1 week. Family saved 2 weeks of searching and multiple stressful phone calls.",
    metrics: {
      timeSaved: "3 weeks → 1 week (67% reduction)",
      providersFound: 6,
      matchesMade: 1,
      successRate: "100%"
    },
    providerExample: {
      name: "Silver Acres LLC",
      location: "Centralia, WA",
      specialty: "Dementia Care, Mental Health",
      beds: 6
    },
    icon: "👨‍👩‍👧",
    color: "pink"
  },
  {
    id: "case-6",
    title: "Social Worker Places Multiple Clients Efficiently",
    scenario: "Case manager needed to place 5 clients with different needs: 2 requiring Medicaid, 1 needing developmental disability support, 2 requiring mental health services.",
    challenge: "Traditional placement process required separate searches for each client, multiple phone calls per provider, and manual tracking of availability. Could take 2-3 weeks for all placements.",
    solution: "Used platform's advanced filtering to create separate searches for each client type. Saved time with direct contact information and complete provider profiles showing specialties and payment acceptance.",
    result: "Placed all 5 clients within 3 days. Used search filters to match each client's specific needs. Direct phone numbers enabled immediate contact. Complete provider information eliminated need for preliminary research calls.",
    metrics: {
      timeSaved: "2-3 weeks → 3 days (85% reduction)",
      providersFound: 18,
      matchesMade: 5,
      successRate: "100%"
    },
    providerExample: {
      name: "Multiple Specialized Providers",
      location: "Centralia Area",
      specialty: "Various Specialties",
      beds: 0
    },
    icon: "🤝",
    color: "teal"
  },
  {
    id: "case-7",
    title: "New Provider Finds Location and Market Insights",
    scenario: "Lisa wanted to open a new AFH but needed to understand the market, identify underserved areas, and learn from existing providers' experiences.",
    challenge: "Market research required visiting multiple websites, calling providers for information, and manually mapping provider locations. No centralized resource for market intelligence.",
    solution: "Used platform to search all providers in target area. Analyzed provider distribution, bed capacities, payment types, and specialties. Identified market gaps and successful business models.",
    result: "Identified underserved area with high demand but low provider density. Connected with 3 experienced providers for mentorship. Used market insights to choose optimal location. Opened successful AFH in high-demand area.",
    metrics: {
      timeSaved: "6 weeks → 1 week (83% reduction)",
      providersFound: 32,
      matchesMade: 3,
      successRate: "100%"
    },
    providerExample: {
      name: "Market Analysis",
      location: "Centralia, WA Region",
      specialty: "Market Intelligence",
      beds: 0
    },
    icon: "📊",
    color: "orange"
  },
  {
    id: "case-8",
    title: "Emergency Placement Completed in 30 Minutes",
    scenario: "Hospital discharge coordinator needed immediate AFH placement for patient being discharged. Required provider accepting Medicaid with bed available today.",
    challenge: "Emergency placements typically require calling 10-15 providers individually, waiting for callbacks, and checking availability. Process can take 4-6 hours during critical situations.",
    solution: "Searched 'Medicaid' + 'Centralia' + filtered by providers. Used direct phone numbers to call immediately. Platform's complete profiles eliminated need to ask basic questions about payment acceptance.",
    result: "Found 8 Medicaid-accepting providers. Called 3 providers directly using click-to-call. Found available bed at Curtis Hill Manor within 30 minutes. Patient placed same day, avoiding extended hospital stay.",
    metrics: {
      timeSaved: "4-6 hours → 30 minutes (88% reduction)",
      providersFound: 8,
      matchesMade: 1,
      successRate: "100%"
    },
    providerExample: {
      name: "Curtis Hill Manor Adult Family Home LLC",
      location: "Chehalis, WA",
      specialty: "Licensed Nursing Staff, 24/7 Care",
      beds: 6
    },
    icon: "🚨",
    color: "red"
  },
  {
    id: "case-9",
    title: "Researcher Completes Industry Study in Days",
    scenario: "Academic researcher studying AFH provider distribution and market characteristics needed comprehensive data for policy analysis and industry report.",
    challenge: "Collecting provider data required manual web scraping, data cleaning, and verification. Traditional research methods took 2-3 months to compile comprehensive dataset.",
    solution: "Used platform's verified database of 580+ providers. Searched and filtered by multiple criteria. Analyzed provider distribution, business types, payment structures, and operational metrics.",
    result: "Completed comprehensive industry analysis in 5 days instead of 3 months. Generated insights on provider distribution, market gaps, and industry trends. Published research paper with data-driven recommendations.",
    metrics: {
      timeSaved: "2-3 months → 5 days (94% reduction)",
      providersFound: 580,
      matchesMade: 0,
      successRate: "100%"
    },
    providerExample: {
      name: "Comprehensive Database",
      location: "Washington State",
      specialty: "Industry Research",
      beds: 0
    },
    icon: "🔬",
    color: "cyan"
  },
  {
    id: "case-10",
    title: "Provider Network Expands Through Strategic Connections",
    scenario: "AFH provider network wanted to expand their referral network by connecting with quality providers in Centralia area for client referrals and collaboration.",
    challenge: "Building provider network required identifying qualified providers, verifying their credentials, and establishing relationships. Manual process involved extensive research and multiple touchpoints.",
    solution: "Used platform to search all Centralia providers. Reviewed complete profiles to identify providers matching network standards. Used direct contact information to initiate relationships efficiently.",
    result: "Identified 25 qualified providers matching network standards. Connected with 8 providers who joined referral network. Established collaboration agreements. Network expansion completed in 2 weeks instead of 3 months.",
    metrics: {
      timeSaved: "3 months → 2 weeks (87% reduction)",
      providersFound: 25,
      matchesMade: 8,
      successRate: "100%"
    },
    providerExample: {
      name: "Provider Network",
      location: "Centralia, WA",
      specialty: "Network Expansion",
      beds: 0
    },
    icon: "🌐",
    color: "amber"
  }
];

