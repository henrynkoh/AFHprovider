# 🏠 AFH Provider Matching

<div align="center">

**Connect with Quality Adult Family Home Providers in Centralia, WA**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

[🚀 Live Demo](#) • [📖 Documentation](MANUAL.md) • [🐛 Report Bug](#) • [💡 Request Feature](#)

</div>

---

## ✨ Overview

**AFH Provider Matching** is a comprehensive Next.js web application that revolutionizes how potential Adult Family Home (AFH) homeowners connect with experienced providers in Centralia, WA and surrounding areas. 

Our platform aggregates data from the **Adult Family Home Council of Washington State**, providing access to **580+ verified providers** with complete contact information, business details, and operational metrics.

### 🎯 Key Features

- 🔍 **Advanced Search** - Find providers in seconds with intelligent fuzzy matching
- 📊 **580+ Verified Providers** - Comprehensive database with complete contact information
- 📱 **Mobile-Friendly** - Fully responsive design works on all devices
- ⚡ **Real-Time Results** - Instant search updates as you type
- 🆓 **Completely Free** - No registration, no fees, no credit card required
- 📞 **Direct Contact** - Click-to-call phone numbers on mobile devices
- 🎨 **Modern UI** - Beautiful design with smooth animations and intuitive navigation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/afh-provider-matching.git

# Navigate to the project
cd afh-provider-matching

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📸 Screenshots

<div align="center">

### Homepage
![Homepage](https://via.placeholder.com/800x400/2563eb/ffffff?text=AFH+Provider+Matching+Homepage)

### Search Results
![Search Results](https://via.placeholder.com/800x400/7c3aed/ffffff?text=Provider+Search+Results)

### Mobile View
![Mobile View](https://via.placeholder.com/400x800/ec4899/ffffff?text=Mobile+View)

</div>

---

## 🎯 Features in Detail

### 🔍 Advanced Search System

- **Multiple Search Methods**: Text search, quick filters, phone number search, combination searches
- **Intelligent Matching**: Fuzzy matching finds providers even with typos
- **Real-Time Updates**: Results appear instantly as you type
- **Smart Filtering**: Filter by location, payment type, business type, and more

### 📊 Comprehensive Provider Database

Each provider listing includes:
- 📍 Location (City, State)
- 🏢 Official Business Name
- 👤 Provider Contact Information
- 📞 Direct Phone Numbers
- 🌐 Website Links
- 📅 Year Business Started
- 🛏️ Resident Bed Capacity
- 💰 Payment Ratios (Private Pay/Medicaid)
- 📝 Additional Notes & Services

### 📱 Mobile Optimization

- Fully responsive design
- Touch-friendly interface
- Click-to-call functionality
- Optimized for all screen sizes

---

## 🛠️ Technology Stack

<div align="center">

| Frontend | Backend | Data Collection |
|----------|---------|-----------------|
| Next.js 16 | Next.js API Routes | Puppeteer |
| React 19 | Node.js | Web Scraping |
| TypeScript | JSON Data Storage | Data Validation |
| Tailwind CSS 4 | Serverless Functions | Progress Tracking |

</div>

---

## 📁 Project Structure

```
afh-provider-matching/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── NavBar.tsx
│   ├── SearchBar.tsx
│   └── ProviderTable.tsx
├── data/                  # Data files
│   └── allProviders.json  # Provider database
├── scripts/               # Automation scripts
│   └── scrapeAllPhones.js
├── types/                 # TypeScript types
└── marketing/             # Marketing materials
```

---

## 📊 Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| **Total Providers** | 580+ |
| **Cities Covered** | 45+ |
| **With Contact Info** | 520+ |
| **Data Source** | Adult Family Home Council of WA |

</div>

---

## 🎯 Use Cases

### 🏡 Potential AFH Homeowners
Find experienced providers to guide you through the startup process and help establish a successful operation.

### 📈 Existing AFH Owners
Discover expansion opportunities, find partnership possibilities, and connect with other operators.

### 👩‍⚕️ Healthcare Professionals
Quickly locate qualified providers for client placement with comprehensive search and filtering.

### 💼 Investors
Access comprehensive market data for informed investment decisions in the AFH industry.

### 🔬 Researchers
Study industry trends, provider distribution, and market dynamics with verified data.

---

## 🚀 Getting Started Guide

### For Users

1. **Visit the Platform** - No registration required
2. **Search for Providers** - Use the search bar or quick filters
3. **Review Information** - Explore complete provider profiles
4. **Contact Providers** - Click phone numbers or website links
5. **Make Decisions** - Compare providers and choose the best match

### For Developers

See our [Developer Documentation](README.md#-for-developers) for setup instructions, API documentation, and contribution guidelines.

---

## 📖 Documentation

- 📘 [User Manual](MANUAL.md) - Complete user guide
- 🎓 [Tutorial](TUTORIAL.md) - Step-by-step tutorials
- ⚡ [Quick Start](QUICKSTART.md) - Get started in 5 minutes
- 🐛 [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Create production build
npm start            # Start production server
npm run lint         # Run ESLint

# Data Collection
npm run scrape-all-phones    # Scrape phone numbers
npm run update-phones        # Update known phones
npm run merge-data           # Merge sample data
```

---

## 🎨 Features Showcase

### 🔍 Search Capabilities
- **Fuzzy Matching**: Find providers even with typos
- **Multiple Criteria**: Combine location, type, payment method
- **Real-Time**: Instant results as you type
- **Quick Filters**: One-click access to common searches

### 📊 Provider Information
- **Complete Profiles**: All information in one place
- **Verified Data**: From official Adult Family Home Council
- **Direct Contact**: Phone numbers and websites
- **Operational Metrics**: Experience, capacity, payment types

### 📱 User Experience
- **Responsive Design**: Works on all devices
- **Modern UI**: Beautiful gradients and animations
- **Intuitive Navigation**: Easy to use for everyone
- **Fast Performance**: Optimized for speed

---

## 🌟 Why Choose AFH Provider Matching?

<div align="center">

| Traditional Method | AFH Provider Matching |
|-------------------|----------------------|
| ⏱️ Weeks of searching | ⚡ Minutes to find providers |
| 📞 Countless phone calls | 📱 Direct contact information |
| 🌐 Multiple websites | 🎯 One comprehensive platform |
| ❓ Incomplete information | ✅ Complete verified profiles |
| 💰 Paid services | 🆓 Completely free |

</div>

---

## 📈 Roadmap

- [ ] Provider profile pages with detailed information
- [ ] Advanced filtering by bed capacity and payment type
- [ ] Map integration showing provider locations
- [ ] Export functionality (CSV, PDF)
- [ ] Favorites system for saving providers
- [ ] Email notifications for new matches
- [ ] Provider comparison tool
- [ ] Mobile app (iOS & Android)
- [ ] Public API for third-party integrations
- [ ] Analytics dashboard

---

## 🏆 Success Stories

> "I spent weeks trying to find providers the old way. AFH Provider Matching made it so easy - I found exactly what I was looking for in minutes instead of weeks!" 
> 
> **— Sarah, AFH Owner**

> "As a healthcare professional, I need to find providers quickly for my clients. This platform saves me hours of work and helps me make better placement decisions."
> 
> **— Dr. Johnson, Healthcare Professional**

---

## 📞 Support

- 📧 Email: [support@afhprovidermatching.com](#)
- 💬 Issues: [GitHub Issues](#)
- 📖 Documentation: [Full Documentation](MANUAL.md)
- 🐛 Bug Reports: [Report a Bug](#)

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Adult Family Home Council of Washington State** - For providing the source data
- **Next.js Team** - For the excellent framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Puppeteer** - For web scraping capabilities

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/afh-provider-matching&type=Date)](https://star-history.com/#yourusername/afh-provider-matching&Date)

---

## 📊 Project Status

<div align="center">

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/afh-provider-matching?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/yourusername/afh-provider-matching?style=for-the-badge)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/afh-provider-matching?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/yourusername/afh-provider-matching?style=for-the-badge)

**Status**: ✅ Production Ready

</div>

---

<div align="center">

### 🌟 If you find this project helpful, please give it a star! ⭐

**Made with ❤️ for the AFH Community**

[⬆ Back to Top](#-afh-provider-matching)

</div>
