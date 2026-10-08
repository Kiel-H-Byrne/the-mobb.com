import { Category, Listing } from '@/db/Types';
import { create } from 'zustand';

interface AppState {
  // Map Data
  mapInstance: any | null;
  setMapInstance: (instance: any) => void;
  listings: Listing[] | null;
  setListings: (listings: Listing[] | null) => void;
  categories: Category[] | null;
  setCategories: (categories: Category[] | null) => void;

  // UI & Interaction
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
  isInfoWindowOpen: boolean;
  setIsInfoWindowOpen: (isOpen: boolean) => void;
  activeListing: Listing | null;
  setActiveListing: (listing: Listing | null) => void;
  
  // Sets in Zustand need special handling if mutated, we'll store as Array for simplicity or replace entire Set
  selectedCategories: Set<Category>;
  setSelectedCategories: (categories: Set<Category>) => void;
  
  isAddListingOpen: boolean;
  setIsAddListingOpen: (isOpen: boolean) => void;
  savedListings: Listing[];
  setSavedListings: (listings: Listing[]) => void;

  // Radar State
  isMapActive: boolean;
  setIsMapActive: (isActive: boolean) => void;

  // Navigation & Location
  activeNav: "nearme" | "explore" | "saved";
  setActiveNav: (nav: "nearme" | "explore" | "saved") => void;
  isPanelVisible: boolean;
  setIsPanelVisible: (isVisible: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  // New Global Architecture States
  viewMode: "RADAR" | "GRID" | "ORBIT";
  setViewMode: (mode: "RADAR" | "GRID" | "ORBIT") => void;

  // Registered User Auth State
  currentUser: { id: string; email: string; name?: string; role?: string } | null;
  setCurrentUser: (user: { id: string; email: string; name?: string; role?: string } | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalSuccessCallback: (() => void) | null;
  setAuthModalSuccessCallback: (cb: (() => void) | null) => void;

  // Crowdsourced Report Modal State
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  reportingListing: Listing | null;
  setReportingListing: (listing: Listing | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mapInstance: null,
  setMapInstance: (instance) => set({ mapInstance: instance }),
  
  listings: null,
  setListings: (listings) => set({ listings }),
  
  categories: null,
  setCategories: (categories) => set({ categories }),

  isDrawerOpen: false,
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

  isInfoWindowOpen: false,
  setIsInfoWindowOpen: (isInfoWindowOpen) => set({ isInfoWindowOpen }),

  activeListing: null,
  setActiveListing: (activeListing) => set({ activeListing }),

  selectedCategories: new Set(),
  setSelectedCategories: (selectedCategories) => set({ selectedCategories }),

  isAddListingOpen: false,
  setIsAddListingOpen: (isAddListingOpen) => set({ isAddListingOpen }),

  savedListings: [],
  setSavedListings: (savedListings) => set({ savedListings }),

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

  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  authModalSuccessCallback: null,
  setAuthModalSuccessCallback: (authModalSuccessCallback) => set({ authModalSuccessCallback }),

  isReportModalOpen: false,
  setIsReportModalOpen: (isReportModalOpen) => set({ isReportModalOpen }),
  reportingListing: null,
  setReportingListing: (reportingListing) => set({ reportingListing }),
}));
