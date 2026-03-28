import { cache } from "react";

export interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  url: string;
  // Optional additional fields
  canonical?: string;
  locale?: string;
  site_name?: string;
  image_x?: number;
  image_y?: number;
  image_size?: number;
  image_type?: string;
  icon?: string;
  icon_x?: number;
  icon_y?: number;
  icon_size?: number;
  icon_type?: string;
}

const LINKPREVIEW_API_URL = "https://api.linkpreview.net";
const API_KEY = process.env.LINKPREVIEW_API_KEY;

if (!API_KEY) {
  console.warn(
    "LINKPREVIEW_API_KEY not found in environment variables",
  );
}

const fetcher = cache(async (url: string): Promise<LinkPreviewData> => {
  if (!API_KEY) {
    throw new Error("LinkPreview API key not configured");
  }

  const response = await fetch(
    `${LINKPREVIEW_API_URL}?q=${encodeURIComponent(url)}`,
    {
      headers: {
        "X-Linkpreview-Api-Key": API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`LinkPreview API error: ${response.status}`);
  }

  const data = await response.json();

  // Check for API errors
  if (data.error) {
    throw new Error(`LinkPreview API error: ${data.error}`);
  }

  return data;
});

// Server-side function for direct fetching with caching
export const fetchLinkPreview = cache(
  async (url: string): Promise<LinkPreviewData | null> => {
    try {
      return await fetcher(url);
    } catch (error) {
      console.error("Failed to fetch link preview:", error);
      return null;
    }
  },
);
