import { GlobeHemisphereWestIcon, GridFourIcon, TargetIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import React from "react";

export type ViewMode = "RADAR" | "GRID" | "ORBIT";

interface OwnProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
}

export const EcosystemToggle = React.memo(({ activeView, setActiveView }: OwnProps) => {
  return (
    <div
      className={css({
        position: "fixed",
        top: { base: "auto", md: "8" },
        bottom: { base: "8", md: "auto" },
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "1",
        p: "1.5",
        bg: "rgba(11, 11, 14, 0.75)",
        backdropFilter: "blur(24px)",
        border: "1px solid",
        borderColor: "white/10",
        borderRadius: "full",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        pointerEvents: "auto",
      })}
    >
      {[
        { id: "RADAR", label: "Local Radar", icon: <TargetIcon weight={activeView === "RADAR" ? "fill" : "regular"} size={20} /> },
        { id: "GRID", label: "Global Grid", icon: <GridFourIcon weight={activeView === "GRID" ? "fill" : "regular"} size={20} /> },
        { id: "ORBIT", label: "Online Only", icon: <GlobeHemisphereWestIcon weight={activeView === "ORBIT" ? "fill" : "regular"} size={20} /> }
      ].map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewMode)}
            className={`group ${css({
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "2",
              px: { base: "4", md: "6" },
              py: "3",
              borderRadius: "full",
              color: isActive ? "black" : "gray.400",
              fontFamily: "tech",
              fontSize: "xs",
              fontWeight: "bold",
              letterSpacing: "widest",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
              _hover: {
                color: isActive ? "black" : "white",
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
                  boxShadow: "0 0 20px rgba(255, 90, 0, 0.4)",
                  zIndex: -1,
                  animation: "pulseSlow",
                })}
              ></div>
            )}

            <div
              className={css({
                color: isActive ? "black" : "brand.orange",
                transition: "color 0.3s",
                _groupHover: {
                  color: isActive ? "black" : "brand.orangeHover",
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
          </button>
        );
      })}
    </div>
  );
});

export default EcosystemToggle;
