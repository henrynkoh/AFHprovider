import { NextResponse } from "next/server";
import { sampleProviders } from "@/data/sampleData";
import { readFileSync } from "fs";
import { join } from "path";
import { AFHProvider } from "@/types";

// API route to get all providers
// Loads from allProviders.json if available, otherwise uses sample data
function loadAllProviders(): AFHProvider[] {
  try {
    const filePath = join(process.cwd(), "data", "allProviders.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const providers = JSON.parse(fileContent);
    // If JSON file is empty array, use sample data
    if (Array.isArray(providers) && providers.length > 0) {
      return providers;
    }
    return sampleProviders;
  } catch (error) {
    // If file doesn't exist or has error, use sample data
    console.log("Using sample data - allProviders.json not found or empty");
    return sampleProviders;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";

    // Load all providers (from JSON file or sample data)
    let providers = loadAllProviders();
    
    console.log(`Loaded ${providers.length} providers from data file`);

    // Apply search filter if provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      providers = providers.filter(
        (provider) =>
          provider.businessName.toLowerCase().includes(lowerSearch) ||
          provider.providerName.toLowerCase().includes(lowerSearch) ||
          provider.areaCity.toLowerCase().includes(lowerSearch) ||
          provider.phoneNumber.includes(search) ||
          provider.website.toLowerCase().includes(lowerSearch) ||
          provider.others.toLowerCase().includes(lowerSearch)
      );
    }

    // If limit is very high (like 10000), return all providers without pagination
    let paginatedProviders;
    if (limit >= providers.length) {
      paginatedProviders = providers;
    } else {
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedProviders = providers.slice(startIndex, endIndex);
    }

    return NextResponse.json({
      providers: paginatedProviders,
      total: providers.length,
      page,
      limit,
      totalPages: Math.ceil(providers.length / limit),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

