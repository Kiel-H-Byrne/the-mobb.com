import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { Tabs } from "@ark-ui/react/tabs";
import CloseIcon from "@mui/icons-material/CloseTwoTone";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from "react";
import { scanBusinessUrl } from "../../../app/actions/scanBusiness";
import { submitListing } from "../../../app/actions/submitListing";
import { css } from "../../../styled-system/css";

interface IAddListingDrawer {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AddListingDrawer = ({ isOpen, setOpen }: IAddListingDrawer) => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Manual Form State
  const [manualData, setManualData] = useState<{
    name: string; category: string; address: string; website: string; description: string; isBlackOwned: boolean; lat?: number; lng?: number;
  }>({
    name: "",
    category: "",
    address: "",
    website: "",
    description: "",
    isBlackOwned: false
  });

  // Autocomplete ref
  const placesLibrary = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;
    const options = {
      fields: ["formatted_address", "geometry", "name"],
    };
    setAutocomplete(new placesLibrary.Autocomplete(inputRef.current, options));
  }, [placesLibrary, inputRef]);

  useEffect(() => {
    if (!autocomplete) return;
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        setManualData(prev => ({ 
          ...prev, 
          address: place.formatted_address as string,
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        }));
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [autocomplete]);


  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScanning(true);
    setError("");
    setResult(null);
    
    try {
      const res = await scanBusinessUrl(url);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError("Failed to extract data. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while scanning the URL.");
    } finally {
      setIsScanning(false);
    }
  };

  const submitAIResult = async () => {
    if (!result) return;
    setIsSubmitting(true);
    try {
      const res = await submitListing({
        name: result.name,
        category: result.category,
        address: result.address || "",
        description: result.description || "",
        website: result.website || url || "",
        isBlackOwned: result.isBlackOwnedDetected || false,
        source: "AI_SCAN"
      });
      if (res.success) {
        alert("Listing submitted successfully for review!");
        handleClose();
      } else {
        setError(res.error || "Submission failed.");
      }
    } catch(e) {
      console.error(e);
      setError("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await submitListing({
        ...manualData,
        source: "MANUAL"
      });
      if (res.success) {
        alert("Listing submitted successfully for review!");
        handleClose();
      } else {
        setError(res.error || "Submission failed.");
      }
    } catch(e) {
      console.error(e);
      setError("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleClose = () => {
    setOpen(false);
    setUrl("");
    setResult(null);
    setError("");
    setManualData({
      name: "", category: "", address: "", website: "", description: "", isBlackOwned: false
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => { if (!e.open) handleClose(); }}>
      <Portal>
        <Dialog.Backdrop
          className={css({
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: "1300",
          })}
        />
        <Dialog.Positioner
          className={css({
            position: "fixed",
            right: "0",
            top: "0",
            bottom: "0",
            zIndex: "1400",
            width: "24rem",
            maxWidth: "100vw",
            display: "flex",
            justifyContent: "flex-end",
          })}
        >
          <Dialog.Content
            className={css({
              height: "100%",
              width: "100%",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 24px rgba(0,0,0,0.15)",
              animation: "slideInRight 0.3s ease-out",
            })}
          >
            {/* Header */}
            <div className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4",
              borderBottom: "1px solid",
              borderColor: "gray.200",
              backgroundColor: "gray.50",
            })}>
              <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "brand.grey" })}>
                Add a Listing
              </h2>
              <button
                onClick={handleClose}
                className={css({
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "gray.500",
                  _hover: { color: "brand.orange" },
                })}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div className={css({ padding: "6", flex: "1", overflowY: "auto" })}>
              <Tabs.Root defaultValue="scan">
                <Tabs.List className={css({
                  display: "flex",
                  borderBottom: "1px solid",
                  borderColor: "gray.200",
                  marginBottom: "4"
                })}>
                  <Tabs.Trigger value="scan" className={css({
                    padding: "2 4",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    borderBottom: "2px solid transparent",
                    color: "gray.500",
                    _selected: { color: "brand.orange", borderColor: "brand.orange", fontWeight: "bold" },
                  })}>
                    AI Scan URL
                  </Tabs.Trigger>
                  <Tabs.Trigger value="manual" className={css({
                    padding: "2 4",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    borderBottom: "2px solid transparent",
                    color: "gray.500",
                    _selected: { color: "brand.orange", borderColor: "brand.orange", fontWeight: "bold" },
                  })}>
                    Manual Entry
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="scan">
                  <p className={css({ fontSize: "sm", color: "gray.600", marginBottom: "6" })}>
                    Help us map the diaspora! Enter a business website URL or a Yelp/Google Maps link, and our AI will extract the details for review.
                  </p>

                  <form onSubmit={handleScan} className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "2", fontSize: "sm", fontWeight: "500" })}>
                      Business URL
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example-business.com"
                        required
                        className={css({
                          padding: "3",
                          borderRadius: "md",
                          border: "1px solid",
                          borderColor: "gray.300",
                          outline: "none",
                          _focus: { borderColor: "brand.orange", ring: "2", ringColor: "rgba(251, 176, 59, 0.2)" },
                        })}
                      />
                    </label>
                    
                    <button
                      type="submit"
                      disabled={isScanning || !url}
                      className={css({
                        backgroundColor: "brand.orange",
                        color: "white",
                        padding: "3",
                        borderRadius: "full",
                        fontWeight: "bold",
                        cursor: isScanning ? "wait" : "pointer",
                        border: "none",
                        opacity: isScanning || !url ? 0.7 : 1,
                        transition: "all 0.2s",
                        _hover: { transform: "translateY(-1px)", boxShadow: "md" },
                        _active: { transform: "translateY(0)" },
                      })}
                    >
                      {isScanning ? "Scanning with AI..." : "Extract Data"}
                    </button>
                  </form>

                  {error && (
                    <div className={css({ marginTop: "4", padding: "3", backgroundColor: "red.50", color: "red.600", borderRadius: "md", fontSize: "sm" })}>
                      {error}
                    </div>
                  )}

                  {result && (
                    <div className={css({ marginTop: "6", animation: "fadeIn 0.4s ease-out" })}>
                      <h3 className={css({ fontSize: "md", fontWeight: "bold", marginBottom: "2", color: "brand.grey" })}>
                        Extracted Details
                      </h3>
                      <div className={css({
                        backgroundColor: "gray.50",
                        border: "1px solid",
                        borderColor: "gray.200",
                        borderRadius: "md",
                        padding: "4",
                        display: "flex",
                        flexDirection: "column",
                        gap: "3",
                        fontSize: "sm",
                      })}>
                        <div><strong>Name:</strong> {result.name}</div>
                        <div><strong>Category:</strong> {result.category}</div>
                        {result.address && <div><strong>Address:</strong> {result.address}</div>}
                        <div><strong>Black Owned?:</strong> {result.isBlackOwnedDetected ? "Yes" : "No"} (Confidence: {result.confidenceScore*100}%)</div>
                        <div className={css({ color: "gray.600", fontSize: "xs", marginTop: "2" })}>
                          {result.description}
                        </div>
                      </div>
                      
                      <button
                        className={css({
                          width: "100%",
                          backgroundColor: "brand.grey",
                          color: "white",
                          padding: "3",
                          borderRadius: "full",
                          fontWeight: "bold",
                          cursor: isSubmitting ? "wait" : "pointer",
                          border: "none",
                          opacity: isSubmitting ? 0.7 : 1,
                          marginTop: "6",
                          _hover: { backgroundColor: "#2d2a28" },
                        })}
                        onClick={submitAIResult}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Review"}
                      </button>
                    </div>
                  )}
                </Tabs.Content>

                <Tabs.Content value="manual">
                  <form onSubmit={handleManualSubmit} className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                      Business Name *
                      <input value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} required type="text" className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" }})} />
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                      Category *
                      <select value={manualData.category} onChange={e => setManualData({...manualData, category: e.target.value})} required className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" }})}>
                        <option value="">Select a category</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Retail">Retail</option>
                        <option value="Service">Service</option>
                        <option value="Tech">Tech</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                      Address *
                      <input ref={inputRef} value={manualData.address} onChange={e => setManualData({...manualData, address: e.target.value})} required type="text" placeholder="Start typing address..." className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" }})} />
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                      Website
                      <input value={manualData.website} onChange={e => setManualData({...manualData, website: e.target.value})} type="url" className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" }})} />
                    </label>
                    <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                      Description
                      <textarea value={manualData.description} onChange={e => setManualData({...manualData, description: e.target.value})} rows={3} className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" }})}></textarea>
                    </label>
                    <label className={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "sm", fontWeight: "500", marginTop: "2" })}>
                      <input checked={manualData.isBlackOwned} onChange={e => setManualData({...manualData, isBlackOwned: e.target.checked})} type="checkbox" className={css({ width: "4", height: "4", accentColor: "brand.orange" })} />
                      Is this Black-Owned?
                    </label>

                    {error && (
                      <div className={css({ padding: "2", backgroundColor: "red.50", color: "red.600", borderRadius: "md", fontSize: "sm" })}>
                        {error}
                      </div>
                    )}

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className={css({
                          width: "100%",
                          backgroundColor: "brand.grey",
                          color: "white",
                          padding: "3",
                          borderRadius: "full",
                          fontWeight: "bold",
                          cursor: isSubmitting ? "wait" : "pointer",
                          border: "none",
                          opacity: isSubmitting ? 0.7 : 1,
                          marginTop: "4",
                          _hover: { backgroundColor: "#2d2a28" },
                        })}
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Review"}
                      </button>
                  </form>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default memo(AddListingDrawer);
