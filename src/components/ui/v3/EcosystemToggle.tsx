import { GlobeHemisphereWestIcon, GridFourIcon, TargetIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import Link from "next/link";
import React from "react";
import { VIEW_TO_PARAM, type ViewMode } from "@/util/view";

export type { ViewMode };

interface OwnProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  /** Slides the dock off-screen on mobile (e.g. while a bottom sheet is open). */
  hiddenOnMobile?: boolean;
}

export const EcosystemToggle = React.memo(({ activeView, setActiveView, hiddenOnMobile = false }: OwnProps) => {
  return (
    <div
      className={css({
        position: "fixed",
        top: { base: "auto", md: "8" },
        bottom: { base: "4", md: "auto" },
        left: "50%",
        transform: {
          base: hiddenOnMobile ? "translate(-50%, 150%)" : "translateX(-50%)",
          md: "translateX(-50%)",
        },
        opacity: { base: hiddenOnMobile ? 0 : 1, md: 1 },
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "1",
        p: "1.5",
        bg: { base: "rgba(255, 255, 255, 0.90)", _dark: "rgba(11, 11, 14, 0.75)" },
        backdropFilter: "blur(24px)",
        border: "1px solid",
        borderColor: "border.light",
        borderRadius: "full",
        boxShadow: {
          base: "0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
          _dark: "0 20px 40px rgba(0,0,0,0.5)",
        },
        pointerEvents: { base: hiddenOnMobile ? "none" : "auto", md: "auto" },
      })}
    >
      {[
        { id: "RADAR", label: "Local Map", icon: <TargetIcon weight={activeView === "RADAR" ? "fill" : "regular"} size={20} /> },
        { id: "GRID", label: "Directory", icon: <GridFourIcon weight={activeView === "GRID" ? "fill" : "regular"} size={20} /> },
        { id: "ORBIT", label: "Online Only", icon: <GlobeHemisphereWestIcon weight={activeView === "ORBIT" ? "fill" : "regular"} size={20} /> }
      ].map((item) => {
        const viewId = item.id as ViewMode;
        const isActive = activeView === viewId;
        const param = VIEW_TO_PARAM[viewId];
        const href = param === "map" ? "/" : `/?view=${param}`;
        return (
          <Link
            key={item.id}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              setActiveView(viewId);
            }}
            className={`group ${css({
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "2",
              px: { base: "4", md: "6" },
              py: "3",
              borderRadius: "full",
              color: isActive ? { base: "white", _dark: "black" } : { base: "gray.700", _dark: "gray.400" },
              fontFamily: "tech",
              fontSize: "xs",
              fontWeight: "bold",
              letterSpacing: "widest",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
              _hover: {
                color: isActive ? { base: "white", _dark: "black" } : { base: "text.main", _dark: "white" },
              },
            })}`}
          >
            {/* Active Background Pill */}
            {isActive && (
              <div
                className={css({
                  position: "absolute",
                  inset: 0,
                  bg: "brand.orange",
                  borderRadius: "full",
                  boxShadow: {
                    base: "0 4px 14px rgba(194, 65, 12, 0.35)",
                    _dark: "0 0 20px rgba(255, 90, 0, 0.4)",
                  },
                  zIndex: -1,
                })}
              ></div>
            )}
            {/* Brief ping ring on activation */}
            {isActive && (
              <div
                className={css({
                  position: "absolute",
                  inset: 0,
                  border: "2px solid",
                  borderColor: "brand.orange",
                  borderRadius: "full",
                  zIndex: -1,
                  pointerEvents: "none",
                  animation: "pillPing",
                })}
              ></div>
            )}

            <div
              className={css({
                color: isActive ? { base: "white", _dark: "black" } : "brand.orange",
                transition: "color 0.3s",
                _groupHover: {
                  color: isActive ? { base: "white", _dark: "black" } : "brand.orangeHover",
                },
              })}
            >
              {item.icon}
            </div>

            <span className={css({
              display: { base: isActive ? "block" : "none", md: "block" },
              whiteSpace: "nowrap"
            })}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
});

export default EcosystemToggle;
