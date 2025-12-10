"use client";

import { useState, useMemo, useEffect } from "react";
import NavBar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import ProviderTable from "@/components/ProviderTable";
import { sampleProviders } from "@/data/sampleData";
import { AFHProvider } from "@/types";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProviders, setAllProviders] = useState<AFHProvider[]>(sampleProviders);
  const [loading, setLoading] = useState(false);

  // Try to load from API (which loads from allProviders.json if available)
  useEffect(() => {
    const loadProviders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/providers?limit=10000');
        if (response.ok) {
          const data = await response.json();
          console.log(`Loaded ${data.total} total providers, showing ${data.providers.length}`);
          if (data.providers && data.providers.length > 0) {
            setAllProviders(data.providers);
          } else {
            console.log("No providers in response, using sample data");
          }
        } else {
          console.error("API response not OK:", response.status);
        }
      } catch (error) {
        // Use sample data if API fails
        console.error("Error loading providers:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    if (!searchTerm.trim()) {
      return allProviders;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return allProviders.filter(
      (provider) =>
        provider.businessName.toLowerCase().includes(lowerSearchTerm) ||
        provider.providerName.toLowerCase().includes(lowerSearchTerm) ||
        provider.areaCity.toLowerCase().includes(lowerSearchTerm) ||
        provider.phoneNumber.includes(searchTerm) ||
        provider.website.toLowerCase().includes(lowerSearchTerm) ||
        provider.others.toLowerCase().includes(lowerSearchTerm)
    );
  }, [allProviders, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const cities = new Set(allProviders.map(p => p.areaCity.split(',')[0]));
    const withPhones = allProviders.filter(p => !p.phoneNumber.startsWith("Contact")).length;
    return {
      total: allProviders.length,
      cities: cities.size,
      withPhones,
    };
  }, [allProviders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <NavBar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-block mb-6 animate-fade-in">
              <span className="px-6 py-3 bg-white/80 backdrop-blur-sm text-blue-800 rounded-full text-sm font-bold shadow-lg border border-blue-200 hover:shadow-xl transition-shadow duration-300">
                🏠 Adult Family Home Matching Platform
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in-up">
              AFH Provider Matching
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-gray-800 mb-4 font-semibold max-w-3xl mx-auto leading-relaxed">
              Connect potential homes with experienced providers
            </p>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Serving <span className="font-bold text-blue-600 text-2xl">Centralia, WA</span> and surrounding communities
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Real-time Data</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Comprehensive Database</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    stats.total.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Total Providers
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    stats.cities
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  Cities Covered
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl font-bold text-pink-600 mb-2">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    stats.withPhones.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                  With Contact Info
                </div>
              </div>
            </div>

            {/* Data Source */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-flex border border-gray-200">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Data sourced from</span>
              <a
                href="https://adultfamilyhomecouncil.org/home-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors"
              >
                Adult Family Home Council of Washington State
              </a>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-12" id="search">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          {/* Results Section */}
          <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-2xl px-8 py-4 shadow-xl border border-gray-100">
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    filteredProviders.length.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  {filteredProviders.length === 1 ? "Provider Found" : "Providers Found"}
                </div>
              </div>
              {searchTerm && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl px-6 py-4 border border-blue-200 shadow-lg">
                  <div className="text-sm text-gray-700 font-medium">
                    Filtered by: <span className="font-bold text-blue-600">"{searchTerm}"</span>
                  </div>
                </div>
              )}
            </div>
            
            {!loading && (
              <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200">
                Showing <span className="font-bold text-blue-600">{filteredProviders.length}</span> of{" "}
                <span className="font-bold">{allProviders.length.toLocaleString()}</span> total providers
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
              <p className="text-gray-700 font-semibold text-lg">Loading providers...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest data</p>
            </div>
          )}

          {/* Provider Table */}
          {!loading && (
            <div id="providers">
              <ProviderTable providers={filteredProviders} />
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-12 pb-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  AFH Provider Matching
                </h3>
                <p className="text-gray-600">Connecting homes with providers in Centralia, WA</p>
              </div>
              <div className="text-sm text-gray-500 space-y-2">
                <p>© {new Date().getFullYear()} AFH Provider Matching Platform</p>
                <p>
                  Data provided by{" "}
                  <a
                    href="https://adultfamilyhomecouncil.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                  >
                    Adult Family Home Council of Washington State
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
