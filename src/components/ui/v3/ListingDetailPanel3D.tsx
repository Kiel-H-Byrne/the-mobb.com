import { Listing } from "@/db/Types";
import { css } from "@styled/css";
import { Dispatch, SetStateAction } from "react";

interface ListingDetailPanel3DProps {
    listing: Listing;
    isOpen: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const ListingDetailPanel3D = ({
    listing,
    isOpen,
    setOpen,
}: ListingDetailPanel3DProps) => {
    if (!isOpen) return null;

    const { url, name, image, description, phone, address, categories } = listing;

    return (
        <div
            className={css({
                position: "absolute",
                top: { base: "auto", md: "0" },
                bottom: "0",
                right: { base: "0", md: "0" },
                left: { base: "0", md: "auto" },
                height: { base: "60dvh", md: "100%" },
                width: { base: "100%", md: "380px", lg: "420px" },
                background: "bg.glass",
                backdropFilter: "blur(24px)",
                border: "1px solid",
                borderColor: "border.light",
                boxShadow: "glow",
                borderRadius: "2xl",
                display: "flex",
                flexDirection: "column",
                zIndex: 50,
                overflow: "hidden",
                animation: { base: "slideUp", md: "fadeIn" },
                transformOrigin: "right center",
                pointerEvents: "auto"
            })}
        >
            {/* Header / Dismiss */}
            <div className={css({ p: "4", borderBottom: "1px solid", borderColor: "white/10", display: "flex", justifyContent: "space-between", alignItems: "center", bg: "rgba(11, 11, 14, 0.4)" })}>
                <h2 className={css({ color: "brand.orange", fontFamily: "tech", fontSize: "sm", letterSpacing: "widest" })}>
                    TARGET ACQUIRED
                </h2>
                <button
                    onClick={() => setOpen(false)}
                    className={css({
                        color: "gray.400",
                        cursor: "pointer",
                        bg: "transparent",
                        border: "none",
                        _hover: { color: "white", transform: "scale(1.1)" },
                        transition: "all 0.2s"
                    })}
                >
                    <i className="ph-bold ph-x text-xl"></i>
                </button>
            </div>

            <div className={css({ flex: "1", overflowY: "auto", pb: "6" })}>
                {/* Holographic Image Frame */}
                <div className={css({ position: "relative", w: "full", h: "240px", bg: "brand.greyDark", overflow: "hidden" })}>
                    <div className={css({ position: "absolute", inset: 0, bg: "linear-gradient(to bottom, transparent, #0B0B0E)", zIndex: 1 })} />
                    <a href={url} title="Listing Image" rel="noopener noreferrer" target="_blank" className={css({ display: "block", w: "full", h: "full" })}>
                        {image ? (
                            <img src={typeof image === 'string' ? image : (image as any)?.url || ''} alt={name} className={css({ w: "full", h: "full", objectFit: "cover", opacity: 0.8, filter: "contrast(1.1) saturate(1.2)" })} />
                        ) : (
                            <div className={css({ w: "full", h: "full", display: "flex", alignItems: "center", justifyContent: "center" })}>
                                <i className="ph-duotone ph-image text-6xl text-gray-600"></i>
                            </div>
                        )}
                    </a>
                    {/* Overlay Tech Grid */}
                    <div className={css({ position: "absolute", top: 4, right: 4, zIndex: 2, display: "flex", gap: "2" })}>
                        <span className={css({ bg: "brand.orangeMuted", color: "brand.orange", px: "3", py: "1", borderRadius: "full", fontSize: "xs", fontWeight: "bold", fontFamily: "tech", border: "1px solid rgba(255,90,0,0.3)" })}>
                            Verified
                        </span>
                    </div>
                </div>

                {/* Content Body */}
                <div className={css({ p: "4", display: "flex", flexDirection: "column", gap: "4" })}>
                    <div>
                        <h1 className={css({ fontSize: "2xl", fontWeight: "bold", color: "white", lineHeight: "tight", mb: "2", textShadow: "0 0 20px rgba(255,255,255,0.1)" })}>
                            {name}
                        </h1>
                        <p className={css({ color: "gray.400", fontSize: "sm", lineHeight: "relaxed" })}>
                            {description || "No transmission data found for this entity."}
                        </p>
                    </div>

                    <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
                        {categories?.map((cat, idx) => (
                            <span key={idx} className={css({ fontSize: "xs", px: "3", py: "1", borderRadius: "md", border: "1px solid", borderColor: "white/10", color: "gray.300", bg: "rgba(255,255,255,0.05)" })}>
                                <i className="ph-fill ph-tag text-brand-orange mr-1"></i>
                                {cat.replace(/_/g, " ")}
                            </span>
                        ))}
                    </div>

                    <div className={css({ display: "flex", flexDirection: "column", gap: "4", mt: "2" })}>
                        <a href={`tel:${phone}`} className={css({ display: "flex", alignItems: "center", gap: "3", color: "white", textDecoration: "none", p: "3", borderRadius: "lg", bg: "rgba(255,255,255,0.03)", border: "1px solid transparent", _hover: { borderColor: "brand.orange/50", bg: "brand.orangeMuted" }, transition: "all 0.2s" })}>
                            <div className={css({ display: "flex", alignItems: "center", justifyContent: "center", w: "10", h: "10", borderRadius: "full", bg: "brand.greyDark", color: "brand.orange" })}>
                                <i className="ph-fill ph-phone text-lg"></i>
                            </div>
                            <div className={css({ flex: 1 })}>
                                <div className={css({ fontSize: "xs", color: "gray.500", textTransform: "uppercase", letterSpacing: "wider", mb: "0.5" })}>Comm-Link</div>
                                <div className={css({ fontSize: "sm", fontWeight: "bold", letterSpacing: "widest" })}>{phone || "N/A"}</div>
                            </div>
                        </a>

                        <div className={css({ display: "flex", alignItems: "center", gap: "3", color: "white", p: "3", borderRadius: "lg", bg: "rgba(255,255,255,0.03)" })}>
                            <div className={css({ display: "flex", alignItems: "center", justifyContent: "center", w: "10", h: "10", borderRadius: "full", bg: "brand.greyDark", color: "brand.orange" })}>
                                <i className="ph-fill ph-map-pin text-lg"></i>
                            </div>
                            <div className={css({ flex: 1 })}>
                                <div className={css({ fontSize: "xs", color: "gray.500", textTransform: "uppercase", letterSpacing: "wider", mb: "0.5" })}>Coordinates</div>
                                <div className={css({ fontSize: "sm", lineHeight: "1.4" })}>{address}</div>
                            </div>
                        </div>
                    </div>

                    <div className={css({ mt: "4" })}>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css({
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "2",
                                w: "full", py: "4", borderRadius: "xl",
                                bg: "brand.orange", color: "white",
                                fontWeight: "bold", fontSize: "md",
                                textDecoration: "none", cursor: "pointer",
                                boxShadow: "glow", border: "1px solid rgba(255,255,255,0.2)",
                                transition: "all 0.2s", _hover: { filter: "brightness(1.1)", transform: "translateY(-2px)" }
                            })}
                        >
                            <i className="ph-fill ph-navigation-arrow text-xl"></i> Calculate Trajectory
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
