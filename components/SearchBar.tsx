"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto" id="search">
      <div className="relative group">
        {/* Animated background gradient */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
        
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center">
            {/* Search Icon */}
            <div className="pl-5 pr-3">
              <svg
                className={`h-6 w-6 transition-colors duration-200 ${
                  isFocused ? "text-blue-600" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            {/* Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search by business name, provider, city, phone, or any keyword..."
              className="flex-1 py-4 pr-5 text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
            />
            
            {/* Clear button */}
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Search suggestions/hints */}
      {!searchTerm && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <span className="text-xs text-gray-500">Try searching for:</span>
          {["Centralia", "Chehalis", "Olympia", "Medicaid", "Dementia"].map((hint) => (
            <button
              key={hint}
              onClick={() => onSearchChange(hint)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
            >
              {hint}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
