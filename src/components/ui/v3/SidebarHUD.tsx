import MAvatar from "@/components/Nav/Mavatar";
import { css } from "@styled/css";
import { useTheme } from "next-themes";

const SidebarHUD = () => {
    const { theme, setTheme } = useTheme();

    return (
        <aside className={css({
            width: { base: "100%", md: "128px" },
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
            zIndex: 40
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
                display: "flex", flexDirection: { base: "row", md: "column" }, gap: { base: "6", md: "8" },
                overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }
            })}>
                <a href="#" className={`group ${css({ color: "brand.orange", textShadow: "0 0 8px rgba(255,90,0,0.8)", position: "relative", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph-fill ph-navigation-arrow text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>NEAR ME</span>
                    <div className={css({ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", bg: "brand.orange", borderRadius: "full", animation: "pulseSlow" })}></div>
                </a>

                <a href="#" className={`group ${css({ color: "text.muted", _hover: { color: "text.main" }, transition: "colors 0.3s", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-compass-rose text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>EXPLORE</span>
                </a>

                <a href="#" className={`group ${css({ color: "text.muted", _hover: { color: "text.main" }, transition: "colors 0.3s", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-bookmarks text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>SAVED</span>
                </a>

                <a href="#" className={`group ${css({ color: "text.muted", _hover: { color: "text.main" }, transition: "colors 0.3s", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-robot text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>CURATOR</span>
                </a>
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
                        <i className="ph-fill ph-sun text-lg"></i>
                    ) : (
                        <i className="ph-fill ph-moon text-lg"></i>
                    )}
                </button>

            </div>
        </aside >
    );
};

export default SidebarHUD;
