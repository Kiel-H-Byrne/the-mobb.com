import { geocodeLocation } from "@app/actions/geo-search";
import { trackSearchExecuted } from "@/util/analytics";
import {
  DEFAULT_RADIUS_MILES,
  DirectoryLocation,
  RADIUS_OPTIONS,
  describeLocation,
} from "@/util/location";
import {
  CaretDownIcon,
  CrosshairIcon,
  GlobeHemisphereWestIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  SpinnerGapIcon,
  XIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import { FormEvent, useEffect, useRef, useState } from "react";

type LocationFilterProps = {
  value: DirectoryLocation | null;
  onChange: (location: DirectoryLocation | null) => void;
};

const optionButton = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  w: "full",
  h: "9",
  px: "3",
  borderRadius: "xl",
  border: "1px solid",
  borderColor: "white/10",
  bg: "white/5",
  color: "white",
  fontSize: "sm",
  cursor: "pointer",
  textAlign: "left",
  _hover: { borderColor: "brand.orange/50" },
  _disabled: { opacity: 0.6, cursor: "default" },
});

/**
 * Directory location filter: anywhere (default), near the user's location, or
 * a typed city/state/ZIP. Cities, ZIPs, and "near me" use a radius; states use
 * their boundaries.
 */
export const LocationFilter = ({ value, onChange }: LocationFilterProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState<number>(
    value?.kind === "radius" ? value.miles : DEFAULT_RADIUS_MILES,
  );
  const [busy, setBusy] = useState<"locate" | "search" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const apply = (location: DirectoryLocation | null) => {
    setError(null);
    onChange(location);
    setOpen(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Location isn't available in this browser.");
      return;
    }
    setBusy("locate");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(null);
        trackSearchExecuted({
          searchTerm: "Near Me",
          searchType: "nearby",
        });
        apply({
          kind: "radius",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          miles: radius,
          label: "you",
        });
      },
      () => {
        setBusy(null);
        setError("Couldn't get your location. Check location permissions.");
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const search = async (e: FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setBusy("search");
    setError(null);
    try {
      const place = await geocodeLocation(query);
      if (!place) {
        setError(`Couldn't find "${query.trim()}".`);
        return;
      }
      trackSearchExecuted({
        searchTerm: place.label || query.trim(),
        searchType: "location",
      });
      if (place.isRegion && place.bounds) {
        apply({
          kind: "region",
          bounds: place.bounds,
          label: place.label,
          names: place.regionNames,
        });
      } else {
        apply({
          kind: "radius",
          lat: place.lat,
          lng: place.lng,
          miles: radius,
          label: place.label,
        });
      }
      setQuery("");
    } catch {
      setError("Location search failed. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const pickRadius = (miles: number) => {
    setRadius(miles);
    if (value?.kind === "radius") onChange({ ...value, miles });
  };

  const showRadius = value?.kind !== "region";

  return (
    <div ref={rootRef} className={css({ position: "relative" })}>
      <div
        className={css({
          display: "inline-flex",
          alignItems: "center",
          h: { base: "8", lg: "7" },
          borderRadius: "full",
          border: "1px solid",
          borderColor: value ? "brand.orange" : "white/15",
          bg: value ? "brand.orangeMuted" : "white/5",
          color: value ? "brand.orange" : "gray.300",
          fontSize: { base: "xs", lg: "11px" },
          fontWeight: "bold",
          transition: "border-color 0.2s, background 0.2s",
        })}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "1.5",
            h: "full",
            pl: "3",
            pr: value ? "1.5" : "3",
            bg: "transparent",
            border: "none",
            color: "inherit",
            font: "inherit",
            cursor: "pointer",
            maxW: { base: "60vw", md: "320px" },
          })}
        >
          <MapPinIcon weight={value ? "fill" : "regular"} size={13} />
          <span
            className={css({
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
          >
            {value ? describeLocation(value) : "Anywhere"}
          </span>
          {!value && <CaretDownIcon size={10} weight="bold" />}
        </button>
        {value && (
          <button
            type="button"
            aria-label="Clear location"
            onClick={() => apply(null)}
            className={css({
              display: "inline-flex",
              alignItems: "center",
              h: "full",
              pl: "1",
              pr: "2.5",
              bg: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            })}
          >
            <XIcon weight="bold" size={10} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-label="Filter by location"
          className={css({
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 50,
            w: "min(340px, calc(100vw - 32px))",
            display: "flex",
            flexDir: "column",
            gap: "3",
            p: "3",
            borderRadius: "2xl",
            bg: "rgba(11, 11, 14, 0.96)",
            backdropFilter: "blur(16px)",
            border: "1px solid",
            borderColor: "white/10",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            animation: "fadeIn",
          })}
        >
          <button
            type="button"
            onClick={useMyLocation}
            disabled={busy !== null}
            className={optionButton}
          >
            {busy === "locate" ? (
              <SpinnerGapIcon
                size={16}
                className={css({ animation: "spin" })}
              />
            ) : (
              <CrosshairIcon
                size={16}
                weight="bold"
                className={css({ color: "brand.orange" })}
              />
            )}
            Use my location
          </button>

          <form
            onSubmit={search}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              h: "9",
              px: "3",
              borderRadius: "xl",
              bg: "white/5",
              border: "1px solid",
              borderColor: "white/10",
              color: "gray.400",
              _focusWithin: { borderColor: "brand.orange/50" },
            })}
          >
            <MagnifyingGlassIcon size={14} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, state, or ZIP"
              aria-label="City, state, or ZIP"
              className={css({
                flex: 1,
                minW: 0,
                bg: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "sm",
              })}
            />
            {busy === "search" ? (
              <SpinnerGapIcon
                size={14}
                className={css({ animation: "spin" })}
              />
            ) : (
              <button
                type="submit"
                disabled={query.trim().length < 2}
                className={css({
                  bg: "transparent",
                  border: "none",
                  color: "brand.orange",
                  fontSize: "xs",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _disabled: { color: "gray.600", cursor: "default" },
                })}
              >
                Go
              </button>
            )}
          </form>

          {showRadius && (
            <div
              className={css({ display: "flex", flexDir: "column", gap: "2" })}
            >
              <span className={css({ fontSize: "xs", color: "gray.500" })}>
                Radius
              </span>
              <div
                role="radiogroup"
                aria-label="Radius"
                className={css({ display: "flex", gap: "2" })}
              >
                {RADIUS_OPTIONS.map((miles) => {
                  const isOn = radius === miles;
                  return (
                    <button
                      key={miles}
                      type="button"
                      role="radio"
                      aria-checked={isOn}
                      onClick={() => pickRadius(miles)}
                      className={css({
                        flex: 1,
                        h: "8",
                        borderRadius: "lg",
                        border: "1px solid",
                        borderColor: isOn ? "brand.orange" : "white/10",
                        bg: isOn ? "brand.orange" : "white/5",
                        color: isOn ? "black" : "gray.300",
                        fontSize: "xs",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "background 0.2s, color 0.2s",
                      })}
                    >
                      {miles} mi
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className={css({ fontSize: "xs", color: "red.400" })}
            >
              {error}
            </p>
          )}

          {value && (
            <button
              type="button"
              onClick={() => apply(null)}
              className={optionButton}
            >
              <GlobeHemisphereWestIcon size={16} />
              Search anywhere
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
