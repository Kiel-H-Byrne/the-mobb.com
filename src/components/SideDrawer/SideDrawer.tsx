import React, { Dispatch, SetStateAction } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import DirectionsIcon from "@mui/icons-material/DirectionsTwoTone";
import ListingImage from "@/components/ListingImage";
import { Listing } from "@/db/Types";
import { css } from "@styled/css";

interface ISideDrawer {
  activeListing: Listing;
  isOpen: boolean;
  mapInstance: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SideGrid = ({ activeListing }: { activeListing: Listing }) => {
  const { url, name, image, description, phone, address } = activeListing;

  const rootStyle = css({
    maxWidth: "16rem",
    backgroundColor: "rgba(60, 57, 55, 1)", // $rgba-primary-grey-4
    height: "100%",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    color: "white",
  });

  const sectionStyle = css({
    padding: "4",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  });

  const titleStyle = css({
    fontSize: "xl",
    fontWeight: "bold",
    margin: "0",
  });

  const overlineStyle = css({
    fontSize: "xs",
    textTransform: "uppercase",
    opacity: "0.7",
  });

  const addressStyle = css({
    fontStyle: "normal",
    fontSize: "sm",
    marginTop: "2",
  });

  return (
    <div className={rootStyle}>
      <div>
        <a
          href={url}
          title="Listing Image"
          rel="noopener noreferrer"
          target="blank"
        >
          <ListingImage
            image={image}
            name={name}
            url={url}
            className={css({ width: "100%" })}
          />
        </a>
      </div>
      <div className={sectionStyle}>
        <article>
          <h3 className={titleStyle}>{name}</h3>
          <p className={overlineStyle}>{description}</p>
          <address className={addressStyle}>
            <a
              href={`tel:${phone}`}
              className={css({ color: "brand.orange", textDecoration: "none" })}
            >
              {phone}
            </a>
            <p>{address}</p>
          </address>
        </article>
        <div className={css({ marginTop: "4" })}>Hours if</div>
        <button
          className={css({
            backgroundColor: "brand.orange",
            color: "white",
            border: "none",
            borderRadius: "full",
            padding: "2",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "4",
            boxShadow: "md",
          })}
        >
          <DirectionsIcon />
        </button>
      </div>
      <div className={sectionStyle}>MoBB Actions</div>
      <div className={sectionStyle}>MoBB Actions</div>
      <div className={sectionStyle}>Photos if</div>
      <div className={sectionStyle}>Reviews if</div>
    </div>
  );
};

const SideDrawer = ({
  activeListing,
  isOpen,
  setOpen,
  mapInstance,
}: ISideDrawer) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => setOpen(e.open)}>
      <Portal>
        <Dialog.Backdrop
          className={css({
            position: "fixed",
            inset: "0",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: "1200",
          })}
        />
        <Dialog.Positioner
          className={css({
            position: "fixed",
            left: "0",
            top: "0",
            bottom: "0",
            zIndex: "1300",
            width: "16rem",
          })}
        >
          <Dialog.Content
            className={css({
              height: "100%",
              width: "100%",
              backgroundColor: "white",
            })}
          >
            <SideGrid activeListing={activeListing} />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

const sliderPhoto = (photo) => {};
const openHours = () => true;
const verifyUI = () => {};
const authUser = () => true;
const isOwner = () => false;

export default SideDrawer;