import type { CategoryCount } from "@/util/categories";
import { trackSearchExecuted } from "@/util/analytics";
import {
  CaretDownIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_COLLAPSED_COUNT = 12;

export type CategoryPillsVariant = "inline" | "floating";

const rowClass = css({
  display: "flex",
  gap: "2",
  alignItems: "center",
});

const Pill = memo(
  ({
    name,
    count,
    isOn,
    onToggle,
    floating,
  }: {
    name: string;
    count: number;
    isOn: boolean;
    onToggle: (name: string) => void;
    floating?: boolean;
  }) => (
    <button
      type="button"
      aria-pressed={isOn}
      onClick={() => {
        if (!isOn) {
          trackSearchExecuted({
            searchTerm: name,
            searchType: "category",
            resultCount: count,
          });
        }
        onToggle(name);
      }}
      className={css({
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        // Compact on desktop, roomier touch targets on small screens.
        h: { base: "8", lg: "7" },
        gap: { base: "2", lg: "1.5" },
        pl: { base: "3", lg: "2.5" },
        pr: { base: "2", lg: "1.5" },
        fontSize: { base: "xs", lg: "11px" },
        borderRadius: "full",
        border: "1px solid",
        borderColor: isOn ? "brand.orange" : "border.light",
        // Floating pills sit over the map, so they need an opaque glass fill.
        bg: isOn
          ? "brand.orange"
          : floating
            ? { base: "rgba(255, 255, 255, 0.92)", _dark: "rgba(21, 21, 26, 0.85)" }
            : { base: "black/5", _dark: "white/5" },
        backdropFilter: floating ? "blur(12px)" : "none",
        boxShadow: floating
          ? { base: "0 2px 8px rgba(0,0,0,0.08)", _dark: "0 4px 12px rgba(0,0,0,0.35)" }
          : "none",
        color: isOn ? { base: "white", _dark: "black" } : { base: "gray.800", _dark: "gray.300" },
        fontWeight: isOn ? "bold" : "medium",
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition:
          "background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s",
        _hover: {
          borderColor: "brand.orange",
          color: isOn ? { base: "white", _dark: "black" } : { base: "text.main", _dark: "white" },
        },
        _active: { transform: "scale(0.95)" },
        _focusVisible: {
          outline: "2px solid",
          outlineColor: "brand.orange",
          outlineOffset: "2px",
        },
      })}
    >
      {name}
      <span
        className={css({
          fontFamily: "tech",
          fontSize: { base: "10px", lg: "9px" },
          px: "1.5",
          py: "0.5",
          borderRadius: "full",
          bg: isOn ? { base: "white/25", _dark: "black/15" } : { base: "black/6", _dark: "white/5" },
          color: isOn ? { base: "white", _dark: "black" } : { base: "gray.600", _dark: "gray.500" },
        })}
      >
        {count.toLocaleString()}
      </span>
      {isOn && <XIcon weight="bold" size={10} />}
    </button>
  ),
);

type CategoryPillsProps = {
  /** Category counts, most common first. `undefined` renders a loading row. */
  categories: CategoryCount[] | undefined;
  selected: Set<string>;
  onToggle: (name: string) => void;
  /** When provided, a "Clear" pill appears while anything is selected. */
  onClear?: () => void;
  /** "floating" adds glass backgrounds for use over the map. */
  variant?: CategoryPillsVariant;
  /** Pills shown in the row before the "+N" toggle. */
  collapsedCount?: number;
};

/**
 * Toggleable category tags, most common first, in a single swipeable row.
 * Selected tags always stay in the row. The "+N" toggle is pinned to the right
 * edge and opens the full, searchable list as an overlay so it never pushes
 * surrounding content around. Fits sidebars, mobile overlays, and full pages.
 */
export const CategoryPills = ({
  categories,
  selected,
  onToggle,
  onClear,
  variant = "inline",
  collapsedCount = DEFAULT_COLLAPSED_COUNT,
}: CategoryPillsProps) => {
  const floating = variant === "floating";
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  // Selected first so active filters never disappear into the long tail.
  const collapsed = useMemo(() => {
    if (!categories) return [];
    const picked = categories.filter((c) => selected.has(c.name));
    const rest = categories
      .filter((c) => !selected.has(c.name))
      .slice(0, Math.max(0, collapsedCount - picked.length));
    return [...picked, ...rest];
  }, [categories, selected, collapsedCount]);

  const searched = useMemo(() => {
    if (!categories || !expanded) return [];
    const q = query.trim().toLowerCase();
    return q
      ? categories.filter((c) => c.name.toLowerCase().includes(q))
      : categories;
  }, [categories, expanded, query]);

  // The full list is an overlay, so close it on outside click or Escape.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  if (!categories) {
    return (
      <div className={rowClass} aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={css({
              h: { base: "8", lg: "7" },
              w: "24",
              flexShrink: 0,
              borderRadius: "full",
              bg: floating ? "rgba(21, 21, 26, 0.6)" : "white/5",
              animation: "pulse",
            })}
          />
        ))}
      </div>
    );
  }

  const hiddenCount = categories.length - collapsed.length;

  const toggleExpanded = () => {
    setExpanded((v) => !v);
    setQuery("");
  };

  return (
    <div
      ref={rootRef}
      className={css({
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "2",
        minW: 0,
      })}
    >
      {/* Swipeable row; the right edge fades to hint at more to scroll */}
      <div
        className={css({
          flex: 1,
          minW: 0,
          display: "flex",
          gap: "2",
          alignItems: "center",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          maskImage:
            "linear-gradient(to right, black calc(100% - 24px), transparent)",
        })}
      >
        {onClear && selected.size > 0 && (
          <button
            type="button"
            onClick={onClear}
            className={css({
              flexShrink: 0,
              h: { base: "8", lg: "7" },
              px: { base: "3", lg: "2.5" },
              fontSize: { base: "xs", lg: "11px" },
              borderRadius: "full",
              border: "1px solid",
              borderColor: "brand.orange",
              bg: floating ? { base: "rgba(255, 255, 255, 0.92)", _dark: "rgba(21, 21, 26, 0.85)" } : { base: "brand.orangeMuted", _dark: "transparent" },
              color: "brand.orange",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              cursor: "pointer",
              animation: "fadeIn",
              _hover: { borderColor: "brand.orangeHover" },
            })}
          >
            Clear ({selected.size})
          </button>
        )}
        {collapsed.map((c) => (
          <Pill
            key={c.name}
            name={c.name}
            count={c.count}
            isOn={selected.has(c.name)}
            onToggle={onToggle}
            floating={floating}
          />
        ))}
        {/* Spacer so the last pill can scroll clear of the fade */}
        <span aria-hidden className={css({ flexShrink: 0, w: "4" })} />
      </div>

      {/* Pinned toggle: always visible, never scrolled out of view */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-haspopup="dialog"
          title="Show all categories"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1",
            flexShrink: 0,
            h: { base: "8", lg: "7" },
            px: { base: "3", lg: "2.5" },
            fontSize: { base: "xs", lg: "11px" },
            borderRadius: "full",
            border: "1px solid",
            borderColor: expanded ? "brand.orange" : "border.light",
            bg: floating ? { base: "rgba(255, 255, 255, 0.92)", _dark: "rgba(21, 21, 26, 0.9)" } : { base: "black/5", _dark: "white/5" },
            backdropFilter: floating ? "blur(12px)" : "none",
            color: "brand.orange",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            cursor: "pointer",
            _hover: { borderColor: "brand.orangeHover" },
          })}
        >
          {expanded ? "Close" : `+${hiddenCount}`}
          <CaretDownIcon
            size={10}
            weight="bold"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>
      )}

      {/* Full list: overlays content below instead of pushing it down */}
      {expanded && (
        <div
          role="dialog"
          aria-label="All categories"
          className={css({
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 40,
            display: "flex",
            flexDir: "column",
            gap: "3",
            p: "3",
            borderRadius: "2xl",
            bg: { base: "rgba(255, 255, 255, 0.98)", _dark: "rgba(11, 11, 14, 0.96)" },
            backdropFilter: "blur(16px)",
            border: "1px solid",
            borderColor: "border.light",
            boxShadow: {
              base: "0 20px 40px rgba(0,0,0,0.12)",
              _dark: "0 20px 40px rgba(0,0,0,0.5)",
            },
            animation: "fadeIn",
          })}
        >
          <label
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              h: { base: "9", lg: "8" },
              px: "3",
              borderRadius: "xl",
              bg: { base: "black/4", _dark: "white/5" },
              border: "1px solid",
              borderColor: "border.light",
              color: { base: "gray.600", _dark: "gray.400" },
              _focusWithin: { borderColor: "brand.orange" },
            })}
          >
            <MagnifyingGlassIcon size={14} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${categories.length} categories`}
              className={css({
                flex: 1,
                minW: 0,
                bg: "transparent",
                border: "none",
                outline: "none",
                color: "text.main",
                fontSize: "sm",
                _placeholder: { color: { base: "gray.500", _dark: "gray.500" } },
              })}
            />
          </label>
          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              gap: "2",
              maxH: { base: "50dvh", md: "280px" },
              overflowY: "auto",
              overscrollBehavior: "contain",
            })}
          >
            {searched.map((c) => (
              <Pill
                key={c.name}
                name={c.name}
                count={c.count}
                isOn={selected.has(c.name)}
                onToggle={onToggle}
              />
            ))}
            {searched.length === 0 && (
              <span className={css({ color: { base: "gray.600", _dark: "gray.500" }, fontSize: "sm" })}>
                No categories match &ldquo;{query}&rdquo;.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPills;
