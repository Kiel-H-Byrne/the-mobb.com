"use client";

import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { toaster } from "@/components/ui/Toast";
import { PendingListing } from "@/db/Types";
import {
  approveListing,
  autoFindPendingListingAddress,
  batchClearAndAutoFindListings,
  clearPendingListingGeolocation,
  deleteMultiplePendingListings,
  getPendingListings,
  getWeeklyApprovedStats,
  loginAdmin,
  logoutAdmin,
  manuallyRunScout,
  rejectListing,
  rejectMultipleListings,
  sanitizePendingListings,
  updatePendingListing,
} from "@app/actions/admin";
import { css } from "@styled/css";
import { APIProvider } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const toAddressString = (address?: PendingListing["address"]) => {
  if (Array.isArray(address)) {
    return address.filter(Boolean).join(", ");
  }

  return address || "";
};

const getLocationsToRender = (listing: PendingListing) => {
  if (listing.locations && listing.locations.length > 0) {
    return listing.locations;
  }
  const fallbackAddress = toAddressString(listing.address);
  if (fallbackAddress) {
    const isMock = ["n/a", "geocoded"].includes(fallbackAddress.toLowerCase().trim());
    if (!isMock || (listing.lat && listing.lng)) {
      return [{ address: fallbackAddress, lat: listing.lat, lng: listing.lng }];
    }
  }
  return [];
};

const buildGoogleMapsSearchUrl = (listing: PendingListing) => {
  const locs = getLocationsToRender(listing);
  const addressParam = locs.length > 0 ? locs[0].address : "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([listing.name, addressParam].filter(Boolean).join(" "))}`;
};

const buildGoogleSearchUrl = (listing: PendingListing) => {
  const locs = getLocationsToRender(listing);
  const addressParam = locs.length > 0 ? locs[0].address : "";
  return `https://www.google.com/search?q=${encodeURIComponent([listing.name, addressParam, listing.website].filter(Boolean).join(" "))}`;
};

