import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@app/actions/geo-search", () => ({
  searchBusinesses: vi.fn().mockResolvedValue([]),
}));

const props = {
  mapInstance: null,
  setactiveListing: vi.fn(),
  setisDrawerOpen: vi.fn(),
};

// jsdom has no layout, so mark which copy is "visible" by stubbing its rects.
const setVisible = (input: HTMLElement, visible: boolean) => {
  input.getClientRects = () =>
    (visible ? [{}] : []) as unknown as DOMRectList;
};

describe("MapAutoComplete keyboard shortcut", () => {
  it.each([
    ["Ctrl+K", { ctrlKey: true, key: "k" }],
    ["⌘K", { metaKey: true, key: "k" }],
    ["Ctrl+Shift+K / Caps Lock", { ctrlKey: true, key: "K" }],
  ])("%s focuses the visible search box", (_, keys) => {
    render(<MapAutoComplete {...props} />);
    const input = screen.getByRole("textbox", { name: "Search The MOBB" });
    setVisible(input, true);

    const event = fireEvent.keyDown(window, keys);

    expect(document.activeElement).toBe(input);
    expect(event).toBe(false); // default prevented (browser's own Ctrl+K)
  });

  it("focuses the visible copy when a hidden duplicate comes first", () => {
    // Mirrors the page: mobile copy (hidden on desktop) renders before desktop.
    render(
      <>
        <MapAutoComplete {...props} />
        <MapAutoComplete {...props} />
      </>,
    );
    const [hiddenMobile, desktop] = screen.getAllByRole("textbox", {
      name: "Search The MOBB",
    });
    setVisible(hiddenMobile, false);
    setVisible(desktop, true);

    fireEvent.keyDown(window, { ctrlKey: true, key: "k" });

    expect(document.activeElement).toBe(desktop);
  });

  it("leaves Ctrl+K to the browser when no search box is visible", () => {
    render(<MapAutoComplete {...props} />);
    setVisible(screen.getByRole("textbox", { name: "Search The MOBB" }), false);

    const event = fireEvent.keyDown(window, { ctrlKey: true, key: "k" });

    expect(event).toBe(true); // not prevented
  });

  it("Escape leaves the search box", () => {
    render(<MapAutoComplete {...props} />);
    const input = screen.getByRole("textbox", { name: "Search The MOBB" });
    input.focus();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(document.activeElement).not.toBe(input);
  });
});
