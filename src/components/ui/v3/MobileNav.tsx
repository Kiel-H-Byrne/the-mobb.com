import { css } from "@styled/css";

interface MobileNavProps {
    activeNav?: "nearme" | "explore" | "saved";
    onNearMeClick?: () => void;
    onExploreClick?: () => void;
    onAddListingClick?: () => void;
}

/**
 * The Community Pulse
 * Dynamic, pill-shaped floating navigation bar at the bottom
 * prominently featuring the "Add Business" CTA to align with mission.
 */
export const MobileNav = ({
    activeNav = "nearme",
    onNearMeClick,
    onExploreClick,
    onAddListingClick,
}: MobileNavProps) => {
    const getNavStyle = (id: string) => {
        const isActive = activeNav === id;
        return css({
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1",
            cursor: "pointer",
            color: isActive ? "brand.orange" : "gray.400",
            transition: "colors 0.3s",
            flex: 1,
        });
    };

    return (
        <div
            className={css({
                position: "fixed",
                bottom: "6", // Slightly elevated above the device bottom edge
                left: "50%",
                transform: "translateX(-50%)",
                width: "90%",
                maxWidth: "400px",
                height: "64px",
                bg: "rgba(21, 21, 26, 0.8)",
                backdropFilter: "blur(24px)",
                border: "1px solid",
                borderColor: "white/10",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,90,0,0.1)",
                borderRadius: "full",
                display: { base: "flex", md: "none" },
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 4",
                zIndex: 50,
                pointerEvents: "auto",
            })}
        >
            <button onClick={onNearMeClick} className={`group ${getNavStyle("nearme")}`}>
                <div className={css({ position: "relative" })}>
                    <i
                        className={`ph-fill ph-navigation-arrow text-2xl group-hover:scale-110 transition-transform ${activeNav === "nearme" ? css({ filter: "drop-shadow(0 0 8px rgba(255,90,0,0.8))" }) : ""
                            }`}
                    ></i>
                    {activeNav === "nearme" && (
                        <div
                            className={css({
                                position: "absolute",
                                right: "-2px",
                                top: "-2px",
                                width: "6px",
                                height: "6px",
                                bg: "brand.orange",
                                borderRadius: "full",
                                animation: "pulseSlow",
                            })}
                        ></div>
                    )}
                </div>
                <span
                    className={css({
                        fontSize: "9px",
                        fontFamily: "tech",
                        fontWeight: "bold",
                        letterSpacing: "wider",
                    })}
                >
                    NEAR ME
                </span>
            </button>

            {/* Primary Mission CTA: Add Business */}
            <div className={css({ display: "flex", alignItems: "center", justifyContent: "center", mx: "2" })}>
                <button
                    onClick={onAddListingClick}
                    className={css({
                        width: "56px",
                        height: "56px",
                        borderRadius: "full",
                        bg: "brand.orange",
                        border: "2px solid",
                        borderColor: "rgba(255, 90, 0, 0.3)",
                        boxShadow: "0 0 20px rgba(255,90,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "black",
                        transform: "translateY(-12px)", // Pop out of the pill
                        _hover: { transform: "translateY(-14px) scale(1.05)", filter: "brightness(1.1)" },
                        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    })}
                >
                    <i className="ph-bold ph-plus text-2xl"></i>
                </button>
            </div>

            <button onClick={onExploreClick} className={`group ${getNavStyle("explore")}`}>
                <div className={css({ position: "relative" })}>
                    <i
                        className={`ph-fill ph-compass-rose text-2xl group-hover:scale-110 transition-transform ${activeNav === "explore" ? css({ filter: "drop-shadow(0 0 8px rgba(255,90,0,0.8))" }) : ""
                            }`}
                    ></i>
                    {activeNav === "explore" && (
                        <div
                            className={css({
                                position: "absolute",
                                right: "-2px",
                                top: "-2px",
                                width: "6px",
                                height: "6px",
                                bg: "brand.orange",
                                borderRadius: "full",
                                animation: "pulseSlow",
                            })}
                        ></div>
                    )}
                </div>
                <span
                    className={css({
                        fontSize: "9px",
                        fontFamily: "tech",
                        fontWeight: "bold",
                        letterSpacing: "wider",
                    })}
                >
                    EXPLORE
                </span>
            </button>
        </div>
    );
};
