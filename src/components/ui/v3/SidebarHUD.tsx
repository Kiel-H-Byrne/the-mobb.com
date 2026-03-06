import MAvatar from "@/components/Nav/Mavatar";
import { css } from "@styled/css";

const SidebarHUD = () => {
    return (
        <aside className={css({
            width: { base: "100%", md: "128px" },
            height: { base: "64px", md: "100%" },
            // background: "brand.glass",
            bg: "linear-gradient(to bottom, rgba(255,90,0,0.9), rgba(21, 21, 26, 1))",
            backdropFilter: "blur(24px)",
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
            <div className={css({
                width: "48px", height: "48px", borderRadius: "xl",
                background: "linear-gradient(to bottom right, token(colors.brand.orange), #FF2A00)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "glow", cursor: "pointer"
            })}>
                <span className={css({ fontFamily: "tech", fontWeight: "bold", color: "white", fontSize: "xl", letterSpacing: "tighter" })}>M</span>
            </div>

            <nav className={css({ display: "flex", flexDirection: { base: "row", md: "column" }, gap: { base: "6", md: "8" }, overflowX: "auto" })}>
                <a href="#" className={`group ${css({ color: "brand.orange", textShadow: "0 0 8px rgba(255,90,0,0.8)", position: "relative", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph-fill ph-radar text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", fontWeight: "bold", display: { base: "none", md: "block" } })}>NEAR ME</span>
                    <div className={css({ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", bg: "white", borderRadius: "full", animation: "pulseSlow" })}></div>
                </a>

                <a href="#" className={`group ${css({ color: "gray.500", _hover: { color: "white" }, transition: "colors", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-compass-rose text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", display: { base: "none", md: "block" }, opacity: 0, _groupHover: { opacity: 1 }, transition: "opacity 0.3s" })}>EXPLORE</span>
                </a>

                <a href="#" className={`group ${css({ color: "gray.500", _hover: { color: "white" }, transition: "colors", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-bookmarks text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", display: { base: "none", md: "block" }, opacity: 0, _groupHover: { opacity: 1 }, transition: "opacity 0.3s" })}>SAVED</span>
                </a>

                <a href="#" className={`group ${css({ color: "gray.500", _hover: { color: "white" }, transition: "colors", display: "flex", flexDir: "column", alignItems: "center", gap: "1" })}`}>
                    <i className="ph ph-robot text-2xl group-hover:scale-110 transition-transform"></i>
                    <span className={css({ fontSize: "10px", fontFamily: "tech", display: { base: "none", md: "block" }, opacity: 0, _groupHover: { opacity: 1 }, transition: "opacity 0.3s" })}>CURATOR</span>
                </a>
            </nav>

            {/* Reintegrating the Avatar from the old MapControl */}
            <div className={css({
                width: "40px", height: "40px", borderRadius: "full",
                bg: "brand.surface", border: "1px solid", borderColor: "white/10",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", cursor: "pointer", _hover: { borderColor: "brand.orange" }
            })}>
                <MAvatar />
            </div>
        </aside >
    );
};

export default SidebarHUD;
