"use client";

import { migrateLegacyListings } from "@app/actions/migration";
import { css } from "@styled/css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [isDedupLoading, setIsDedupLoading] = useState(false);
    const [dedupResult, setDedupResult] = useState<string | null>(null);
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
            </div>
        </div>
    );
}
