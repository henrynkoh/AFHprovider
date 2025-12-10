"use client";

import { useState } from "react";
import { caseStudies, CaseStudy } from "@/data/caseStudies";

export default function CaseStudies() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const displayedCases = isExpanded ? caseStudies : caseStudies.slice(0, 6);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    teal: "from-teal-500 to-teal-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    cyan: "from-cyan-500 to-cyan-600",
    amber: "from-amber-500 to-amber-600",
  };

  const bgColorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    green: "bg-green-50 border-green-200",
    indigo: "bg-indigo-50 border-indigo-200",
    pink: "bg-pink-50 border-pink-200",
    teal: "bg-teal-50 border-teal-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
    cyan: "bg-cyan-50 border-cyan-200",
    amber: "bg-amber-50 border-amber-200",
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="px-6 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-bold shadow-md">
              ⭐ Real Success Stories
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Top 10 Case Studies
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
            See how AFH Provider Matching streamlines the search process and helps make perfect matches
          </p>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Real stories from users who found providers faster, made better connections, and achieved their goals
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedCases.map((caseStudy, index) => (
            <div
              key={caseStudy.id}
              className={`group relative bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${colorClasses[caseStudy.color as keyof typeof colorClasses]}`}></div>

              {/* Content */}
              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`text-4xl flex-shrink-0`}>
                    {caseStudy.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {caseStudy.title}
                    </h3>
                  </div>
                </div>

                {/* Scenario */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {caseStudy.scenario}
                </p>

                {/* Metrics */}
                <div className={`${bgColorClasses[caseStudy.color as keyof typeof bgColorClasses]} rounded-xl p-4 mb-4 border`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Time Saved</div>
                      <div className="text-lg font-bold text-gray-900">{caseStudy.metrics.timeSaved}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Found</div>
                      <div className="text-lg font-bold text-gray-900">{caseStudy.metrics.providersFound} Providers</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Matches</div>
                      <div className="text-lg font-bold text-gray-900">{caseStudy.metrics.matchesMade}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Success</div>
                      <div className="text-lg font-bold text-green-600">{caseStudy.metrics.successRate}</div>
                    </div>
                  </div>
                </div>

                {/* Provider Example */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Example Provider</div>
                  <div className="text-sm font-semibold text-gray-900">{caseStudy.providerExample.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {caseStudy.providerExample.location} • {caseStudy.providerExample.specialty}
                  </div>
                </div>

                {/* Result Preview */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Result</div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {caseStudy.result}
                  </p>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => {
                    const actualIndex = isExpanded ? index : caseStudies.findIndex(c => c.id === caseStudy.id);
                    setSelectedCase(actualIndex);
                  }}
                  className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Read Full Story →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {!isExpanded && (
          <div className="text-center">
            <button
              onClick={() => setIsExpanded(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              View All 10 Case Studies ↓
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="text-center">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-8 py-4 bg-gray-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Show Less ↑
            </button>
          </div>
        )}

        {/* Detailed Modal/Expanded View */}
        {selectedCase !== null && selectedCase >= 0 && selectedCase < caseStudies.length && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-3 bg-gradient-to-r ${colorClasses[caseStudies[selectedCase].color as keyof typeof colorClasses]}`}></div>
              <div className="p-8">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCase(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Header */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-5xl">{caseStudies[selectedCase].icon}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {caseStudies[selectedCase].title}
                    </h3>
                  </div>
                </div>

                {/* Scenario */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Scenario</h4>
                  <p className="text-gray-700 leading-relaxed">{caseStudies[selectedCase].scenario}</p>
                </div>

                {/* Challenge */}
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2">Challenge</h4>
                  <p className="text-gray-700 leading-relaxed">{caseStudies[selectedCase].challenge}</p>
                </div>

                {/* Solution */}
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-2">Solution</h4>
                  <p className="text-gray-700 leading-relaxed">{caseStudies[selectedCase].solution}</p>
                </div>

                {/* Result */}
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">Result</h4>
                  <p className="text-gray-700 leading-relaxed">{caseStudies[selectedCase].result}</p>
                </div>

                {/* Metrics Grid */}
                <div className={`${bgColorClasses[caseStudies[selectedCase].color as keyof typeof bgColorClasses]} rounded-xl p-6 mb-6 border-2`}>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {caseStudies[selectedCase].metrics.timeSaved}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Time Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {caseStudies[selectedCase].metrics.providersFound}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Providers Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {caseStudies[selectedCase].metrics.matchesMade}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Matches Made</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {caseStudies[selectedCase].metrics.successRate}
                      </div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Provider Example */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Example Provider</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Name:</span>
                      <span className="ml-2 text-lg font-bold text-gray-900">{caseStudies[selectedCase].providerExample.name}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Location:</span>
                      <span className="ml-2 text-gray-900">{caseStudies[selectedCase].providerExample.location}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Specialty:</span>
                      <span className="ml-2 text-gray-900">{caseStudies[selectedCase].providerExample.specialty}</span>
                    </div>
                    {caseStudies[selectedCase].providerExample.beds > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-gray-600">Beds:</span>
                        <span className="ml-2 text-gray-900">{caseStudies[selectedCase].providerExample.beds}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Combined Impact</h3>
            <p className="text-xl text-blue-100">Across all 10 case studies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">93%</div>
              <div className="text-sm md:text-base text-blue-100">Average Time Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">720+</div>
              <div className="text-sm md:text-base text-blue-100">Providers Found</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">30+</div>
              <div className="text-sm md:text-base text-blue-100">Successful Matches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <div className="text-sm md:text-base text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

