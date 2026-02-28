import { Button } from "@/components/ui/Button";
import { Drawer, DrawerBackdrop, DrawerBody, DrawerContent, DrawerHeader, DrawerPositioner } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { scanBusinessUrl } from "@app/actions/scanBusiness";
import { submitListing } from "@app/actions/submitListing";
import { Tabs } from "@ark-ui/react/tabs";
import { css } from "@styled/css";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";

interface IAddListingDrawer {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  mode?: "add" | "edit";
  initialData?: any;
  onSubmitEdit?: (data: any) => Promise<void>;
}

const AddListingDrawer = ({ isOpen, setOpen, mode = "add", initialData, onSubmitEdit }: IAddListingDrawer) => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Manual Form State
  const [manualData, setManualData] = useState<{
    name: string; category: string; address: string; website: string; description: string; isBlackOwned: boolean; lat?: number; lng?: number;
  }>({
    name: initialData?.name || "",
    category: initialData?.category || "",
    address: initialData?.address || "",
    website: initialData?.website || "",
    description: initialData?.description || "",
    isBlackOwned: initialData?.isBlackOwned || false,
    lat: initialData?.lat || undefined,
    lng: initialData?.lng || undefined
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setManualData({
        name: initialData.name || "",
        category: initialData.category || "",
        address: initialData.address || "",
        website: initialData.website || "",
        description: initialData.description || "",
        isBlackOwned: initialData.isBlackOwned || false,
        lat: initialData.lat || undefined,
        lng: initialData.lng || undefined
      });
    }
  }, [mode, initialData, isOpen]);

  // Autocomplete ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.PlaceAutocompleteElement | null>(null);
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib || !containerRef.current) return;

    // Create the PlaceAutocompleteElement
    // @ts-ignore
    const element = new window.google.maps.places.PlaceAutocompleteElement({});
    // Request specific fields
    // @ts-ignore
    element.fields = ["formatted_address", "geometry", "name", "website"];

    // Append to container
    containerRef.current.innerHTML = ''; // prevent duplicates
    containerRef.current.appendChild(element);

    setAutocomplete(element);
  }, [placesLib, containerRef]);

  useEffect(() => {
    if (!autocomplete) return;

    const handlePlaceSelect = async (e: any) => {
      const place = e.place;
      // Fetch fields before accessing them
      await place.fetchFields({ fields: ['formattedAddress', 'location', 'website', 'displayName'] });

      if (place) {
        setManualData(prev => ({
          ...prev,
          name: place.displayName || prev.name,
          address: place.formattedAddress as string || prev.address,
          lat: place.location?.lat(),
          lng: place.location?.lng(),
          website: place.websiteURI || prev.website,
        }));
      }
    };

    autocomplete.addEventListener("gmp-placeselect", handlePlaceSelect);

    return () => {
      if (autocomplete) {
        autocomplete.removeEventListener("gmp-placeselect", handlePlaceSelect);
      }
    };
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
    } catch (e) {
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

    if (mode === "edit" && onSubmitEdit) {
      try {
        await onSubmitEdit(manualData);
        alert("Listing updated successfully!");
        handleClose();
      } catch (e: any) {
        console.error(e);
        setError(e.message || "An error occurred while updating.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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
    } catch (e) {
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
      name: "", category: "", address: "", website: "", description: "", isBlackOwned: false, lat: undefined, lng: undefined
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={(e) => { if (!e.open) handleClose(); }}>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent className={css({ w: "24rem", maxWidth: "100vw", p: "0" })}>
          <DrawerHeader>
            <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "brand.grey" })}>
              {mode === "edit" ? "Edit Listing" : "Add a Listing"}
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
              <MdClose size={24} />
            </button>
          </DrawerHeader>

          {/* Body */}
          <DrawerBody>
            <Tabs.Root value={mode === "edit" ? "manual" : undefined} defaultValue="scan">
              {mode === "add" && (
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
              )}

              <Tabs.Content value="scan">
                <p className={css({ fontSize: "sm", color: "gray.600", marginBottom: "6" })}>
                  Help us map the diaspora! Enter a business website URL or a Yelp/Google Maps link, and our AI will extract the details for review.
                </p>

                <form onSubmit={handleScan} className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "2", fontSize: "sm", fontWeight: "500" })}>
                    Business URL
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example-business.com"
                      required
                    />
                  </label>

                  <Button
                    type="submit"
                    disabled={isScanning || !url}
                    className={css({ mt: 4 })}
                  >
                    {isScanning ? "Scanning with AI..." : "Extract Data"}
                  </Button>
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
                      <div><strong>Black Owned?:</strong> {result.isBlackOwnedDetected ? "Yes" : "No"} (Confidence: {result.confidenceScore * 100}%)</div>
                      <div className={css({ color: "gray.600", fontSize: "xs", marginTop: "2" })}>
                        {result.description}
                      </div>
                    </div>

                    <Button
                      className={css({ mt: 6, w: "full" })}
                      onClick={submitAIResult}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit for Review"}
                    </Button>
                  </div>
                )}
              </Tabs.Content>

              <Tabs.Content value="manual">
                <form onSubmit={handleManualSubmit} className={css({ display: "flex", flexDirection: "column", gap: "4" })}>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                    Business Name *
                    <Input value={manualData.name} onChange={e => setManualData({ ...manualData, name: e.target.value })} required type="text" />
                  </label>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                    Category *
                    <Select value={manualData.category} onChange={e => setManualData({ ...manualData, category: e.target.value })} required>
                      <option value="">Select a category</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Retail">Retail</option>
                      <option value="Service">Service</option>
                      <option value="Tech">Tech</option>
                      <option value="Other">Other</option>
                    </Select>
                  </label>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                    Address *
                    {/* The PlaceAutocompleteElement is mounted inside this container */}
                    <div ref={containerRef} className={css({
                      "& > gmp-place-autocomplete": {
                        width: "100%",
                      },
                      "& > gmp-place-autocomplete::part(input)": {
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid",
                        borderColor: "gray.300",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: "14px",
                      }
                    })} />
                  </label>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                    Website
                    <Input value={manualData.website} onChange={e => setManualData({ ...manualData, website: e.target.value })} type="url" />
                  </label>
                  <label className={css({ display: "flex", flexDirection: "column", gap: "1", fontSize: "sm", fontWeight: "500" })}>
                    Description
                    <textarea value={manualData.description} onChange={e => setManualData({ ...manualData, description: e.target.value })} rows={3} className={css({ padding: "2", borderRadius: "md", border: "1px solid", borderColor: "gray.300", outline: "none", _focus: { borderColor: "brand.orange" } })}></textarea>
                  </label>
                  <label className={css({ display: "flex", alignItems: "center", gap: "2", fontSize: "sm", fontWeight: "500", marginTop: "2" })}>
                    <input checked={manualData.isBlackOwned} onChange={e => setManualData({ ...manualData, isBlackOwned: e.target.checked })} type="checkbox" className={css({ width: "4", height: "4", accentColor: "brand.orange" })} />
                    Is this Black-Owned?
                  </label>

                  {error && (
                    <div className={css({ padding: "2", backgroundColor: "red.50", color: "red.600", borderRadius: "md", fontSize: "sm" })}>
                      {error}
                    </div>
                  )}

                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className={css({ mt: 4, w: "full" })}
                  >
                    {isSubmitting ? (mode === "edit" ? "Saving..." : "Submitting...") : (mode === "edit" ? "Save Changes" : "Submit for Review")}
                  </Button>
                </form>
              </Tabs.Content>
            </Tabs.Root>
          </DrawerBody>
        </DrawerContent>
      </DrawerPositioner>
    </Drawer>
  );
};

export default memo(AddListingDrawer);
