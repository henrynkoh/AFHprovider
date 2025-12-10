"use client";

import { AFHProvider } from "@/types";
import { useState } from "react";

interface ProviderTableProps {
  providers: AFHProvider[];
}

export default function ProviderTable({ providers }: ProviderTableProps) {
  const [sortField, setSortField] = useState<keyof AFHProvider | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  if (providers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          No providers found
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting your search criteria
        </p>
      </div>
    );
  }

  const handleSort = (field: keyof AFHProvider) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof AFHProvider }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto shadow-2xl rounded-2xl border border-gray-100" id="providers">
      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <tr>
              {[
                { key: "areaCity" as keyof AFHProvider, label: "Area/City" },
                { key: "businessName" as keyof AFHProvider, label: "Business Name" },
                { key: "providerName" as keyof AFHProvider, label: "Provider Name" },
                { key: "phoneNumber" as keyof AFHProvider, label: "Phone Number" },
                { key: "website" as keyof AFHProvider, label: "Website" },
                { key: "yearStarted" as keyof AFHProvider, label: "Year Started" },
                { key: "residentBeds" as keyof AFHProvider, label: "Resident Beds" },
                { key: "privatePayMedicaidRatio" as keyof AFHProvider, label: "Payment Ratio" },
                { key: "others" as keyof AFHProvider, label: "Additional Info" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedProviders.map((provider, index) => (
              <tr
                key={provider.id}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group cursor-pointer border-b border-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {provider.areaCity}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {provider.businessName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{provider.providerName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {provider.phoneNumber.startsWith("Contact") ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {provider.phoneNumber}
                    </span>
                  ) : (
                    <a
                      href={`tel:${provider.phoneNumber.replace(/[^\d+()-]/g, "")}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {provider.phoneNumber}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={`https://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {provider.website.includes("home-finder") ? "View on AFHC" : provider.website}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {provider.yearStarted > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {provider.yearStarted}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {provider.residentBeds > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {provider.residentBeds} beds
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {provider.privatePayMedicaidRatio}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                  <p className="line-clamp-2">{provider.others}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
