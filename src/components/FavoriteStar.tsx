"use client";

import { toaster } from "@/components/ui/Toast";
import { Listing } from "@/db/Types";
import { useAppStore } from "@/store/useAppStore";
import { trackPlaceSaved } from "@/util/analytics";
import { css } from "@styled/css";
import React from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

interface Props {
  _id: string;
  listing?: Listing;
}

const FavoriteStar = ({ _id, listing }: Props) => {
  const currentUser = useAppStore((s) => s.currentUser);
  const setIsAuthModalOpen = useAppStore((s) => s.setIsAuthModalOpen);
  const setAuthModalSuccessCallback = useAppStore(
    (s) => s.setAuthModalSuccessCallback,
  );
  const savedListings = useAppStore((s) => s.savedListings);
  const setSavedListings = useAppStore((s) => s.setSavedListings);

  const isFav = savedListings.some(
    (l) => String((l as any)._id) === String(_id),
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUser) {
      setAuthModalSuccessCallback(() => {
        toaster.create({
          title: "Ready to save favorites",
          description: "You can now bookmark your favorite businesses.",
          type: "info",
        });
      });
      setIsAuthModalOpen(true);
      toaster.create({
        title: "Sign in required",
        description: "Please sign in or register to save your favorites.",
        type: "info",
      });
      return;
    }

    if (isFav) {
      const remaining = savedListings.filter(
        (l) => String((l as any)._id) !== String(_id),
      );
      setSavedListings(remaining);
      if (listing) {
        trackPlaceSaved(listing, false);
      }
      toaster.create({
        title: "Removed from favorites",
        type: "info",
      });
    } else {
      const toAdd: Listing = listing || ({ _id, name: "Favorite Place" } as any);
      setSavedListings([...savedListings, toAdd]);
      trackPlaceSaved(toAdd, true);
      toaster.create({
        title: "Added to favorites",
        type: "success",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className={css({
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        padding: "1",
        borderRadius: "full",
        transition: "transform 0.15s ease",
        _hover: { transform: "scale(1.15)" },
      })}
    >
      {isFav ? (
        <span
          className={css({ color: "brand.orange", display: "inline-flex" })}
        >
          <MdFavorite size={24} />
        </span>
      ) : (
        <span className={css({ color: "gray.400", display: "inline-flex" })}>
          <MdFavoriteBorder size={24} />
        </span>
      )}
    </button>
  );
};

export default FavoriteStar;
