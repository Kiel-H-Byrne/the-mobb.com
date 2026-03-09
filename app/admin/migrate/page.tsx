"use client";

import { migrateLegacyListings } from "@app/actions/migration";
import { css } from "@styled/css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MigratePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
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

    return (
        <div className={css({ minHeight: "100vh", bg: "gray.50", p: "4", md: { p: "8" } })}>
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
                    <h1 className={css({ fontSize: "3xl", fontWeight: "bold", mb: "2", color: "brand.grey" })}>Data Sanitization & Migration</h1>
                    <p className={css({ color: "gray.600" })}>
                        Use this tool to automatically migrate legacy listings (single flat address strings) into the new multi-location array format. Will automatically attempt to geocode using Google Places if coordinates are missing.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/admin/reviews")}
                    className={css({
                        bg: "gray.200",
                        p: "2 4",
                        borderRadius: "md",
                        fontWeight: "bold",
                        cursor: "pointer",
                    })}
                >
                    Back to Reviews
                </button>
            </div>

            <div className={css({ bg: "white", p: "6", borderRadius: "md", boxShadow: "sm", border: "1px solid", borderColor: "gray.200" })}>
                <h2 className={css({ fontSize: "xl", fontWeight: "bold", mb: "4" })}>Migrate Legacy Locations</h2>

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
        </div>
    );
}
