"use client";

import { sanitizePendingListings } from "@app/actions/admin";
import { migrateLegacyListings } from "@app/actions/migration";
import { css } from "@styled/css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isDedupLoading, setIsDedupLoading] = useState(false);
    const [dedupResult, setDedupResult] = useState<string | null>(null);
    const [isSanitizeLoading, setIsSanitizeLoading] = useState(false);
    const [sanitizeResult, setSanitizeResult] = useState<string | null>(null);
    const [isRepairLoading, setIsRepairLoading] = useState(false);
    const [repairResult, setRepairResult] = useState<string | null>(null);
    const router = useRouter();

    const handleMigration = async () => {
        setIsLoading(true);
        setResult(null);
        const res = await migrateLegacyListings();
        if (res.success) {
            setResult(res.message || "Success");
        } else {
            if (res.error === "Unauthorized") {
                router.push("/admin/reviews");
            }
            setResult(`Error: ${res.error || "Unknown"}`);
        }
        setIsLoading(false);
    };

    const handleDeduplication = async () => {
        setIsDedupLoading(true);
        setDedupResult(null);
        // We'll import deduplicateListingsByName in the first block
        const { deduplicateListingsByName } = await import("@app/actions/migration");
        const res = await deduplicateListingsByName();
        if (res.success) {
            setDedupResult(res.message || "Success");
        } else {
            if (res.error === "Unauthorized") {
                router.push("/admin/reviews");
            }
            setDedupResult(`Error: ${res.error || "Unknown"}`);
        }
        setIsDedupLoading(false);
    };

    const handleSanitization = async () => {
        setIsSanitizeLoading(true);
        setSanitizeResult(null);
        const { sanitizeGeolocations } = await import("@app/actions/migration");
        const res = await sanitizeGeolocations();
        if (res.success) {
            setSanitizeResult(res.message || "Success");
        } else {
            if (res.error === "Unauthorized") {
                router.push("/admin/reviews");
            }
            setSanitizeResult(`Error: ${res.error || "Unknown"}`);
        }
        setIsSanitizeLoading(false);
    };

    const handleRepair = async () => {
        setIsRepairLoading(true);
        setRepairResult(null);
        const res = await sanitizePendingListings();
        if (res.success) {
            setRepairResult(`Success: Recovered ${res.count} orphaned listings.`);
        } else {
            setRepairResult(`Error: ${res.error || "Unknown"}`);
        }
        setIsRepairLoading(false);
    };

    return (
        <div className={css({ minHeight: "100vh", bg: "bg.canvas", p: "4", md: { p: "8" } })}>
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
                    <h1 className={css({ fontSize: "3xl", fontWeight: "bold", mb: "2", color: "text.main" })}>Data Sanitization & Migration</h1>
                    <p className={css({ color: "text.muted" })}>
                        Use this tool to clean and migrate listings. <strong>Note: Migrations must be run in the specified order below.</strong>
                    </p>
                </div>
                <button
                    onClick={() => router.push("/admin/reviews")}
                    className={css({
                        bg: "bg.surface",
                        color: "text.main",
                        p: "2 4",
                        borderRadius: "md",
                        fontWeight: "bold",
                        cursor: "pointer",
                    })}
                >
                    Back to Reviews
                </button>
            </div>

            <div className={css({ display: "flex", flexDirection: "column", gap: "6" })}>
                <div className={css({ bg: "bg.surface", p: "6", borderRadius: "md", boxShadow: "sm", border: "1px solid", borderColor: "border.light" })}>
                    <div className={css({ display: "flex", alignItems: "center", gap: "3", mb: "2" })}>
                        <span className={css({ fontSize: "2xl" })}>1️⃣</span>
                        <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "text.main" })}>Migrate Legacy Locations</h2>
                    </div>
                    <p className={css({ color: "text.muted", mb: "4" })}>
                        First, automatically migrate legacy listings (single flat address strings) into the new multi-location array format. Will automatically attempt to geocode using Google Places if coordinates are missing. This step is required before deduplication to ensure all locations are formatted correctly.
                    </p>

                    <button
                        onClick={handleMigration}
                        disabled={isLoading}
                        className={css({
                            bg: "brand.orange",
                            color: "white",
                            p: "3 6",
                            borderRadius: "md",
                            fontWeight: "bold",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                            _hover: { bg: "orange.600" }
                        })}
                    >
                        {isLoading ? "Running Migration (This may take a while)..." : "Run Migration"}
                    </button>

                    {result && (
                        <div className={css({ mt: "6", p: "4", bg: result.includes("Error") ? "red.50" : "green.50", color: result.includes("Error") ? "red.800" : "green.800", borderRadius: "md", fontWeight: "bold" })}>
                            {result}
                        </div>
                    )}
                </div>

                <div className={css({ bg: "bg.surface", p: "6", borderRadius: "md", boxShadow: "sm", border: "1px solid", borderColor: "border.light" })}>
                    <div className={css({ display: "flex", alignItems: "center", gap: "3", mb: "2" })}>
                        <span className={css({ fontSize: "2xl" })}>2️⃣</span>
                        <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "text.main" })}>Deduplicate Listings</h2>
                    </div>
                    <p className={css({ color: "text.muted", mb: "4" })}>
                        Next, find duplicates that share the same exact name, merge their locations together into the primary listing, and remove the redundant listings. Make sure to run Step 1 first so all coordinates are in the new locations array format.
                    </p>

                    <button
                        onClick={handleDeduplication}
                        disabled={isDedupLoading}
                        className={css({
                            bg: "blue.500",
                            color: "white",
                            p: "3 6",
                            borderRadius: "md",
                            fontWeight: "bold",
                            cursor: isDedupLoading ? "not-allowed" : "pointer",
                            opacity: isDedupLoading ? 0.7 : 1,
                            _hover: { bg: "blue.600" }
                        })}
                    >
                        {isDedupLoading ? "Running Deduplication..." : "Run Deduplication"}
                    </button>

                    {dedupResult && (
                        <div className={css({ mt: "6", p: "4", bg: dedupResult.includes("Error") ? "red.50" : "green.50", color: dedupResult.includes("Error") ? "red.800" : "green.800", borderRadius: "md", fontWeight: "bold" })}>
                            {dedupResult}
                        </div>
                    )}
                </div>

                <div className={css({ bg: "bg.surface", p: "6", borderRadius: "md", boxShadow: "sm", border: "1px solid", borderColor: "border.light" })}>
                    <div className={css({ display: "flex", alignItems: "center", gap: "3", mb: "2" })}>
                        <span className={css({ fontSize: "2xl" })}>3️⃣</span>
                        <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "text.main" })}>Sanitize Geolocation Data</h2>
                    </div>
                    <p className={css({ color: "text.muted", mb: "4" })}>
                        Sweep the database to find listings containing mock address strings (e.g., "N/A"), strings lacking street numbers (e.g., just "Atlanta, GA"), and map entries missing lat/long coordinates. Invalid location data will be rigorously purged to ensure Map constraints are strictly met. Unmapped data will return to "Needs Geocoding".
                    </p>

                    <button
                        onClick={handleSanitization}
                        disabled={isSanitizeLoading}
                        className={css({
                            bg: "purple.500",
                            color: "white",
                            p: "3 6",
                            borderRadius: "md",
                            fontWeight: "bold",
                            cursor: isSanitizeLoading ? "not-allowed" : "pointer",
                            opacity: isSanitizeLoading ? 0.7 : 1,
                            _hover: { bg: "purple.600" }
                        })}
                    >
                        {isSanitizeLoading ? "Running Sanitization..." : "Run Database Scrub"}
                    </button>

                    {sanitizeResult && (
                        <div className={css({ mt: "6", p: "4", bg: sanitizeResult.includes("Error") ? "red.50" : "green.50", color: sanitizeResult.includes("Error") ? "red.800" : "green.800", borderRadius: "md", fontWeight: "bold" })}>
                            {sanitizeResult}
                        </div>
                    )}
                </div>
                <div className={css({ bg: "bg.surface", p: "6", borderRadius: "md", boxShadow: "sm", border: "1px solid", borderColor: "border.light" })}>
                    <div className={css({ display: "flex", alignItems: "center", gap: "3", mb: "2" })}>
                        <span className={css({ fontSize: "2xl" })}>4️⃣</span>
                        <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "text.main" })}>Repair Database (Orphans)</h2>
                    </div>
                    <p className={css({ color: "text.muted", mb: "4" })}>
                        Heals listings that were marked "Approved" in pending but failed to publish to the live map. This typically happens if the AI Curator auto-approves a listing but skips the final promotion step. <strong>Safe to run anytime.</strong>
                    </p>

                    <button
                        onClick={handleRepair}
                        disabled={isRepairLoading}
                        className={css({
                            bg: "gray.700",
                            color: "white",
                            p: "3 6",
                            borderRadius: "md",
                            fontWeight: "bold",
                            cursor: isRepairLoading ? "not-allowed" : "pointer",
                            opacity: isRepairLoading ? 0.7 : 1,
                            _hover: { bg: "gray.800" }
                        })}
                    >
                        {isRepairLoading ? "Repairing..." : "Run Database Repair"}
                    </button>

                    {repairResult && (
                        <div className={css({ mt: "6", p: "4", bg: repairResult.includes("Error") ? "red.50" : "green.50", color: repairResult.includes("Error") ? "red.800" : "green.800", borderRadius: "md", fontWeight: "bold" })}>
                            {repairResult}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
