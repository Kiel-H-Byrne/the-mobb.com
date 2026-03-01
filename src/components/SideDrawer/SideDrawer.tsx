import ListingImage from "@/components/ListingImage";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerPositioner
} from "@/components/ui/Drawer";
import { Listing } from "@/db/Types";
import { css } from "@styled/css";
import { Dispatch, SetStateAction } from "react";
import { MdDirections } from "react-icons/md";

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
        <Button size="lg" variant="solid" className={css({ marginTop: "4" })}>
          <MdDirections size={24} />
        </Button>
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
    <Drawer open={isOpen} onOpenChange={(e) => setOpen(e.open)}>
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent className={css({ p: 0, maxWidth: "16rem", w: "full" })}>
          <DrawerBody className={css({ p: 0 })}>
            <SideGrid activeListing={activeListing} />
          </DrawerBody>
        </DrawerContent>
      </DrawerPositioner>
    </Drawer>
  );
};

const sliderPhoto = (photo) => { };
const openHours = () => true;
const verifyUI = () => { };
const authUser = () => true;
const isOwner = () => false;

export default SideDrawer;