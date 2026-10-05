import ListingCoverImage, {
  PLACEHOLDER_IMAGE,
  getListingImageCandidates,
} from "@/components/ListingCoverImage";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Render next/image as a plain <img> so error events can be fired directly.
vi.mock("next/image", () => ({
  default: ({ src, alt, onError }: any) => (
    <img src={src} alt={alt} onError={onError} />
  ),
}));

describe("getListingImageCandidates", () => {
  it("orders image before og_image and drops duplicates", () => {
    expect(
      getListingImageCandidates({
        image: { url: "https://a.com/x.jpg" },
        og_image: "https://a.com/x.jpg",
      }),
    ).toEqual(["https://a.com/x.jpg"]);
  });

  it("drops malformed sources and fixes protocol-relative URLs", () => {
    expect(
      getListingImageCandidates({
        image: { url: "not a url" },
        og_image: "//cdn.example.com/og.png",
      }),
    ).toEqual(["https://cdn.example.com/og.png"]);
    expect(
      getListingImageCandidates({ image: { url: "undefined" } } as any),
    ).toEqual([]);
  });
});

describe("ListingCoverImage", () => {
  it("falls back image → og_image → placeholder as each fails to load", () => {
    render(
      <ListingCoverImage
        listing={{
          name: "Shop",
          image: { url: "https://broken.test/one.jpg" },
          og_image: "https://broken.test/two.jpg",
        }}
      />,
    );

    let img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("https://broken.test/one.jpg");

    fireEvent.error(img);
    img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("https://broken.test/two.jpg");

    fireEvent.error(img);
    expect(screen.getByRole("presentation").getAttribute("src")).toBe(
      PLACEHOLDER_IMAGE,
    );
  });

  it("skips sources already known to be broken", () => {
    render(
      <ListingCoverImage
        listing={{ name: "Other", image: { url: "https://broken.test/one.jpg" } }}
      />,
    );
    expect(screen.getByRole("presentation").getAttribute("src")).toBe(
      PLACEHOLDER_IMAGE,
    );
  });

  it("renders a custom fallback when nothing loads", () => {
    render(
      <ListingCoverImage
        listing={{ name: "None" }}
        fallback={<span>no image</span>}
      />,
    );
    expect(screen.getByText("no image")).toBeTruthy();
  });
});
