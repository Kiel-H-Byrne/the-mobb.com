"use client";

import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { toaster } from "@/components/ui/Toast";
import { PendingListing } from "@/db/Types";
import {
  approveListing,
  getPendingListings,
  loginAdmin,
  logoutAdmin,
  rejectListing,
  updatePendingListing,
} from "@app/actions/admin";
import { css } from "@styled/css";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

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
    return [{ address: fallbackAddress, lat: listing.lat, lng: listing.lng }];
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

  useEffect(() => {
    async function init() {
      // In a real app we'd verify on server component, but doing client fetch for quick MVP
      const res = await getPendingListings();
      if (res.success) {
        setIsLoggedIn(true);
        setListings(res.data || []);
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
      // Update local state
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
      throw new Error("Update failed"); // Propagate to drawer to show error
    }
    setIsLoading(false);
  };

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
          bg: "gray.50",
        })}
      >
        <form
          onSubmit={handleLogin}
          className={css({
            bg: "white",
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
              borderColor: "gray.300",
              borderRadius: "md",
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
        bg: "gray.50",
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
              color: "brand.grey",
            })}
          >
            Review Pending Listings
          </h1>
          <p className={css({ color: "gray.600", fontSize: "sm", mt: "1" })}>
            Quick workflow: open edit, search Google Places, capture details, or
            mark the listing as online only.
          </p>
        </div>
        <button
          onClick={async () => {
            await logoutAdmin();
            setIsLoggedIn(false);
          }}
          className={css({
            bg: "gray.200",
            p: "2 4",
            borderRadius: "md",
            fontWeight: "bold",
            cursor: "pointer",
          })}
        >
          Logout
        </button>
      </div>

      <div
        className={css({ display: "flex", flexDirection: "column", gap: "4" })}
      >
        {listings.length === 0 ? (
          <div
            className={css({
              p: "8",
              bg: "white",
              borderRadius: "md",
              textAlign: "center",
              color: "gray.500",
            })}
          >
            No listings pending review.
          </div>
        ) : (
          listings.map((l) => (
            <div
              key={String(l._id)}
              className={css({
                bg: "white",
                p: "5",
                md: { p: "6" },
                borderRadius: "lg",
                boxShadow: "sm",
                display: "grid",
                gap: "5",
                border: "1px solid",
                borderColor: "gray.200",
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
                <div className={css({ flex: "1", minWidth: "0" })}>
                  <h2 className={css({ fontSize: "xl", fontWeight: "bold" })}>
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
                        bg: "gray.100",
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
                        bg: l.source === "AI_SCAN" ? "blue.100" : "green.100",
                        color:
                          l.source === "AI_SCAN" ? "blue.800" : "green.800",
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
                      const isMapReady = locationsToRender.length > 0 && locationsToRender.every(loc => loc.lat && loc.lng);
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
                      )
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
                </div>

                <div
                  className={css({
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2",
                    justifyContent: "flex-start",
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
                      _hover: { bg: "blue.600" },
                      opacity: isLoading ? 0.7 : 1,
                    })}
                  >
                    Edit / find address
                  </button>
                  <a
                    href={buildGoogleMapsSearchUrl(l)}
                    target="_blank"
                    rel="noreferrer"
                    className={css({
                      bg: "gray.100",
                      color: "gray.800",
                      p: "2 3",
                      borderRadius: "md",
                      fontWeight: "bold",
                      textDecoration: "none",
                    })}
                  >
                    Google Maps
                  </a>
                  <a
                    href={buildGoogleSearchUrl(l)}
                    target="_blank"
                    rel="noreferrer"
                    className={css({
                      bg: "gray.100",
                      color: "gray.800",
                      p: "2 3",
                      borderRadius: "md",
                      fontWeight: "bold",
                      textDecoration: "none",
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
                        bg: "gray.100",
                        color: "gray.800",
                        p: "2 3",
                        borderRadius: "md",
                        fontWeight: "bold",
                        textDecoration: "none",
                      })}
                    >
                      Visit site
                    </a>
                  )}
                </div>
              </div>

              <div className={css({ display: "grid", gap: "2" })}>
                <div
                  className={css({
                    fontSize: "sm",
                    color: "gray.700",
                    mb: "1",
                  })}
                >
                  <strong>Address:</strong>{" "}
                  {getLocationsToRender(l).length > 0 ? (
                    getLocationsToRender(l).map((loc, idx) => (
                      <div key={idx} className={css({ ml: "4", mt: "1", mb: "1" })}>
                        <button
                          onClick={() => openEditor(l)}
                          className={css({
                            color: "blue.600",
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
                          <span className={css({ fontSize: "xs", color: "green.600", ml: "2" })}>(Geocoded)</span>
                        ) : (
                          <span className={css({ fontSize: "xs", color: "yellow.600", ml: "2" })}>(Needs geocoding)</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <button
                      onClick={() => openEditor(l)}
                      className={css({
                        color: "blue.600",
                        textDecoration: "underline",
                        cursor: "pointer",
                        background: "transparent",
                        border: "none",
                        padding: "0",
                        textAlign: "left",
                      })}
                    >
                      No address on file — click to search or enter one
                    </button>
                  )}
                </div>
                <p
                  className={css({
                    fontSize: "sm",
                    color: "gray.600",
                    mb: "1",
                  })}
                >
                  <strong>Website:</strong>{" "}
                  {l.website ? (
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noreferrer"
                      className={css({ color: "blue.500" })}
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
                      color: "gray.600",
                      mb: "1",
                    })}
                  >
                    <strong>Phone:</strong> {l.phone}
                  </p>
                )}
                <p
                  className={css({
                    fontSize: "sm",
                    color: "gray.600",
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
                      color: "gray.700",
                      mt: "2",
                      p: "2",
                      bg: "gray.50",
                      borderRadius: "md",
                    })}
                  >
                    {l.description}
                  </p>
                )}
              </div>

              <div
                className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}
              >
                <button
                  disabled={isLoading}
                  onClick={() => handleApprove(l)}
                  className={css({
                    bg: "brand.orange",
                    color: "white",
                    p: "2 4",
                    borderRadius: "md",
                    fontWeight: "bold",
                    cursor: "pointer",
                    _hover: { bg: "orange.600" },
                    opacity: isLoading ? 0.7 : 1,
                  })}
                >
                  Approve
                </button>
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
          ))
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
