"use client";

import { Button, Input } from "@mui/material";
import { useState } from "react";
import { scanBusinessUrl } from "../app/actions/scanBusiness";

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
    <div className="p-6 border rounded-lg shadow-sm bg-white max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">AI Business Curator</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Paste business URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan"}
        </Button>
      </div>

      {result && (
        <div className="mt-6 space-y-2 bg-gray-50 p-4 rounded text-sm">
          <p>
            <strong>Name:</strong> {result.name}
          </p>
          <p>
            <strong>Category:</strong> {result.category}
          </p>
          <p>
            <strong>Status:</strong>
            <span
              className={
                result.isBlackOwnedDetected
                  ? "text-green-600 font-bold ml-1"
                  : "text-amber-600 font-bold ml-1"
              }
            >
              {result.isBlackOwnedDetected
                ? "Verified Indicator Found"
                : "Needs Review"}
            </span>
          </p>
          <p>
            <strong>Confidence:</strong> {result.confidenceScore}%
          </p>

          {/* Action to Save to DB would go here */}
          <Button className="w-full mt-2" variant="outlined">
            Add to Directory
          </Button>
        </div>
      )}
    </div>
  );
}
