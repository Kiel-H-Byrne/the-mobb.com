// src/components/ui/v3/ReportListingModal.tsx
"use client";

import { toaster } from "@/components/ui/Toast";
import { ReportReason } from "@/db/Types";
import { useAppStore } from "@/store/useAppStore";
import { submitListingReport } from "@app/actions/feedback";
import {
  ChatTextIcon,
  FlagIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { useState } from "react";

const REASONS: { key: ReportReason; label: string; desc: string }[] = [
  {
    key: "CLOSED",
    label: "Permanently Closed",
    desc: "Business is no longer open or operating.",
  },
  {
    key: "INCORRECT_ADDRESS",
    label: "Wrong Address / Location",
    desc: "Moved, wrong street number, or inaccurate pin.",
  },
  {
    key: "NOT_BLACK_OWNED",
    label: "Not Black-Owned",
    desc: "Ownership changed or misidentified in curation.",
  },
  {
    key: "WRONG_CONTACT",
    label: "Wrong Phone or Website",
    desc: "Broken link, wrong number, or outdated details.",
  },
  {
    key: "OTHER",
    label: "Other Inaccuracy",
    desc: "Any other details that require moderator review.",
  },
];

export const ReportListingModal = () => {
  const isReportModalOpen = useAppStore((s) => s.isReportModalOpen);
  const setIsReportModalOpen = useAppStore((s) => s.setIsReportModalOpen);
  const reportingListing = useAppStore((s) => s.reportingListing);
  const setReportingListing = useAppStore((s) => s.setReportingListing);
  const currentUser = useAppStore((s) => s.currentUser);
  const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);
  const setAuthModalSuccessCallback = useAppStore((s) => s.setAuthModalSuccessCallback);

  const [selectedReason, setSelectedReason] = useState<ReportReason>("CLOSED");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isReportModalOpen || !reportingListing) return null;

  const handleClose = () => {
    setIsReportModalOpen(false);
    setReportingListing(null);
    setErrorMessage("");
    setComment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setIsReportModalOpen(false);
      setAuthModalSuccessCallback(() => {
        setIsReportModalOpen(true);
      });
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const listingId = String((reportingListing as any)._id);
      const res = await submitListingReport({
        listingId,
        reason: selectedReason,
        comment,
      });

      if (res.success) {
        if (res.isDelisted) {
          toaster.create({
            title: "Listing De-listed",
            description: `Thank you, ${currentUser.name || currentUser.email}. This listing reached ${res.deverifierCount} community reports and has been hidden from the map for admin review.`,
            type: "warning",
          });
        } else {
          toaster.create({
            title: "Feedback Recorded",
            description: "Your report has been logged. Thank you for keeping The MOBB accurate!",
            type: "success",
          });
        }
        handleClose();
      } else if (res.requiresAuth) {
        setIsReportModalOpen(false);
        setIsAuthModalOpen(true);
      } else {
        setErrorMessage(res.error || "Failed to submit report.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        p: "4",
        pointerEvents: "auto",
        animation: "fadeIn 0.2s ease",
      })}
    >
      <div
        className={css({
          w: "full",
          maxW: "460px",
          bg: "bg.glass",
          backdropFilter: "blur(24px)",
          border: "1px solid",
          borderColor: "white/15",
          borderRadius: "2xl",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          p: "6",
          display: "flex",
          flexDirection: "column",
          gap: "4",
          animation: "slideUp 0.25s ease",
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          })}
        >
          <div>
            <div className={css({ display: "flex", alignItems: "center", gap: "2", mb: "1" })}>
              <FlagIcon size={16} weight="fill" className={css({ color: "brand.orange" })} />
              <span
                className={css({
                  fontFamily: "tech",
                  fontSize: "xs",
                  letterSpacing: "wider",
                  color: "brand.orange",
                })}
              >
                COMMUNITY MODERATION
              </span>
            </div>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "white" })}>
              Report Inaccuracy
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={css({
              color: "gray.400",
              cursor: "pointer",
              bg: "transparent",
              border: "none",
              p: "1",
              borderRadius: "full",
              _hover: { color: "white", bg: "white/10" },
            })}
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        {/* Business Preview */}
        <div
          className={css({
            p: "3",
            borderRadius: "xl",
            bg: "rgba(255,255,255,0.03)",
            border: "1px solid",
            borderColor: "white/10",
          })}
        >
          <div className={css({ fontSize: "sm", fontWeight: "bold", color: "white" })}>
            {reportingListing.name || reportingListing.og_title}
          </div>
          <div className={css({ fontSize: "xs", color: "gray.400", mt: "0.5" })}>
            {reportingListing.address || "Online Only"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
          <label className={css({ fontSize: "xs", fontWeight: "bold", color: "gray.300" })}>
            What is inaccurate about this listing?
          </label>

          <div className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            {REASONS.map((r) => {
              const isSelected = selectedReason === r.key;
              return (
                <div
                  key={r.key}
                  onClick={() => setSelectedReason(r.key)}
                  className={css({
                    p: "3",
                    borderRadius: "xl",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected ? "brand.orange" : "white/10",
                    bg: isSelected ? "rgba(255,90,0,0.12)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "3",
                    _hover: { borderColor: isSelected ? "brand.orange" : "white/30" },
                  })}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    checked={isSelected}
                    onChange={() => setSelectedReason(r.key)}
                    className={css({ accentColor: "#FF5A00", mt: "1" })}
                  />
                  <div>
                    <div
                      className={css({
                        fontSize: "xs",
                        fontWeight: "bold",
                        color: isSelected ? "brand.orange" : "white",
                      })}
                    >
                      {r.label}
                    </div>
                    <div className={css({ fontSize: "11px", color: "gray.400", mt: "0.5" })}>
                      {r.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className={css({ display: "block", fontSize: "xs", color: "gray.400", mb: "1" })}>
              Additional Details / Evidence (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="e.g., Visited yesterday and store is permanently closed, new business moved in..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={css({
                w: "full",
                p: "2.5",
                bg: "rgba(0,0,0,0.5)",
                border: "1px solid",
                borderColor: "white/15",
                borderRadius: "lg",
                color: "white",
                fontSize: "xs",
                resize: "none",
                _focus: { borderColor: "brand.orange", outline: "none" },
              })}
            />
          </div>

          {errorMessage && (
            <div
              className={css({
                p: "2.5",
                borderRadius: "md",
                bg: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "red.400",
                fontSize: "xs",
                display: "flex",
                alignItems: "center",
                gap: "2",
              })}
            >
              <WarningCircleIcon size={16} weight="fill" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div
            className={css({
              fontSize: "11px",
              color: "gray.500",
              lineHeight: "snug",
            })}
          >
            🛡️ <strong>Group Economics Integrity:</strong> When 3 unique registered members report this listing, it will be automatically hidden from the map for moderator verification.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={css({
              w: "full",
              py: "3",
              bg: "red.500",
              color: "white",
              fontWeight: "bold",
              fontSize: "sm",
              borderRadius: "xl",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
              opacity: isSubmitting ? 0.7 : 1,
              _hover: { bg: "red.600" },
              transition: "all 0.2s",
            })}
          >
            {isSubmitting ? "Submitting Report..." : "Submit Community Report"}
          </button>
        </form>
      </div>
    </div>
  );
};
