"use client";

import { toaster } from "@/components/ui/Toast";
import { CurationReport, PendingListing } from "@/db/Types";
import {
  getLegacyAutoApprovalReport,
  getScoutRunReport,
  getScoutRuns,
  revertAutoApproval,
} from "@app/actions/admin";
import { css } from "@styled/css";
import Link from "next/link";
import { useEffect, useState } from "react";

type ScoutRun = NonNullable<
  Awaited<ReturnType<typeof getScoutRuns>>["data"]
>[number];

type AtlasLinks = {
  pendingListingsUrl: string | null;
  listingsUrl: string | null;
};

const LOCATION_METHOD_LABELS: Record<CurationReport["locationMethod"], string> =
  {
    online_only: "Online only",
    geocoded_address: "Geocoded the address on the page",
    places_name_search: "Found by searching Google Places for the name",
    none: "No street-level location found",
    unknown: "Location found (lookup details weren't recorded)",
  };

// Pseudo-run for auto-approvals made before scout runs were logged
const LEGACY_ID = "legacy";
const LEGACY_DAYS = 30;

const formatDate = (d?: Date | string) =>
  d ? new Date(d).toLocaleString() : "—";

const linkButton = css({
  bg: "bg.canvas",
  color: "text.main",
  p: "1.5 3",
  borderRadius: "md",
  fontSize: "sm",
  fontWeight: "bold",
  border: "1px solid",
  borderColor: "border.light",
  textDecoration: "none",
  cursor: "pointer",
  _hover: { bg: "bg.surface" },
});

