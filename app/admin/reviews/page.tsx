"use client";

import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { toaster } from "@/components/ui/Toast";
import { approveListing, getPendingListings, loginAdmin, logoutAdmin, rejectListing, updatePendingListing } from "@app/actions/admin";
import { css } from "@styled/css";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export default function AdminReviewsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);

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

  const handleApprove = async (l: any) => {
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
      setListings((prev) => prev.map((item) => {
        if (item._id === editingListing._id) {
          return { ...item, ...updatedData };
        }
        return item;
      }));
    } else {
      toaster.create({ title: "Error updating listing", type: "error" });
      throw new Error("Update failed"); // Propagate to drawer to show error
    }
    setIsLoading(false);
  };

  if (isLoggedIn === null) return <div className={css({ p: "10" })}>Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div className={css({ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bg: "gray.50" })}>
        <form onSubmit={handleLogin} className={css({ bg: "white", p: "8", borderRadius: "md", boxShadow: "md", display: "flex", flexDirection: "column", gap: "4", minWidth: "300px" })}>
          <h1 className={css({ fontSize: "2xl", fontWeight: "bold", textAlign: "center", mb: "4" })}>Admin Login</h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={css({ p: "2", border: "1px solid", borderColor: "gray.300", borderRadius: "md" })}
          />
          <button type="submit" className={css({ bg: "brand.orange", color: "white", p: "2", borderRadius: "md", fontWeight: "bold", cursor: "pointer" })}>
            Login
          </button>
          {loginError && <p className={css({ color: "red.500", fontSize: "sm", textAlign: "center" })}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className={css({ minHeight: "100vh", bg: "gray.50", p: "8" })}>
      <div className={css({ display: "flex", justifyContent: "space-between", mb: "8", alignItems: "center" })}>
        <h1 className={css({ fontSize: "3xl", fontWeight: "bold", color: "brand.grey" })}>Review Pending Listings</h1>
        <button
          onClick={async () => { await logoutAdmin(); setIsLoggedIn(false); }}
          className={css({ bg: "gray.200", p: "2 4", borderRadius: "md", fontWeight: "bold", cursor: "pointer" })}
        >
          Logout
        </button>
      </div>

      <div className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
        {listings.length === 0 ? (
          <div className={css({ p: "8", bg: "white", borderRadius: "md", textAlign: "center", color: "gray.500" })}>
            No listings pending review.
          </div>
        ) : (
          listings.map((l) => (
            <div key={l._id} className={css({ bg: "white", p: "6", borderRadius: "md", boxShadow: "sm", display: "flex", gap: "4", justifyContent: "space-between", alignItems: "flex-start" })}>
              <div className={css({ flex: "1" })}>
                <h2 className={css({ fontSize: "xl", fontWeight: "bold" })}>{l.name}</h2>
                <div className={css({ display: "flex", gap: "2", mb: "2", mt: "1" })}>
                  <span className={css({ bg: "gray.100", px: "2", py: "1", borderRadius: "md", fontSize: "xs", fontWeight: "bold" })}>{l.category}</span>
                  <span className={css({ bg: l.source === "AI_SCAN" ? "blue.100" : "green.100", color: l.source === "AI_SCAN" ? "blue.800" : "green.800", px: "2", py: "1", borderRadius: "md", fontSize: "xs", fontWeight: "bold" })}>
                    {l.source}
                  </span>
                  {l.source === "AI_SCAN" && l.isBlackOwned && (
                    <span className={css({ bg: "orange.100", color: "orange.800", px: "2", py: "1", borderRadius: "md", fontSize: "xs", fontWeight: "bold" })}>AI Flagged: Black Owned</span>
                  )}
                </div>
                <p className={css({ fontSize: "sm", color: "gray.600", mb: "1" })}><strong>Address:</strong> {l.address || "None"}</p>
                <p className={css({ fontSize: "sm", color: "gray.600", mb: "1" })}><strong>Website:</strong> {l.website ? <a href={l.website} target="_blank" className={css({ color: "blue.500" })}>{l.website}</a> : "None"}</p>
                <p className={css({ fontSize: "sm", color: "gray.600", mb: "1" })}><strong>Submitted:</strong> {l.createdAt ? new Date(l.createdAt).toLocaleString() : "Unknown"} | <strong>IP Address:</strong> {l.ipAddress || "Unknown"}</p>
                {l.description && (
                  <p className={css({ fontSize: "sm", color: "gray.700", mt: "2", p: "2", bg: "gray.50", borderRadius: "md" })}>{l.description}</p>
                )}
              </div>

              <div className={css({ display: "flex", flexDirection: "column", gap: "2", minWidth: "120px" })}>
                <button
                  disabled={isLoading}
                  onClick={() => handleApprove(l)}
                  className={css({ bg: "brand.orange", color: "white", p: "2", borderRadius: "md", fontWeight: "bold", cursor: "pointer", _hover: { bg: "orange.600" }, opacity: isLoading ? 0.7 : 1 })}
                >
                  Approve
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => {
                    setEditingListing(l);
                    setIsEditDrawerOpen(true);
                  }}
                  className={css({ bg: "blue.500", color: "white", p: "2", borderRadius: "md", fontWeight: "bold", cursor: "pointer", _hover: { bg: "blue.600" }, opacity: isLoading ? 0.7 : 1 })}
                >
                  Edit
                </button>
                <button
                  disabled={isLoading}
                  onClick={() => handleReject(l._id)}
                  className={css({ bg: "red.500", color: "white", p: "2", borderRadius: "md", fontWeight: "bold", cursor: "pointer", _hover: { bg: "red.600" }, opacity: isLoading ? 0.7 : 1 })}
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
        //@ts-ignore
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
