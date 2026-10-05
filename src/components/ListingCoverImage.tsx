"use client";

import { Listing } from "@/db/Types";
import { css, cx } from "@styled/css";
import Image from "next/image";
import { ReactNode, memo, useReducer } from "react";

export const PLACEHOLDER_IMAGE = "/images/mobb_placeholder.png";

// URLs that failed to load this session, shared across every card/panel so a
// broken image is only requested once and other views skip straight past it.
const brokenSrcs = new Set<string>();

// next/image throws on malformed src strings, so only accept absolute http(s)
// URLs, protocol-relative URLs, or root-relative paths.
const normalizeSrc = (src: unknown): string | null => {
  if (typeof src !== "string") return null;
  const trimmed = src.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
};

/** Ordered, de-duplicated image candidates for a listing (image → og_image). */
export const getListingImageCandidates = (
  listing: Pick<Listing, "image" | "og_image">,
): string[] => {
  const raw = [
    typeof listing.image === "string"
      ? listing.image
      : (listing.image as any)?.url,
    listing.og_image,
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of raw) {
    const src = normalizeSrc(candidate);
    if (src && !seen.has(src)) {
      seen.add(src);
      out.push(src);
    }
  }
  return out;
};

type ListingCoverImageProps = {
  listing: Pick<Listing, "image" | "og_image" | "name" | "og_title">;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Rendered when no candidate loads. Defaults to the MOBB placeholder. */
  fallback?: ReactNode;
};

/**
 * Fills its (position: relative) parent with the listing's image, falling back
 * through og_image to a placeholder when a source is missing, malformed, or
 * fails to load.
 */
const ListingCoverImage = ({
  listing,
  className,
  sizes = "(max-width: 768px) 100vw, 480px",
  priority,
  fallback,
}: ListingCoverImageProps) => {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const src = getListingImageCandidates(listing).find(
    (candidate) => !brokenSrcs.has(candidate),
  );
  const alt = listing.name || listing.og_title || "Listing image";

  if (!src) {
    return fallback !== undefined ? (
      <>{fallback}</>
    ) : (
      <Image
        src={PLACEHOLDER_IMAGE}
        alt=""
        fill
        sizes={sizes}
        className={css({ objectFit: "cover" })}
      />
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => {
        brokenSrcs.add(src);
        rerender();
      }}
      className={cx(css({ objectFit: "cover" }), className)}
    />
  );
};

export default memo(ListingCoverImage);