export default function AdminReportsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<ScoutRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [atlas, setAtlas] = useState<AtlasLinks | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    async function init() {
      const res = await getScoutRuns();
      if (res.success) {
        setIsLoggedIn(true);
        setRuns(res.data || []);
        setSelectedRunId(res.data?.length ? res.data[0]._id : LEGACY_ID);
      } else if (res.error === "Unauthorized") {
        setIsLoggedIn(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedRunId) return;
    async function loadReport(runId: string) {
      setIsLoading(true);
      const res =
        runId === LEGACY_ID
          ? await getLegacyAutoApprovalReport(LEGACY_DAYS)
          : await getScoutRunReport(runId);
      if (res.success) {
        setListings(res.data || []);
        setAtlas(res.atlas || null);
      }
      setIsLoading(false);
    }
    loadReport(selectedRunId);
  }, [selectedRunId]);

  const handleRevert = async (l: PendingListing) => {
    if (
      !confirm(
        `Unpublish "${l.name}" from the map and send it back to the review queue?`,
      )
    )
      return;
    setIsLoading(true);
    const res = await revertAutoApproval(l._id);
    if (res.success) {
      toaster.create({
        title: `"${l.name}" is back in the review queue.`,
        type: "success",
      });
      setListings((prev) =>
        prev.map((item) =>
          item._id === l._id
            ? {
                ...item,
                status: "PENDING_REVIEW",
                curation: item.curation && {
                  ...item.curation,
                  liveListingId: undefined,
                  revertedAt: new Date(),
                },
              }
            : item,
        ),
      );
    } else {
      toaster.create({
        title: res.error || "Failed to revert",
        type: "error",
      });
    }
    setIsLoading(false);
  };

  const copyFilter = async (id: string) => {
    await navigator.clipboard.writeText(`{ _id: ObjectId("${id}") }`);
    toaster.create({ title: "Atlas filter copied", type: "info" });
  };

  if (isLoggedIn === null) {
    return (
      <div className={css({ p: "8", color: "text.main" })}>Loading...</div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={css({ p: "8", color: "text.main" })}>
        Please{" "}
        <Link
          href="/admin/reviews"
          className={css({ color: "blue.500", textDecoration: "underline" })}
        >
          log in on the reviews page
        </Link>{" "}
        first.
      </div>
    );
  }

  const selectedRun = runs.find((r) => r._id === selectedRunId);
  const autoApproved = listings.filter(
    (l) => l.curation?.decision === "AUTO_APPROVED",
  );
  const pendingReview = listings.filter(
    (l) => l.curation?.decision === "PENDING_REVIEW",
  );

  const renderListing = (l: PendingListing) => {
    const c = l.curation;
    if (!c) return null;
    const isLive = l.status === "APPROVED";
    const firstAddress =
      l.locations?.[0]?.address ||
      (Array.isArray(l.address) ? l.address[0] : l.address) ||
      "";

    return (
      <div
        key={l._id}
        className={css({
          bg: "bg.surface",
          p: "4",
          borderRadius: "lg",
          border: "1px solid",
          borderColor: "border.light",
          display: "flex",
          flexDirection: "column",
          gap: "3",
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            gap: "4",
            flexWrap: "wrap",
          })}
        >
          <div>
            <h3
              className={css({
                fontSize: "lg",
                fontWeight: "bold",
                color: "text.main",
              })}
            >
              {l.name}
            </h3>
            <p className={css({ fontSize: "sm", color: "text.muted" })}>
              {l.category}
              {firstAddress ? ` · ${firstAddress}` : ""}
              {l.isOnlineOnly ? " · Online only" : ""}
            </p>
            {c.revertedAt && (
              <p
                className={css({
                  fontSize: "xs",
                  color: "orange.500",
                  mt: "1",
                })}
              >
                Sent back to review {formatDate(c.revertedAt)}
              </p>
            )}
            {c.publishSkippedReason && (
              <p
                className={css({
                  fontSize: "xs",
                  color: "orange.500",
                  mt: "1",
                })}
              >
                Not published: {c.publishSkippedReason}
              </p>
            )}
          </div>

          <div className={css({ minWidth: "160px" })}>
            <div
              className={css({
                fontSize: "xs",
                color: "text.muted",
                mb: "1",
              })}
            >
              AI Black-owned confidence
            </div>
            <div
              className={css({
                fontSize: "2xl",
                fontWeight: "bold",
                color: "text.main",
              })}
            >
              {c.blackOwnedConfidence === null
                ? c.legacy
                  ? "not recorded"
                  : "n/a"
                : `${c.blackOwnedConfidence}%`}
            </div>
            <div
              className={css({
                height: "2",
                bg: "border.light",
                borderRadius: "full",
                overflow: "hidden",
              })}
            >
              <div
                className={css({
                  height: "100%",
                  bg:
                    c.blackOwnedConfidence === null
                      ? "gray.400"
                      : c.blackOwnedConfidence >= 80
                        ? "green.500"
                        : c.blackOwnedConfidence >= 50
                          ? "yellow.500"
                          : "red.500",
                })}
                style={{ width: `${c.blackOwnedConfidence ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {c.blackOwnedEvidence && (
          <blockquote
            className={css({
              borderLeft: "3px solid",
              borderColor: "brand.orange",
              pl: "3",
              fontSize: "sm",
              fontStyle: "italic",
              color: "text.main",
            })}
          >
            “{c.blackOwnedEvidence}”
          </blockquote>
        )}

        <ul
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "1",
          })}
        >
          {c.checks.map((check) => (
            <li
              key={check.key}
              className={css({ fontSize: "sm", color: "text.main" })}
            >
              <span
                className={css({
                  fontWeight: "bold",
                  color: check.passed ? "green.500" : "red.500",
                  mr: "2",
                })}
              >
                {check.passed ? "✓" : "✗"}
              </span>
              {check.label}
              {check.key === "location" ? (
                <span className={css({ color: "text.muted" })}>
                  {" "}
                  — {LOCATION_METHOD_LABELS[c.locationMethod]}
                </span>
              ) : check.key === "category" && check.detail ? (
                <span className={css({ color: "text.muted" })}>
                  {" "}
                  — {check.detail}
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <details className={css({ fontSize: "sm", color: "text.main" })}>
          <summary className={css({ cursor: "pointer", color: "text.muted" })}>
            Scoring metadata
          </summary>
          <dl
            className={css({
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              gap: "1 4",
              mt: "2",
            })}
          >
            <dt className={css({ color: "text.muted" })}>Source page</dt>
            <dd>
              {c.sourceUrl ? (
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={css({ color: "blue.500", wordBreak: "break-all" })}
                >
                  {c.sourceUrl}
                </a>
              ) : (
                "unknown"
              )}
              {c.sourceType &&
                (c.sourceType === "listicle_directory"
                  ? " (listicle)"
                  : " (single business)")}
              {c.legacy?.sourceUrlInferred && (
                <span className={css({ color: "text.muted" })}>
                  {" "}
                  — inferred from scan time
                </span>
              )}
            </dd>
            <dt className={css({ color: "text.muted" })}>Model</dt>
            <dd>{c.model}</dd>
            <dt className={css({ color: "text.muted" })}>Website</dt>
            <dd>
              {l.website ? (
                <a
                  href={l.website}
                  target="_blank"
                  rel="noreferrer"
                  className={css({ color: "blue.500", wordBreak: "break-all" })}
                >
                  {l.website}
                </a>
              ) : (
                "none"
              )}
              {c.hasOgData ? " (preview metadata found)" : ""}
            </dd>
            <dt className={css({ color: "text.muted" })}>Evaluated</dt>
            <dd>{formatDate(c.evaluatedAt)}</dd>
            {c.geocodeResults.map((g, i) => (
              <div key={i} className={css({ display: "contents" })}>
                <dt className={css({ color: "text.muted" })}>
                  Lookup “{g.query}”
                </dt>
                <dd>
                  {g.formattedAddress || "no match"}{" "}
                  <span
                    className={css({
                      color: g.isStreetLevel ? "green.500" : "red.500",
                    })}
                  >
                    ({g.isStreetLevel ? "street-level" : "not street-level"})
                  </span>
                  {g.types.length > 0 && (
                    <span className={css({ color: "text.muted" })}>
                      {" "}
                      [{g.types.join(", ")}]
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </details>

        <div className={css({ display: "flex", gap: "2", flexWrap: "wrap" })}>
          {isLive && c.legacy && !c.legacy.liveListingInferred && (
            <span className={css({ fontSize: "sm", color: "orange.500" })}>
              Couldn't match its map listing; check Atlas before unpublishing.
            </span>
          )}
          {isLive && !(c.legacy && !c.legacy.liveListingInferred) && (
            <button
              disabled={isLoading}
              onClick={() => handleRevert(l)}
              className={css({
                bg: "red.500",
                color: "white",
                p: "1.5 3",
                borderRadius: "md",
                fontSize: "sm",
                fontWeight: "bold",
                cursor: "pointer",
                _hover: { bg: "red.600" },
                _disabled: { opacity: 0.6, cursor: "not-allowed" },
              })}
            >
              Unpublish &amp; send to review
            </button>
          )}
          {!isLive && (
            <Link href="/admin/reviews" className={linkButton}>
              Edit in review queue
            </Link>
          )}
          {atlas?.pendingListingsUrl && (
            <a
              href={atlas.pendingListingsUrl}
              target="_blank"
              rel="noreferrer"
              className={linkButton}
            >
              Atlas: pending_listings
            </a>
          )}
          {atlas?.listingsUrl && c.liveListingId && (
            <a
              href={atlas.listingsUrl}
              target="_blank"
              rel="noreferrer"
              className={linkButton}
            >
              Atlas: listings
            </a>
          )}
          <button className={linkButton} onClick={() => copyFilter(l._id)}>
            Copy pending _id filter
          </button>
          {c.liveListingId && (
            <button
              className={linkButton}
              onClick={() => copyFilter(c.liveListingId!)}
            >
              Copy live _id filter
            </button>
          )}
        </div>
      </div>
    );
  };

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
          alignItems: "center",
          mb: "6",
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
            Curation Reports
          </h1>
          <p className={css({ color: "text.muted", fontSize: "sm", mt: "1" })}>
            What each scout run found, what the AI auto-approved, and why.
          </p>
        </div>
        <Link
          href="/admin/reviews"
          className={css({
            bg: "brand.orange",
            color: "white",
            p: "2 4",
            borderRadius: "md",
            fontWeight: "bold",
            textDecoration: "none",
            _hover: { bg: "orange.600" },
          })}
        >
          Back to Reviews
        </Link>
      </div>

      <div
        className={css({
          display: "grid",
          gap: "6",
          lg: { gridTemplateColumns: "320px 1fr" },
        })}
      >
        <ul
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2",
          })}
        >
          {runs.map((r) => (
            <li key={r._id}>
              <button
                onClick={() => setSelectedRunId(r._id)}
                className={css({
                  width: "100%",
                  textAlign: "left",
                  p: "3",
                  borderRadius: "md",
                  border: "1px solid",
                  borderColor:
                    r._id === selectedRunId ? "brand.orange" : "border.light",
                  bg: r._id === selectedRunId ? "bg.surface" : "bg.canvas",
                  color: "text.main",
                  cursor: "pointer",
                })}
              >
                <div className={css({ fontWeight: "bold", fontSize: "sm" })}>
                  {formatDate(r.startedAt)}
                </div>
                <div className={css({ fontSize: "xs", color: "text.muted" })}>
                  {r.trigger} · {r.status} · “{r.query}”
                </div>
                <div className={css({ fontSize: "xs", mt: "1" })}>
                  <span
                    className={css({
                      color: "green.500",
                      fontWeight: "bold",
                    })}
                  >
                    {r.autoApproved} auto-approved
                  </span>{" "}
                  · {r.pendingReview} to review · {r.urls.length} URLs
                </div>
              </button>
            </li>
          ))}
          {runs.length === 0 && (
            <li className={css({ fontSize: "sm", color: "text.muted" })}>
              No scout runs logged yet. Runs are logged starting with the next
              cron or manual trigger.
            </li>
          )}
          <li>
            <button
              onClick={() => setSelectedRunId(LEGACY_ID)}
              className={css({
                width: "100%",
                textAlign: "left",
                p: "3",
                borderRadius: "md",
                border: "1px dashed",
                borderColor:
                  selectedRunId === LEGACY_ID ? "brand.orange" : "border.light",
                bg: selectedRunId === LEGACY_ID ? "bg.surface" : "bg.canvas",
                color: "text.main",
                cursor: "pointer",
              })}
            >
              <div className={css({ fontWeight: "bold", fontSize: "sm" })}>
                Before run logging
              </div>
              <div className={css({ fontSize: "xs", color: "text.muted" })}>
                Auto-approvals from the last {LEGACY_DAYS} days, reconstructed
              </div>
            </button>
          </li>
        </ul>

        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "4",
          })}
        >
          {selectedRunId === LEGACY_ID && (
            <div
              className={css({
                bg: "bg.surface",
                p: "4",
                borderRadius: "lg",
                border: "1px dashed",
                borderColor: "border.light",
                color: "text.main",
                fontSize: "sm",
              })}
            >
              These were auto-approved before scoring was recorded, so AI
              confidence and evidence aren&apos;t available. Checks are rebuilt
              from the stored fields, the source page is inferred from when each
              URL was scanned, and the map listing is matched by name and
              creation time. Listings a person approved by hand are excluded, so
              this won&apos;t exactly match the weekly approved count.
            </div>
          )}
          {selectedRun && (
            <div
              className={css({
                bg: "bg.surface",
                p: "4",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "border.light",
                color: "text.main",
                fontSize: "sm",
              })}
            >
              <div className={css({ fontWeight: "bold", mb: "2" })}>
                Query: “{selectedRun.query}” ({selectedRun.trigger})
              </div>
              {selectedRun.error && (
                <p className={css({ color: "red.500", mb: "2" })}>
                  Run failed: {selectedRun.error}
                </p>
              )}
              <ul
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "1",
                })}
              >
                {selectedRun.urls.map((u) => (
                  <li key={u.url}>
                    <span
                      className={css({
                        color: u.status === "error" ? "red.500" : "green.500",
                        fontWeight: "bold",
                        mr: "2",
                      })}
                    >
                      {u.status === "error" ? "✗" : `${u.count} new`}
                    </span>
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noreferrer"
                      className={css({
                        color: "blue.500",
                        wordBreak: "break-all",
                      })}
                    >
                      {u.url}
                    </a>
                    {u.error && (
                      <span className={css({ color: "text.muted" })}>
                        {" "}
                        — {u.error}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!atlas?.pendingListingsUrl && (
            <p className={css({ fontSize: "xs", color: "text.muted" })}>
              Tip: set ATLAS_COLLECTION_URL (an Atlas Data Explorer collection
              URL with the collection name replaced by
              {" {collection}"}) to get direct links to the database.
            </p>
          )}

          <h2
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              color: "text.main",
            })}
          >
            Auto-approved ({autoApproved.length})
          </h2>
          {isLoading && listings.length === 0 ? (
            <p className={css({ color: "text.muted" })}>Loading...</p>
          ) : autoApproved.length === 0 ? (
            <p className={css({ color: "text.muted" })}>
              Nothing was auto-approved in this run.
            </p>
          ) : (
            autoApproved.map(renderListing)
          )}

          {pendingReview.length > 0 && (
            <>
              <button
                onClick={() => setShowPending((v) => !v)}
                className={css({
                  alignSelf: "flex-start",
                  color: "text.main",
                  fontWeight: "bold",
                  cursor: "pointer",
                })}
              >
                {showPending ? "▾" : "▸"} Held for review (
                {pendingReview.length})
              </button>
              {showPending && pendingReview.map(renderListing)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