export default function AdminReviewsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [listings, setListings] = useState<PendingListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<PendingListing | null>(
    null,
  );
  const [stats, setStats] = useState<{ total: number; aiScanned: number; manual: number; startOfWeek: Date } | undefined>();
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    async function init() {
      const res = await getPendingListings();
      if (res.success) {
        setIsLoggedIn(true);
        setListings(res.data || []);

        const statsRes = await getWeeklyApprovedStats();
        if (statsRes.success) setStats(statsRes.data);
      } else if (res.error === "Unauthorized") {
        setIsLoggedIn(false);
      }
    }
    init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await loginAdmin(password);
    if (res.success) {
      setIsLoggedIn(true);
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);

      const statsRes = await getWeeklyApprovedStats();
      if (statsRes.success) setStats(statsRes.data);
    } else {
      setLoginError(res.error || "Login failed");
    }
  };

  const openEditor = (listing: PendingListing) => {
    setEditingListing(listing);
    setIsEditDrawerOpen(true);
  };

  const handleApprove = async (l: PendingListing) => {
    setIsLoading(true);
    const res = await approveListing(l._id, l);
    if (res.success) {
      setListings((prev) => prev.filter((item) => item._id !== l._id));
      const statsRes = await getWeeklyApprovedStats();
      if (statsRes.success) setStats(statsRes.data);
    } else {
      toaster.create({ title: "Error approving listing", type: "error" });
    }
    setIsLoading(false);
  };

  const handleReject = async (id: string) => {
    setIsLoading(true);
    const res = await rejectListing(id);
    if (res.success) {
      setListings((prev) => prev.filter((item) => item._id !== id));
    } else {
      toaster.create({ title: "Error rejecting listing", type: "error" });
    }
    setIsLoading(false);
  };

  const handleEditSave = async (updatedData: any) => {
    if (!editingListing) return;
    setIsLoading(true);
    const res = await updatePendingListing(editingListing._id, updatedData);
    if (res.success) {
      setListings((prev) =>
        prev.map((item) => {
          if (item._id === editingListing._id) {
            return { ...item, ...updatedData };
          }
          return item;
        }),
      );
    } else {
      toaster.create({ title: "Error updating listing", type: "error" });
      throw new Error("Update failed");
    }
    setIsLoading(false);
  };

  const handleAutoFind = async (l: PendingListing) => {
    setIsLoading(true);
    const res = await autoFindPendingListingAddress(l._id as string);
    if (!res.success || !res.found) {
      toaster.create({ title: "No Google Places address found", type: "error" });
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    } else {
      toaster.create({ title: "Address auto-filled successfully", type: "success" });
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    }
    setIsLoading(false);
  };

  const handleClearGeocode = async (l: PendingListing) => {
    setIsLoading(true);
    const res = await clearPendingListingGeolocation(l._id as string);
    if (res.success) {
      toaster.create({ title: "Geocode cleared successfully", type: "success" });
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    } else {
      toaster.create({ title: "Error clearing geocode", type: "error" });
    }
    setIsLoading(false);
  };

  const handleRunScout = async () => {
    setIsLoading(true);
    toaster.create({
      title: "Scout cron started. Gathering new businesses...",
      type: "info",
    });
    const res = await manuallyRunScout();
    if (res?.success) {
      toaster.create({
        title: `Scout complete! Successfully scanned ${res.processed?.length || 0} links.`,
        type: "success",
      });
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    } else {
      toaster.create({
        title: `Scout failed: ${res?.error || "Unknown error"}`,
        type: "error",
      });
    }
    setIsLoading(false);
  };

  const handleBatchReject = async () => {
    if (selectedListingIds.length === 0) return;
    if (!confirm(`Are you sure you want to reject ${selectedListingIds.length} listings?`)) return;

    setIsLoading(true);
    const res = await rejectMultipleListings(selectedListingIds);
    if (res.success) {
      setListings((prev) => prev.filter((item) => !selectedListingIds.includes(item._id)));
      setSelectedListingIds([]);
      toaster.create({ title: `Batch rejected ${selectedListingIds.length} listings`, type: "success" });
    } else {
      toaster.create({ title: "Error rejected listings in batch", type: "error" });
    }
    setIsLoading(false);
  };

  const handleBatchDelete = async () => {
    if (selectedListingIds.length === 0) return;
    if (!confirm(`PERMANENTLY DELETE ${selectedListingIds.length} listings from the database? This cannot be undone.`)) return;

    setIsLoading(true);
    const res = await deleteMultiplePendingListings(selectedListingIds);
    if (res.success) {
      setListings((prev) => prev.filter((item) => !selectedListingIds.includes(item._id)));
      setSelectedListingIds([]);
      toaster.create({ title: `Permanently deleted ${selectedListingIds.length} listings`, type: "success" });
    } else {
      toaster.create({ title: "Error deleting listings in batch", type: "error" });
    }
    setIsLoading(false);
  };

  const handleBatchAutoFind = async () => {
    if (selectedListingIds.length === 0) return;
    setIsLoading(true);
    toaster.create({ title: `Processing ${selectedListingIds.length} listings...`, type: "info" });

    const res = await batchClearAndAutoFindListings(selectedListingIds);
    if (res.success) {
      toaster.create({
        title: `Batch auto-find complete. Success: ${res.successCount ?? 0}, Failed: ${res.failedCount ?? 0}`,
        type: (res.successCount ?? 0) > 0 ? "success" : "error"
      });
      setSelectedListingIds([]);
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    } else {
      toaster.create({ title: "Error during batch auto-find", type: "error" });
    }
    setIsLoading(false);
  };

  const handleSanitize = async () => {
    setIsLoading(true);
    const res = await sanitizePendingListings();
    if (res.success) {
      toaster.create({
        title: `Database Repair Complete! Recovered ${res.count} orphaned listings.`,
        type: "success"
      });
      const dataRes = await getPendingListings();
      if (dataRes.success) setListings(dataRes.data || []);
    } else {
      toaster.create({ title: "Error during database repair", type: "error" });
    }
    setIsLoading(false);
  };

  const toggleSelectAll = () => {
    if (selectedListingIds.length === listings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(listings.map((l) => String(l._id)));
    }
  };

  const groupedListings = useMemo(() => {
    const groups = {
      noData: [] as PendingListing[],
      noPlaces: [] as PendingListing[],
      partialAddress: [] as PendingListing[],
      autoFound: [] as PendingListing[],
      ready: [] as PendingListing[],
    };

    listings.forEach((l) => {
      const addr = toAddressString(l.address);
      const isNoData = !l.website || !addr || addr.trim().length === 0;
      if (isNoData) {
        groups.noData.push(l);
        return;
      }

      const isAutoFound = l.google_search_attempted && l.google_search_found && !l.google_id;
      if (isAutoFound) {
        groups.autoFound.push(l);
        return;
      }

      const isNoPlaces = l.google_search_attempted && !l.google_id;
      if (isNoPlaces) {
        groups.noPlaces.push(l);
        return;
      }

      const isPartial = !/\d/.test(addr) && !l.lat;
      if (isPartial) {
        groups.partialAddress.push(l);
        return;
      }

      groups.ready.push(l);
    });

    return groups;
  }, [listings]);

  if (isLoggedIn === null)
    return <div className={css({ p: "10" })}>Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div
        className={css({
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bg: "bg.canvas",
        })}
      >
        <form
          onSubmit={handleLogin}
          className={css({
            bg: "bg.surface",
            p: "8",
            borderRadius: "md",
            boxShadow: "md",
            display: "flex",
            flexDirection: "column",
            gap: "4",
            minWidth: "300px",
          })}
        >
          <h1
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              textAlign: "center",
              mb: "4",
              color: "text.main",
            })}
          >
            Admin Login
          </h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={css({
              p: "2",
              border: "1px solid",
              borderColor: "border.light",
              borderRadius: "md",
              bg: "bg.canvas",
              color: "text.main",
            })}
          />
          <button
            type="submit"
            className={css({
              bg: "brand.orange",
              color: "white",
              p: "2",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
            })}
          >
            Login
          </button>
          {loginError && (
            <p
              className={css({
                color: "red.500",
                fontSize: "sm",
                textAlign: "center",
              })}
            >
              {loginError}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div
      className={css({
        minHeight: "100vh",
        bg: "bg.canvas",
        p: "4",
        md: { p: "8" },
      })}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          mb: "8",
          alignItems: "center",
          gap: "4",
          flexWrap: "wrap",
        })}
      >
        <div>
          <h1
            className={css({
              fontSize: "3xl",
              fontWeight: "bold",
              color: "text.main",
            })}
          >
            Review Pending Listings
          </h1>
          <p className={css({ color: "text.muted", fontSize: "sm", mt: "1" })}>
            Quick workflow: open edit, search Google Places, capture details, or
            mark the listing as online only.
          </p>
          {stats && (
            <div
              className={css({
                mt: "4",
                display: "flex",
                gap: "4",
                alignItems: "center",
              })}
            >
              <div
                className={css({
                  bg: "bg.surface",
                  p: "3",
                  borderRadius: "md",
                  border: "1px solid",
                  borderColor: "border.light",
                })}
              >
                <span
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    display: "block",
                  })}
                >
                  Weekly Approved (AI)
                </span>
                <span
                  className={css({
                    fontSize: "xl",
                    fontWeight: "bold",
                    color: "blue.500",
                  })}
                >
                  {stats.aiScanned}
                </span>
              </div>
              <div
                className={css({
                  bg: "bg.surface",
                  p: "3",
                  borderRadius: "md",
                  border: "1px solid",
                  borderColor: "border.light",
                })}
              >
                <span
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    display: "block",
                  })}
                >
                  Weekly Approved (Manual)
                </span>
                <span
                  className={css({
                    fontSize: "xl",
                    fontWeight: "bold",
                    color: "green.500",
                  })}
                >
                  {stats.manual}
                </span>
              </div>
              <div
                className={css({
                  bg: "bg.surface",
                  p: "3",
                  borderRadius: "md",
                  border: "1px solid",
                  borderColor: "border.light",
                })}
              >
                <span
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    display: "block",
                  })}
                >
                  Total
                </span>
                <span
                  className={css({
                    fontSize: "xl",
                    fontWeight: "bold",
                    color: "text.main",
                  })}
                >
                  {stats.total}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}>
          <Link
            href="/admin/migrate"
            className={css({
              bg: "purple.500",
              color: "white",
              p: "2 4",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              _hover: { bg: "purple.600" },
            })}
          >
            Database Migrations
          </Link>
          <Link
            href="/"
            className={css({
              bg: "brand.orange",
              color: "white",
              p: "2 4",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              _hover: { bg: "orange.600" },
            })}
          >
            Preview Map
          </Link>
          <button
            disabled={isLoading}
            onClick={handleSanitize}
            className={css({
              bg: "gray.700",
              color: "white",
              p: "2 4",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
              _hover: { bg: "gray.800" },
              opacity: isLoading ? 0.7 : 1,
            })}
          >
            {isLoading ? "Running..." : "Repair Database"}
          </button>
          <button
            disabled={isLoading}
            onClick={handleRunScout}
            className={css({
              bg: "blue.500",
              color: "white",
              p: "2 4",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
              _hover: { bg: "blue.600" },
              opacity: isLoading ? 0.7 : 1,
            })}
          >
            {isLoading ? "Running..." : "Gather Businesses"}
          </button>
          <button
            onClick={async () => {
              await logoutAdmin();
              setIsLoggedIn(false);
            }}
            className={css({
              bg: "bg.surface",
              color: "text.main",
              p: "2 4",
              borderRadius: "md",
              fontWeight: "bold",
              cursor: "pointer",
            })}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        className={css({ display: "flex", flexDirection: "column", gap: "4" })}
      >
        {selectedListingIds.length > 0 && (
          <div
            className={css({
              position: "sticky",
              top: "4",
              zIndex: 10,
              bg: "bg.surface",
              p: "4",
              borderRadius: "md",
              boxShadow: "lg",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "2px solid",
              borderColor: "brand.orange",
            })}
          >
            <div
              className={css({ display: "flex", gap: "4", alignItems: "center" })}
            >
              <input
                type="checkbox"
                checked={selectedListingIds.length === listings.length}
                onChange={toggleSelectAll}
                className={css({
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                })}
              />
              <span className={css({ fontWeight: "bold" })}>
                {selectedListingIds.length} listings selected
              </span>
            </div>
            <div className={css({ display: "flex", gap: "2" })}>
              <button
                onClick={() => setSelectedListingIds([])}
                className={css({
                  color: "text.muted",
                  cursor: "pointer",
                  p: "2 4",
                  _hover: { color: "text.main" },
                })}
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                onClick={handleBatchAutoFind}
                className={css({
                  bg: "blue.500",
                  color: "white",
                  p: "2 6",
                  borderRadius: "md",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: { bg: "blue.600" },
                  opacity: isLoading ? 0.7 : 1,
                })}
              >
                {isLoading ? "Processing..." : "Batch Auto-Find"}
              </button>
              <button
                disabled={isLoading}
                onClick={handleBatchReject}
                className={css({
                  bg: "red.500",
                  color: "white",
                  p: "2 6",
                  borderRadius: "md",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: { bg: "red.600" },
                  opacity: isLoading ? 0.7 : 1,
                })}
              >
                {isLoading ? "Processing..." : "Batch Reject"}
              </button>
              <button
                disabled={isLoading}
                onClick={handleBatchDelete}
                className={css({
                  bg: "bg.canvas",
                  color: "red.600",
                  p: "2 4",
                  border: "1px solid",
                  borderColor: "red.200",
                  borderRadius: "md",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: { bg: "red.50" },
                  opacity: isLoading ? 0.7 : 1,
                })}
              >
                Batch Delete
              </button>
            </div>
          </div>
        )}

        {listings.length > 0 && (
          <div
            className={css({
              display: "flex",
              gap: "3",
              bg: "bg.surface",
              p: "3",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "border.light",
              flexWrap: "wrap",
              alignItems: "center",
            })}
          >
            <span className={css({ fontSize: "sm", fontWeight: "bold", mr: "2" })}>
              Quick Jump:
            </span>
            {Object.entries(groupedListings).map(([key, groupList]) => {
              if (groupList.length === 0) return null;
              const labels: Record<string, string> = {
                noData: "Missing Data",
                noPlaces: "Search Failed",
                partialAddress: "Partial",
                autoFound: "Auto-Found",
                ready: "Ready",
              };
              const colors: Record<string, string> = {
                noData: "red.500",
                noPlaces: "orange.500",
                partialAddress: "yellow.600",
                autoFound: "blue.500",
                ready: "green.600",
              };
              return (
                <a
                  key={key}
                  href={`#section-${key}`}
                  className={css({
                    fontSize: "xs",
                    bg: "bg.canvas",
                    p: "1 3",
                    borderRadius: "full",
                    color: colors[key] || "text.main",
                    fontWeight: "bold",
                    textDecoration: "none",
                    border: "1px solid",
                    borderColor: "border.light",
                    _hover: { bg: "bg.surface" },
                  })}
                >
                  {labels[key]} ({groupList.length})
                </a>
              );
            })}
            <div className={css({ ml: "auto", display: "flex", gap: "2" })}>
              <button
                onClick={() =>
                  setCollapsedSections(
                    Object.keys(groupedListings).reduce(
                      (acc, k) => ({ ...acc, [k]: true }),
                      {},
                    ),
                  )
                }
                className={css({ fontSize: "xs", color: "text.muted" })}
              >
                Collapse All
              </button>
              <button
                onClick={() => setCollapsedSections({})}
                className={css({ fontSize: "xs", color: "text.muted" })}
              >
                Expand All
              </button>
            </div>
          </div>
        )}

        {listings.length === 0 ? (
          <div
            className={css({
              p: "8",
              bg: "bg.surface",
              borderRadius: "md",
              textAlign: "center",
              color: "text.muted",
            })}
          >
            No listings pending review.
          </div>
        ) : (
          Object.entries(groupedListings).map(([key, groupList]) => {
            if (groupList.length === 0) return null;

            let title = "Ready for Review";
            let color = "green.600";
            let description =
              "These listings have complete data and are ready for approval.";

            if (key === "noData") {
              title = "Missing Core Data";
              color = "red.500";
              description = "Listings missing a website or physical address.";
            } else if (key === "noPlaces") {
              title = "Google Search Failed";
              color = "orange.500";
              description =
                "Google Places couldn't find a match for these businesses.";
            } else if (key === "partialAddress") {
              title = "Partial Address";
              color = "yellow.600";
              description =
                "These listings only have a city/state and need a full street address.";
            } else if (key === "autoFound") {
              title = "Auto-Found & Pending Verification";
              color = "blue.500";
              description = "Google Places successfully found an address for these. Please perform a final review.";
            }

            return (
              <div
                key={key}
                id={`section-${key}`}
                className={css({
                  mb: "6",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4",
                })}
              >
                <button
                  onClick={() => toggleSection(key)}
                  className={css({
                    borderBottom: "2px solid",
                    borderColor: color,
                    pb: "2",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    bg: "transparent",
                    width: "100%",
                    textAlign: "left",
                    _hover: { opacity: 0.8 },
                  })}
                >
                  <div
                    className={css({
                      display: "flex",
                      flexDirection: "column",
                      gap: "1",
                    })}
                  >
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "3",
                      })}
                    >
                      <h2
                        className={css({
                          fontSize: "lg",
                          fontWeight: "bold",
                          color: color,
                          textTransform: "uppercase",
                          letterSpacing: "wider",
                        })}
                      >
                        {title}
                      </h2>
                      <span
                        className={css({
                          bg: color,
                          color: "white",
                          px: "2",
                          py: "0.5",
                          borderRadius: "full",
                          fontSize: "xs",
                          fontWeight: "bold",
                        })}
                      >
                        {groupList.length}
                      </span>
                    </div>
                    <p className={css({ fontSize: "xs", color: "text.muted" })}>
                      {description}
                    </p>
                  </div>
                  <div className={css({ color: color, fontSize: "xl" })}>
                    {collapsedSections[key] ? "⊕" : "⊖"}
                  </div>
                </button>

                {!collapsedSections[key] &&
                  groupList.map((l) => (
                    <div
                      key={String(l._id)}
                      className={css({
                        bg: "bg.surface",
                        p: "5",
                        md: { p: "6" },
                        borderRadius: "lg",
                        boxShadow: "sm",
                        display: "grid",
                        gap: "5",
                        border: "1px solid",
                        borderColor: "border.light",
                        overflow: "hidden",
                        maxWidth: "100%",
                      })}
                    >
                      <div
                        className={css({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "3",
                          flexWrap: "wrap",
                        })}
                      >
                        <div
                          className={css({
                            display: "flex",
                            gap: "4",
                            alignItems: "flex-start",
                            flex: "1",
                          })}
                        >
                          <input
                            type="checkbox"
                            checked={selectedListingIds.includes(String(l._id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedListingIds((prev) => [
                                  ...prev,
                                  String(l._id),
                                ]);
                              } else {
                                setSelectedListingIds((prev) =>
                                  prev.filter((id) => id !== String(l._id)),
                                );
                              }
                            }}
                            className={css({
                              mt: "2",
                              cursor: "pointer",
                              width: "18px",
                              height: "18px",
                            })}
                          />
                          <div
                            className={css({
                              flex: "1",
                              minWidth: "0",
                              maxWidth: "100%",
                            })}
                          >
                            <h2
                              className={css({
                                fontSize: "xl",
                                fontWeight: "bold",
                                color: "text.main",
                                wordBreak: "break-word",
                              })}
                            >
                              {l.name}
                            </h2>
                            <div
                              className={css({
                                display: "flex",
                                gap: "2",
                                mb: "2",
                                mt: "1",
                                flexWrap: "wrap",
                              })}
                            >
                              <span
                                className={css({
                                  bg: "bg.canvas",
                                  color: "text.main",
                                  px: "2",
                                  py: "1",
                                  borderRadius: "md",
                                  fontSize: "xs",
                                  fontWeight: "bold",
                                })}
                              >
                                {l.category}
                              </span>
                              <span
                                className={css({
                                  bg:
                                    l.source === "AI_SCAN"
                                      ? "blue.100"
                                      : "green.100",
                                  color:
                                    l.source === "AI_SCAN"
                                      ? "blue.800"
                                      : "green.800",
                                  px: "2",
                                  py: "1",
                                  borderRadius: "md",
                                  fontSize: "xs",
                                  fontWeight: "bold",
                                })}
                              >
                                {l.source}
                              </span>
                              {l.source === "AI_SCAN" && l.isBlackOwned && (
                                <span
                                  className={css({
                                    bg: "orange.100",
                                    color: "orange.800",
                                    px: "2",
                                    py: "1",
                                    borderRadius: "md",
                                    fontSize: "xs",
                                    fontWeight: "bold",
                                  })}
                                >
                                  AI Flagged: Black Owned
                                </span>
                              )}
                              {(() => {
                                const locationsToRender = getLocationsToRender(l);
                                const isMapReady =
                                  locationsToRender.length > 0 &&
                                  locationsToRender.every(
                                    (loc) => loc.lat && loc.lng,
                                  );
                                const hasAddress = locationsToRender.length > 0;

                                return (
                                  <span
                                    className={css({
                                      bg: l.isOnlineOnly
                                        ? "purple.100"
                                        : isMapReady
                                          ? "green.100"
                                          : "yellow.100",
                                      color: l.isOnlineOnly
                                        ? "purple.800"
                                        : isMapReady
                                          ? "green.800"
                                          : "yellow.800",
                                      px: "2",
                                      py: "1",
                                      borderRadius: "md",
                                      fontSize: "xs",
                                      fontWeight: "bold",
                                    })}
                                  >
                                    {l.isOnlineOnly
                                      ? "Online only"
                                      : isMapReady
                                        ? "Map ready"
                                        : hasAddress
                                          ? "Needs review"
                                          : "Needs address"}
                                  </span>
                                );
                              })()}
                              {(l.google_id || l.places_details) && (
                                <span
                                  className={css({
                                    bg: "indigo.100",
                                    color: "indigo.800",
                                    px: "2",
                                    py: "1",
                                    borderRadius: "md",
                                    fontSize: "xs",
                                    fontWeight: "bold",
                                  })}
                                >
                                  Google details captured
                                </span>
                              )}
                            </div>
                            <div
                              className={css({
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "2",
                                mt: "3",
                              })}
                            >
                              <button
                                disabled={isLoading}
                                onClick={() => openEditor(l)}
                                className={css({
                                  bg: "blue.500",
                                  color: "white",
                                  p: "2 3",
                                  borderRadius: "md",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                  fontSize: "sm",
                                  _hover: { bg: "blue.600" },
                                  opacity: isLoading ? 0.7 : 1,
                                })}
                              >
                                Edit Listing
                              </button>
                              <a
                                href={buildGoogleMapsSearchUrl(l)}
                                target="_blank"
                                rel="noreferrer"
                                className={css({
                                  bg: "bg.canvas",
                                  color: "text.main",
                                  p: "2 3",
                                  borderRadius: "md",
                                  fontWeight: "bold",
                                  textDecoration: "none",
                                  fontSize: "sm",
                                })}
                              >
                                Google Maps
                              </a>
                              <a
                                href={buildGoogleSearchUrl(l)}
                                target="_blank"
                                rel="noreferrer"
                                className={css({
                                  bg: "bg.canvas",
                                  color: "text.main",
                                  p: "2 3",
                                  borderRadius: "md",
                                  fontWeight: "bold",
                                  textDecoration: "none",
                                  fontSize: "sm",
                                })}
                              >
                                Web search
                              </a>
                              {l.website && (
                                <a
                                  href={l.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={css({
                                    bg: "bg.canvas",
                                    color: "text.main",
                                    p: "2 3",
                                    borderRadius: "md",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                    fontSize: "sm",
                                  })}
                                >
                                  Visit site
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={css({ display: "grid", gap: "2" })}>
                        <div
                          className={css({
                            fontSize: "sm",
                            color: "text.muted",
                            mb: "1",
                          })}
                        >
                          <strong>Address:</strong>{" "}
                          {getLocationsToRender(l).length > 0 ? (
                            getLocationsToRender(l).map((loc, idx) => (
                              <div
                                key={idx}
                                className={css({ ml: "4", mt: "1", mb: "1" })}
                              >
                                <button
                                  onClick={() => openEditor(l)}
                                  className={css({
                                    color: "blue.500",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    background: "transparent",
                                    border: "none",
                                    padding: "0",
                                    textAlign: "left",
                                  })}
                                >
                                  {loc.address}
                                </button>
                                {loc.lat && loc.lng ? (
                                  <>
                                    <span
                                      className={css({
                                        fontSize: "xs",
                                        color: "green.600",
                                        ml: "2",
                                      })}
                                    >
                                      (Geocoded)
                                    </span>
                                    <button
                                      disabled={isLoading}
                                      onClick={() => handleClearGeocode(l)}
                                      className={css({
                                        fontSize: "xs",
                                        color: "red.500",
                                        textDecoration: "underline",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        ml: "2",
                                        opacity: isLoading ? 0.7 : 1,
                                      })}
                                    >
                                      Clear Geocode
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={css({
                                        fontSize: "xs",
                                        color: "yellow.600",
                                        ml: "2",
                                      })}
                                    >
                                      (Needs geocoding)
                                    </span>
                                    {!l.google_search_attempted ? (
                                      <button
                                        disabled={isLoading}
                                        onClick={() => handleAutoFind(l)}
                                        className={css({
                                          fontSize: "xs",
                                          color: "blue.500",
                                          textDecoration: "underline",
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          ml: "2",
                                          opacity: isLoading ? 0.7 : 1,
                                        })}
                                      >
                                        Auto-find
                                      </button>
                                    ) : !l.google_search_found ? (
                                      <button
                                        disabled={isLoading}
                                        onClick={() => handleClearGeocode(l)}
                                        className={css({
                                          fontSize: "xs",
                                          color: "blue.500",
                                          textDecoration: "underline",
                                          background: "none",
                                          border: "none",
                                          cursor: "pointer",
                                          ml: "2",
                                          opacity: isLoading ? 0.7 : 1,
                                        })}
                                      >
                                        Reset Search
                                      </button>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            ))
                          ) : (
                            <div
                              className={css({
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "2",
                                alignItems: "center",
                                mt: "1",
                              })}
                            >
                              {l.google_search_attempted &&
                                !l.google_search_found ? (
                                <>
                                  <span
                                    className={css({
                                      color: "red.500",
                                      fontSize: "xs",
                                      fontWeight: "bold",
                                    })}
                                  >
                                    No Google Places address found.
                                  </span>
                                  <button
                                    disabled={isLoading}
                                    onClick={() => handleClearGeocode(l)}
                                    className={css({
                                      fontSize: "xs",
                                      color: "blue.500",
                                      textDecoration: "underline",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      opacity: isLoading ? 0.7 : 1,
                                    })}
                                  >
                                    Reset Search
                                  </button>
                                </>
                              ) : !l.google_search_found ? (
                                <button
                                  disabled={isLoading}
                                  onClick={() => handleAutoFind(l)}
                                  className={css({
                                    color: "blue.500",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    background: "transparent",
                                    border: "none",
                                    padding: "0",
                                    textAlign: "left",
                                    opacity: isLoading ? 0.7 : 1,
                                  })}
                                >
                                  Auto-find address with Google Places
                                </button>
                              ) : null}
                              {!l.google_search_found && (
                                <button
                                  onClick={() => openEditor(l)}
                                  className={css({
                                    color: "gray.500",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    background: "transparent",
                                    border: "none",
                                    padding: "0",
                                    textAlign: "left",
                                    fontSize: "xs",
                                  })}
                                >
                                  (or enter manually)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <p
                          className={css({
                            fontSize: "sm",
                            color: "text.muted",
                            mb: "1",
                            wordBreak: "break-word",
                          })}
                        >
                          <strong>Website:</strong>{" "}
                          {l.website ? (
                            <a
                              href={l.website}
                              target="_blank"
                              rel="noreferrer"
                              className={css({
                                color: "blue.500",
                                wordBreak: "break-all",
                              })}
                            >
                              {l.website}
                            </a>
                          ) : (
                            "None"
                          )}
                        </p>
                        {l.phone && (
                          <p
                            className={css({
                              fontSize: "sm",
                              color: "text.muted",
                              mb: "1",
                            })}
                          >
                            <strong>Phone:</strong> {l.phone}
                          </p>
                        )}
                        <p
                          className={css({
                            fontSize: "sm",
                            color: "text.muted",
                            mb: "1",
                          })}
                        >
                          <strong>Submitted:</strong>{" "}
                          {l.createdAt
                            ? new Date(l.createdAt).toLocaleString()
                            : "Unknown"}{" "}
                          | <strong>IP Address:</strong>{" "}
                          {(l as any).ipAddress || "Unknown"}
                        </p>
                        {l.description && (
                          <p
                            className={css({
                              fontSize: "sm",
                              color: "text.main",
                              mt: "2",
                              p: "2",
                              bg: "bg.canvas",
                              borderRadius: "md",
                              wordBreak: "break-word",
                            })}
                          >
                            {l.description}
                          </p>
                        )}
                      </div>

                      <div
                        className={css({
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "2",
                        })}
                      >
                        {(() => {
                          const locationsToRender = getLocationsToRender(l);
                          const hasCategory = l.category && l.category !== "Uncategorized";
                          const hasName = l.name && l.name.trim().length > 0;
                          const isOnline = l.isOnlineOnly;

                          const locationsValid = locationsToRender.length > 0 && locationsToRender.every(loc => {
                            const hasCoords = !!(loc.lat && loc.lng);
                            const hasStreetNumber = /\d/.test(loc.address || "");
                            return hasCoords && hasStreetNumber;
                          });

                          const isApprovable = hasName && hasCategory && (isOnline || locationsValid);

                          return (
                            <button
                              disabled={isLoading || !isApprovable}
                              onClick={() => handleApprove(l)}
                              title={!isApprovable ? "Criteria not met: Requires name, category, and geocoded street address (or Online Only)." : ""}
                              className={css({
                                bg: isApprovable ? "brand.orange" : "gray.400",
                                color: "white",
                                p: "2 4",
                                borderRadius: "md",
                                fontWeight: "bold",
                                cursor: isApprovable && !isLoading ? "pointer" : "not-allowed",
                                _hover: { bg: isApprovable ? "orange.600" : "gray.400" },
                                opacity: isLoading ? 0.7 : 1,
                              })}
                            >
                              Approve
                            </button>
                          );
                        })()}
                        <button
                          disabled={isLoading}
                          onClick={() => handleReject(l._id)}
                          className={css({
                            bg: "red.500",
                            color: "white",
                            p: "2 4",
                            borderRadius: "md",
                            fontWeight: "bold",
                            cursor: "pointer",
                            _hover: { bg: "red.600" },
                            opacity: isLoading ? 0.7 : 1,
                          })}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                {!collapsedSections[key] && groupList.length > 5 && (
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={css({
                      alignSelf: "center",
                      color: "text.muted",
                      fontSize: "xs",
                      mt: "2",
                      p: "2 4",
                      _hover: { color: color },
                    })}
                  >
                    Jump to Top ↑
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        libraries={["places", "geometry", "marker", "visualization"]}
      >
        <AddListingDrawer
          isOpen={isEditDrawerOpen}
          setOpen={setIsEditDrawerOpen}
          mode="edit"
          initialData={editingListing}
          onSubmitEdit={handleEditSave}
        />
      </APIProvider>
    </div>
  );
}
