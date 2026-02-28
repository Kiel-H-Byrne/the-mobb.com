"use client";

import { useState } from "react";
import { scanBusinessUrl } from "@app/actions/scanBusiness";
import { css } from "@styled/css";

export default function BusinessScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await scanBusinessUrl(url);
      setResult(response.data);
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css({
      padding: "6",
      border: "1px solid",
      borderColor: "gray.200",
      borderRadius: "lg",
      boxShadow: "sm",
      backgroundColor: "white",
      maxWidth: "md",
      marginX: "auto",
      marginTop: "10",
    })}>
      <h2 className={css({ fontSize: "xl", fontWeight: "bold", marginBottom: "4" })}>AI Business Curator</h2>

      <div className={css({ display: "flex", gap: "2" })}>
        <input
          className={css({
            flex: "1",
            padding: "2",
            border: "1px solid",
            borderColor: "gray.300",
            borderRadius: "md",
            outline: "none",
            _focus: { borderColor: "brand.orange" },
          })}
          placeholder="Paste business URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className={css({
            paddingX: "4",
            paddingY: "2",
            backgroundColor: "brand.orange",
            color: "white",
            borderRadius: "md",
            cursor: "pointer",
            _disabled: { opacity: "0.5", cursor: "not-allowed" },
            border: "none",
          })}
          onClick={handleScan}
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {result && (
        <div className={css({ marginTop: "6", gap: "2", backgroundColor: "gray.50", padding: "4", borderRadius: "md", fontSize: "sm", display: "flex", flexDirection: "column" })}>
          <p>
            <strong>Name:</strong> {result.name}
          </p>
          <p>
            <strong>Category:</strong> {result.category}
          </p>
          <p>
            <strong>Status:</strong>
            <span
              className={css({
                color: result.isBlackOwnedDetected ? "green.600" : "amber.600",
                fontWeight: "bold",
                marginLeft: "1",
              })}
            >
              {result.isBlackOwnedDetected
                ? "Verified Indicator Found"
                : "Needs Review"}
            </span>
          </p>
          <p>
            <strong>Confidence:</strong> {result.confidenceScore*100}%
          </p>

          <button
            className={css({
              width: "100%",
              marginTop: "2",
              padding: "2",
              border: "1px solid",
              borderColor: "brand.orange",
              color: "brand.orange",
              borderRadius: "md",
              background: "transparent",
              cursor: "pointer",
              _hover: { backgroundColor: "rgba(251, 176, 59, 0.05)" },
            })}
          >
            Add to Directory
          </button>
        </div>
      )}
    </div>
  );
}
