// src/components/admin/CurationJobMonitor.tsx
"use client";

import { toaster } from "@/components/ui/Toast";
import {
  createBatchCurationJob,
  getCurationJob,
  getRecentCurationJobs,
  processBatchStep,
} from "@app/actions/batch-curator";
import {
  ArrowClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckCircleIcon,
  LinkIcon,
  PlayIcon,
  QueueIcon,
  SpinnerGapIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { useEffect, useState } from "react";

interface CurationJobMonitorProps {
  onBatchCompleted?: () => void;
}

export const CurationJobMonitor = ({
  onBatchCompleted,
}: CurationJobMonitorProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [rawUrls, setRawUrls] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<any | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Parse detected URLs count
  const detectedUrlsCount = rawUrls
    .split(/[\r\n,]+/)
    .map((l) => l.trim())
    .filter((l) => {
      try {
        const u = new URL(l);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    }).length;

  // Load recent jobs on mount
  useEffect(() => {
    async function fetchRecent() {
      const res = await getRecentCurationJobs(5);
      if (res.success && res.data) {
        setRecentJobs(res.data);
        // If the latest job is still processing, monitor it automatically
        const latest = res.data[0];
        if (latest && latest.status === "PROCESSING") {
          setActiveJobId(latest._id);
          setJobData(latest);
        }
      }
    }
    fetchRecent();
  }, []);

  // Poll active job status
  useEffect(() => {
    if (!activeJobId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      const res = await getCurationJob(activeJobId);
      if (!isMounted) return;

      if (res.success && res.data) {
        setJobData(res.data);
        if (res.data.status === "COMPLETED") {
          clearInterval(interval);
          toaster.create({
            title: `Batch job complete!`,
            description: `Extracted ${res.data.listingsExtracted || 0} businesses from ${res.data.totalUrls} URLs.`,
            type: "success",
          });
          if (onBatchCompleted) onBatchCompleted();
          // Refresh recent list
          const recentRes = await getRecentCurationJobs(5);
          if (recentRes.success && recentRes.data) setRecentJobs(recentRes.data);
        } else if (res.data.status === "PROCESSING") {
          // Trigger a fallback step in case background worker is throttled
          processBatchStep(activeJobId).catch(() => {});
        }
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeJobId, onBatchCompleted]);

  const handleStartBatch = async () => {
    if (detectedUrlsCount === 0) {
      toaster.create({
        title: "No valid URLs",
        description: "Please paste at least one valid website or article link.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBatchCurationJob(rawUrls);
      if (res.success && res.jobId) {
        setActiveJobId(res.jobId);
        setRawUrls("");
        toaster.create({
          title: `Batch job started for ${res.totalUrls} URLs`,
          type: "info",
        });
        const initialJob = await getCurationJob(res.jobId);
        if (initialJob.success) setJobData(initialJob.data);
      } else {
        toaster.create({
          title: "Failed to start batch",
          description: res.error,
          type: "error",
        });
      }
    } catch (err: any) {
      toaster.create({
        title: "Error starting batch",
        description: err.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentComplete =
    jobData && jobData.totalUrls > 0
      ? Math.round(((jobData.processedUrls || 0) / jobData.totalUrls) * 100)
      : 0;

  return (
    <div
      className={css({
        bg: "bg.surface",
        border: "1px solid",
        borderColor: "border.light",
        borderRadius: "xl",
        overflow: "hidden",
        mb: "6",
        boxShadow: "sm",
      })}
    >
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={css({
          p: "4",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          bg: "bg.canvas",
          borderBottom: isOpen ? "1px solid" : "none",
          borderColor: "border.light",
          _hover: { bg: "rgba(255,255,255,0.02)" },
        })}
      >
        <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
          <div
            className={css({
              w: "8",
              h: "8",
              borderRadius: "lg",
              bg: "brand.orangeMuted",
              color: "brand.orange",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <QueueIcon size={20} weight="bold" />
          </div>
          <div>
            <div className={css({ fontWeight: "bold", fontSize: "md", color: "text.main" })}>
              Batch URL Ingestion & Job Monitor
            </div>
            <div className={css({ fontSize: "xs", color: "text.muted" })}>
              Directly feed articles & directories into the AI curator (bypasses Google search)
            </div>
          </div>
        </div>

        <div className={css({ display: "flex", alignItems: "center", gap: "3" })}>
          {jobData && jobData.status === "PROCESSING" && (
            <span
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "1.5",
                bg: "blue.500/20",
                color: "blue.400",
                px: "2.5",
                py: "1",
                borderRadius: "full",
                fontSize: "xs",
                fontWeight: "bold",
              })}
            >
              <SpinnerGapIcon size={14} className={css({ animation: "spin 1s linear infinite" })} />
              Processing ({jobData.processedUrls}/{jobData.totalUrls})
            </span>
          )}
          {isOpen ? <CaretUpIcon size={18} /> : <CaretDownIcon size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className={css({ p: "5", display: "flex", flexDirection: "column", gap: "5" })}>
          {/* Feed Input Area */}
          <div className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
              <label className={css({ fontSize: "xs", fontWeight: "bold", color: "text.main" })}>
                Input URLs to Ingest (one per line or comma-separated)
              </label>
              <span className={css({ fontSize: "xs", color: detectedUrlsCount > 0 ? "brand.orange" : "text.muted" })}>
                {detectedUrlsCount} valid {detectedUrlsCount === 1 ? "link" : "links"} detected
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="https://www.essence.com/lifestyle/black-owned-coffee-shops/&#10;https://ny.eater.com/maps/best-black-owned-restaurants-nyc"
              value={rawUrls}
              onChange={(e) => setRawUrls(e.target.value)}
              className={css({
                w: "full",
                p: "3",
                bg: "bg.canvas",
                border: "1px solid",
                borderColor: "border.light",
                borderRadius: "lg",
                color: "text.main",
                fontSize: "xs",
                fontFamily: "mono",
                resize: "vertical",
                _focus: { borderColor: "brand.orange", outline: "none" },
              })}
            />
            <div className={css({ display: "flex", justifyContent: "flex-end" })}>
              <button
                onClick={handleStartBatch}
                disabled={isSubmitting || detectedUrlsCount === 0}
                className={css({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2",
                  bg: "brand.orange",
                  color: "black",
                  px: "4",
                  py: "2",
                  borderRadius: "lg",
                  fontWeight: "bold",
                  fontSize: "xs",
                  cursor: "pointer",
                  border: "none",
                  opacity: isSubmitting || detectedUrlsCount === 0 ? 0.6 : 1,
                  _hover: { filter: "brightness(1.1)" },
                  transition: "all 0.2s",
                })}
              >
                {isSubmitting ? (
                  <>
                    <SpinnerGapIcon size={16} className={css({ animation: "spin 1s linear infinite" })} />
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayIcon size={16} weight="fill" />
                    Feed & Ingest ({detectedUrlsCount})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active / Selected Job Monitor Card */}
          {jobData && (
            <div
              className={css({
                p: "4",
                borderRadius: "xl",
                bg: "bg.canvas",
                border: "1px solid",
                borderColor: jobData.status === "PROCESSING" ? "brand.orange" : "border.light",
                display: "flex",
                flexDirection: "column",
                gap: "3",
              })}
            >
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
                <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                  <span className={css({ fontWeight: "bold", fontSize: "sm", color: "text.main" })}>
                    Job #{String(jobData._id).slice(-6)}
                  </span>
                  <span
                    className={css({
                      fontSize: "10px",
                      px: "2",
                      py: "0.5",
                      borderRadius: "full",
                      fontWeight: "bold",
                      bg:
                        jobData.status === "COMPLETED"
                          ? "green.500/20"
                          : jobData.status === "PROCESSING"
                            ? "blue.500/20"
                            : "red.500/20",
                      color:
                        jobData.status === "COMPLETED"
                          ? "green.400"
                          : jobData.status === "PROCESSING"
                            ? "blue.400"
                            : "red.400",
                    })}
                  >
                    {jobData.status}
                  </span>
                </div>

                <div className={css({ display: "flex", gap: "3", fontSize: "xs" })}>
                  <span className={css({ color: "green.400", fontWeight: "bold" })}>
                    +{jobData.listingsExtracted || 0} Businesses
                  </span>
                  <span className={css({ color: "text.muted" })}>
                    {jobData.successCount || 0} Succeeded
                  </span>
                  {jobData.failedCount > 0 && (
                    <span className={css({ color: "red.400" })}>
                      {jobData.failedCount} Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className={css({
                  w: "full",
                  h: "2.5",
                  bg: "rgba(255,255,255,0.08)",
                  borderRadius: "full",
                  overflow: "hidden",
                })}
              >
                <div
                  className={css({
                    h: "full",
                    bg: jobData.status === "COMPLETED" ? "green.500" : "brand.orange",
                    transition: "width 0.4s ease",
                  })}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>

              <div className={css({ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "text.muted" })}>
                <span>{percentComplete}% processed ({jobData.processedUrls} of {jobData.totalUrls} URLs)</span>
                <span>Started: {new Date(jobData.startedAt || jobData.createdAt).toLocaleTimeString()}</span>
              </div>

              {/* URL Breakdown Table */}
              <div
                className={css({
                  maxH: "200px",
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "white/10",
                  borderRadius: "lg",
                })}
              >
                <table className={css({ w: "full", fontSize: "xs", borderCollapse: "collapse" })}>
                  <thead>
                    <tr className={css({ bg: "rgba(255,255,255,0.03)", textAlign: "left" })}>
                      <th className={css({ p: "2", borderBottom: "1px solid", borderColor: "white/10" })}>URL</th>
                      <th className={css({ p: "2", borderBottom: "1px solid", borderColor: "white/10", w: "120px" })}>Status</th>
                      <th className={css({ p: "2", borderBottom: "1px solid", borderColor: "white/10", w: "100px" })}>Extracted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(jobData.urls || []).map((u: any, idx: number) => (
                      <tr
                        key={idx}
                        className={css({
                          borderBottom: "1px solid",
                          borderColor: "white/5",
                          _hover: { bg: "rgba(255,255,255,0.02)" },
                        })}
                      >
                        <td className={css({ p: "2", maxWidth: "320px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                          <a
                            href={u.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css({
                              color: "text.main",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "1",
                              _hover: { color: "brand.orange", textDecoration: "underline" },
                            })}
                          >
                            <LinkIcon size={12} />
                            {u.url}
                          </a>
                          {u.error && (
                            <div className={css({ color: "red.400", fontSize: "10px", mt: "0.5" })}>
                              {u.error}
                            </div>
                          )}
                        </td>
                        <td className={css({ p: "2" })}>
                          {u.status === "PROCESSING" && (
                            <span className={css({ color: "blue.400", display: "inline-flex", alignItems: "center", gap: "1" })}>
                              <SpinnerGapIcon size={12} className={css({ animation: "spin 1s linear infinite" })} />
                              Ingesting...
                            </span>
                          )}
                          {u.status === "COMPLETED" && (
                            <span className={css({ color: "green.400", display: "inline-flex", alignItems: "center", gap: "1" })}>
                              <CheckCircleIcon size={12} weight="fill" />
                              Done
                            </span>
                          )}
                          {u.status === "FAILED" && (
                            <span className={css({ color: "red.400", display: "inline-flex", alignItems: "center", gap: "1" })}>
                              <WarningCircleIcon size={12} weight="fill" />
                              Failed
                            </span>
                          )}
                          {u.status === "PENDING" && (
                            <span className={css({ color: "text.muted" })}>Queued</span>
                          )}
                        </td>
                        <td className={css({ p: "2", fontWeight: "bold", color: u.listingsFound ? "green.400" : "text.muted" })}>
                          {u.listingsFound ? `+${u.listingsFound}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Runs Toggle */}
          {recentJobs.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5",
                  fontSize: "xs",
                  color: "text.muted",
                  bg: "transparent",
                  border: "none",
                  cursor: "pointer",
                  p: "0",
                  _hover: { color: "text.main" },
                })}
              >
                <span>Recent Batch Jobs ({recentJobs.length})</span>
                {isHistoryOpen ? <CaretUpIcon size={14} /> : <CaretDownIcon size={14} />}
              </button>

              {isHistoryOpen && (
                <div className={css({ mt: "2", display: "flex", flexDirection: "column", gap: "2" })}>
                  {recentJobs.map((j) => (
                    <div
                      key={j._id}
                      onClick={() => {
                        setActiveJobId(j._id);
                        setJobData(j);
                      }}
                      className={css({
                        p: "2.5",
                        borderRadius: "lg",
                        bg: "bg.canvas",
                        border: "1px solid",
                        borderColor: activeJobId === j._id ? "brand.orange" : "white/5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        fontSize: "xs",
                        _hover: { borderColor: "brand.orange/50" },
                      })}
                    >
                      <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                        <span className={css({ fontWeight: "bold" })}>Job #{String(j._id).slice(-6)}</span>
                        <span className={css({ color: "text.muted" })}>
                          {new Date(j.createdAt).toLocaleDateString()} {new Date(j.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={css({ display: "flex", gap: "3" })}>
                        <span className={css({ color: "green.400", fontWeight: "bold" })}>
                          +{j.listingsExtracted || 0} listings
                        </span>
                        <span className={css({ color: "text.muted" })}>
                          {j.totalUrls} URLs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
