import MAvatar from "@/components/Nav/Mavatar";
import { BookmarksIcon, CaretRightIcon, CompassRoseIcon, MoonIcon, NavigationArrowIcon, RobotIcon, SunIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import { useTheme } from "next-themes";

interface SidebarHUDProps {
    activeNav?: "nearme" | "explore" | "saved" | "curator";
    onNearMeClick?: () => void;
    onExploreClick?: () => void;
    onSavedClick?: () => void;
    onCuratorClick?: () => void;
    isPanelVisible?: boolean;
    onTogglePanel?: () => void;
}

const SidebarHUD = ({ activeNav = "nearme", onNearMeClick, onExploreClick, onSavedClick, onCuratorClick, isPanelVisible = true, onTogglePanel }: SidebarHUDProps) => {
    const { theme, setTheme } = useTheme();

    const getNavStyle = (id: string) => {
        const isActive = activeNav === id;
        return css({
            color: isActive ? "text.main" : "text.muted",
            _hover: { color: "text.main" },
            transition: "colors 0.3s",
            display: "flex",
            flexDir: "column",
            alignItems: "center",
            gap: "1",
            cursor: "pointer"
        });
    };

    return (
        <aside className={css({
            width: { base: "100%", md: "90px" },
            height: { base: "64px", md: "100%" },
            bg: "bg.glass",
            backdropFilter: "blur(32px)", /* Increased frost */
            border: "1px solid",
            borderColor: "border.light",
            boxShadow: "glass",
            borderRadius: "2xl",
            display: "flex",
            flexDirection: { base: "row", md: "column" },
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4",
            flexShrink: 0,
            zIndex: 40,
            pointerEvents: "auto"
        })}>
            {/* Functional App Logo Avatar */}
            <div className={css({
                width: "40px", height: "40px", borderRadius: "full",
                bg: "brand.surface", border: "1px solid", borderColor: "white/10",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden", cursor: "pointer", _hover: { borderColor: "brand.orange" }
            })}>
                <MAvatar />
            </div>

            <nav className={css({
                display: "flex", flexDirection: { base: "row", md: "column" }, gap: { base: "6", md: "6" },
                overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
            })}>
                <a onClick={onNearMeClick} className={`group ${getNavStyle("nearme")} ${activeNav === "nearme" ? css({ color: "brand.orange!" }) : ""}`}>
                    <NavigationArrowIcon
                        weight="fill"
                        size={24}
                        className={`group-hover:scale-110 transition-transform ${activeNav === "nearme" ? css({ filter: "drop-shadow(0 0 8px rgba(255,90,0,0.8))" }) : ""}`}
                    />
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>NEAR ME</span>
                    {activeNav === "nearme" && (
                        <div className={css({ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", bg: "brand.orange", borderRadius: "full", animation: "pulseSlow" })}></div>
                    )}
                </a>

                <a onClick={onExploreClick} className={`group ${getNavStyle("explore")} ${activeNav === "explore" ? css({ color: "brand.orange!" }) : ""}`}>
                    <CompassRoseIcon
                        weight="fill"
                        size={24}
                        className={`group-hover:scale-110 transition-transform ${activeNav === "explore" ? css({ filter: "drop-shadow(0 0 8px rgba(255,90,0,0.8))" }) : ""}`}
                    />
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>EXPLORE</span>
                    {activeNav === "explore" && (
                        <div className={css({ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", bg: "brand.orange", borderRadius: "full", animation: "pulseSlow" })}></div>
                    )}
                </a>

                <a onClick={onSavedClick} className={`group ${getNavStyle("saved")}`}>
                    <BookmarksIcon
                        weight={activeNav === "saved" ? "fill" : "regular"}
                        size={24}
                        className={`group-hover:scale-110 transition-transform ${activeNav === "saved" ? css({ color: "brand.orange" }) : ""}`}
                    />
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>SAVED</span>
                </a>

                <a onClick={onCuratorClick} className={`group ${getNavStyle("curator")}`}>
                    <RobotIcon
                        weight={activeNav === "curator" ? "fill" : "regular"}
                        size={24}
                        className={`group-hover:scale-110 transition-transform ${activeNav === "curator" ? css({ color: "brand.orange" }) : ""}`}
                    />
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>CURATOR</span>
                </a>

                {/* Expad Panel Handle - Visible only when Panel is hidden */}
                {!isPanelVisible && (
                    <button
                        onClick={onTogglePanel}
                        className={`group ${css({
                            color: "brand.orange",
                            display: "flex", flexDir: "column", alignItems: "center", gap: "1",
                            mt: { base: "0", md: "4" }, ml: { base: "4", md: "0" },
                            cursor: "pointer", transition: "all 0.3s",
                            bg: "brand.surface", border: "1px solid", borderColor: "brand.orange",
                            borderRadius: "full", p: "2",
                            boxShadow: "0 0 10px rgba(255,90,0,0.3)"
                        })}`}
                        title="Expand Panel"
                    >
                        <CaretRightIcon weight="bold" size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </nav>

            {/* Bottom Actions Cluster */}
            <div className={css({ display: "flex", flexDirection: { base: "row", md: "column" }, gap: "4", alignItems: "center" })}>
                {/* Theme Toggle Button */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={css({
                        width: "36px", height: "36px", borderRadius: "full",
                        bg: "border.light", border: "1px solid", borderColor: "border.light",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "text.muted", cursor: "pointer", _hover: { color: "text.main", bg: "bg.surface" },
                        transition: "all 0.3s"
                    })}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <SunIcon weight="fill" size={18} />
                    ) : (
                        <MoonIcon weight="fill" size={18} />
                    )}
                </button>

            </div>
        </aside >
    );
};

export default SidebarHUD;
