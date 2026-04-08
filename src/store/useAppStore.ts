import { Category, Listing } from "@/db/Types";
import { create } from "zustand";

interface AppState {
  // Map Instance
  mapInstance: any;
  setMapInstance: (instance: any) => void;

  // Data States
  listings: Listing[] | null;
  setListings: (listings: Listing[] | null) => void;
  categories: Category[] | null;
  setCategories: (categories: Category[] | null) => void;
  selectedCategories: Set<Category>;
  setSelectedCategories: (categories: Set<Category>) => void;
  savedListings: Listing[];
  setSavedListings: (listings: Listing[]) => void;

  // Selection States
  activeListing: Listing | null;
  setActiveListing: (listing: Listing | null) => void;
  closestListing: Listing | null;
  setClosestListing: (listing: Listing | null) => void;

  // UI Ephemeral States
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  isInfoWindowOpen: boolean;
  setIsInfoWindowOpen: (isOpen: boolean) => void;
  isAddListingOpen: boolean;
  setIsAddListingOpen: (isOpen: boolean) => void;
  isMapActive: boolean;
  setIsMapActive: (isActive: boolean) => void;

  // Navigation & Location
  activeNav: "nearme" | "explore" | "saved" | "curator";
  setActiveNav: (nav: "nearme" | "explore" | "saved" | "curator") => void;
  isPanelVisible: boolean;
  setIsPanelVisible: (isVisible: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;

  // New Global Architecture States
  viewMode: "RADAR" | "GRID" | "ORBIT";
  setViewMode: (mode: "RADAR" | "GRID" | "ORBIT") => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial states
  mapInstance: null,
  setMapInstance: (instance) => set({ mapInstance: instance }),

  listings: null,
  setListings: (listings) => set({ listings }),

  categories: null,
  setCategories: (categories) => set({ categories }),

  selectedCategories: new Set(),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),

  savedListings: [],
  setSavedListings: (savedListings) => set({ savedListings }),

  activeListing: null,
  setActiveListing: (activeListing) => set({ activeListing }),

  closestListing: null,
  setClosestListing: (closestListing) => set({ closestListing }),

  isDrawerOpen: false,
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

  isInfoWindowOpen: false,
  setIsInfoWindowOpen: (isInfoWindowOpen) => set({ isInfoWindowOpen }),

  isAddListingOpen: false,
  setIsAddListingOpen: (isAddListingOpen) => set({ isAddListingOpen }),

  isMapActive: true,
  setIsMapActive: (isMapActive) => set({ isMapActive }),

  activeNav: "nearme",
  setActiveNav: (activeNav) => set({ activeNav }),

  isPanelVisible: true,
  setIsPanelVisible: (isPanelVisible) => set({ isPanelVisible }),

  userLocation: null,
  setUserLocation: (userLocation) => set({ userLocation }),

  viewMode: "RADAR",
  setViewMode: (viewMode) => set({ viewMode }),
}));
