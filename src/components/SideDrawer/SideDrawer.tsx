import React, { useEffect, useState } from "react";
import { Drawer, Button, Grid, Typography } from "@material-ui/core";
import DirectionsIcon from "@material-ui/icons/DirectionsTwoTone";
import CallIcon from "@material-ui/icons/CallTwoTone";
import PublicIcon from "@material-ui/icons/PublicTwoTone";
import LinkIcon from "@material-ui/icons/LinkTwoTone";
import EditIcon from "@material-ui/icons/EditTwoTone";
import FingerprintIcon from "@material-ui/icons/FingerprintTwoTone";
import ShareIcon from "@material-ui/icons/ShareTwoTone";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUserTwoTone";
import WatchLaterIcon from "@material-ui/icons/WatchLaterTwoTone";
import StarIcon from "@material-ui/icons/StarTwoTone";
import RateReviewIcon from "@material-ui/icons/RateReviewTwoTone";
import ListingImage from "../ListingImage";
import { Listing } from "../../db/Types";
import { getGDetails } from "../../util/functions";
import { mCache } from "../../db/mlab";
import "./SideDrawer.scss";

interface OwnProps {
  activeListing: Listing;
  isOpen: boolean;
  mapInstance: any;
  setOpen: (prevOpen) => boolean;
}
const SideDrawer = ({
  activeListing,
  isOpen,
  setOpen,
  mapInstance,
}: OwnProps) => {
  const [thisPlace, setThisPlace] = useState(null);
  const gid = activeListing.google_id;
  useEffect(() => {
    async function getPlace() {
      setThisPlace(
        mCache.has(gid)
          ? mCache.get(gid)
          : await getGDetails({ gid: gid, map: mapInstance })
      );
    }
    if (!gid) {
      //if no google_id, get one and update document.
      //
    } else {
      //if has google id, get placeDetails and set as prop.
      getPlace();
    }
  }, []);

  const toggleDrawer = (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen((prevOpen) => !prevOpen);
  };
  /*
address: "2729 Piatt St, Wichita, KS 67219"
categories: ["Health & Wellness"]
country: "US"
creator: "THQMGTjrvtYww8MvA"
description: "Want to help others make Total Life Changes?"
image: {url: "https://shop.totallifechanges.com/Content/images/Logos/footerlogo.png"}
location: "37.7332579,-97.3121848"
name: "Independent Total Life Changes Distributor"
phone: "3163904404"
submitted: {$date: "2017-09-04T22:49:18.696Z"}
url: "http://www.totallifechanges.com/6923871"
_id: "3Nh99P2JxxCpBGm5v"
*/
  const sideList = ({
    image,
    url,
    address,
    description,
    name,
    phone,
  }: Partial<Listing>) => (
    <Grid
      container
      direction="column"
      alignContent="stretch"
      className={"App_drawer"}
      role="presentation"
    >
      <Grid item>
        <a href={url} title="Listing Image">
          <ListingImage image={image} name={name} url={url} />
        </a>
      </Grid>
      <Grid item>
        <article>
          <Typography variant="subtitle1">{name}</Typography>
          <Typography variant="caption">{description}</Typography>
          <address>
            <Typography variant="overline">{phone}</Typography>
            <Typography variant="body1">{address}</Typography>
          </address>
        </article>
      </Grid>
      <Grid item>
        <Button
          fullWidth
          className={"button"}
          variant="contained"
          startIcon={<DirectionsIcon />}
        >
          Get Directions
        </Button>
      </Grid>
      <hr />
      <div>
        {
          // @ts-ignore
          thisPlace && thisPlace.photos
            ? // @ts-ignore
              thisPlace.photos.map((photo) => {
                console.log(photo.getUrl());
              })
            : null
        }
      </div>
    </Grid>
  );

  return (
    <Drawer
      anchor="left"
      id="side_drawer"
      open={isOpen}
      onClose={(e) => toggleDrawer(e)}
    >
      {/* {sideList(activeListing)} */}
      <LegacyDrawer activeListing={activeListing} />
    </Drawer>
  );
};

export const FavoriteStar = () => {
  return <div></div>;
};

const sliderPhoto = (photo) => {};
const openHours = () => true;
const verifyUI = () => {};
const authUser = () => true;
const isOwner = () => false;

const LegacyDrawer = ({ activeListing }) => {
  const {
    image,
    url,
    description,
    name,
    address,
    street,
    city,
    state,
    zip,
    phone,
    social,
    google_id,
    place,
  } = activeListing;
  return (
    <>
      <ul id="slide-out" className="side-nav sideCard">
        <li>
          <div className="card transparent">
            <div className="card-image">
              {image.url ? (
                <a href="{url}" target="_blank" rel="noopener">
                  <img src={image.url} />
                </a>
              ) : url ? (
                <a href="{url}" target="_blank" rel="noopener">
                  <img src="{getImage url _id}" />
                </a>
              ) : null}
              <span className="card-title">
                {name} <br />
                {description && <em>{description}</em>}
              </span>
            </div>
            <div className="card-content">
              <table className="">
                <tr>
                  {address ? (
                    <>
                      <td>
                        {// style="font-size:100%; margin-right:2px; "
                        }
                          <PublicIcon />
                      </td>
                      <td>{address}</td>
                    </>
                  ) : (
                    <>
                      <td>
                        {// style="font-size:100%; margin-right:2px; "
                        }
                          <PublicIcon />
                      </td>
                      <td>
                        {street}, {city}, {state} {zip}{" "}
                      </td>
                    </>
                  )}
                </tr>
                {url && (
                  <tr>
                    <td>
                      <LinkIcon />
                    </td>
                    <td>
                      <a
                        className="waves-effect"
                        target="_blank"
                        rel="noopener"
                        title="Visit Website"
                        href="{url}"
                      >
                        {url}
                      </a>
                    </td>
                  </tr>
                )}
                {phone && (
                  <tr>
                    <td>
                      {// style="font-size:100%; margin-right:2px; "
                      }
                        <CallIcon />
                    </td>
                    <td>
                      <a
                        className="waves-effect"
                        title="Call Us!"
                        href="tel:+1{phone}"
                      >
                        {phone}
                      </a>{" "}
                    </td>
                  </tr>
                )}
              </table>
              <table className="">
                {social.facebook && (
                  <tr>
                    <td>FB: </td>
                    <td>
                      <a
                        href="https://www.facebook.com/{social.facebook}"
                        target="_blank"
                        rel="noopener"
                      >
                        {" "}
                        @{social.facebook}
                      </a>
                    </td>
                  </tr>
                )}
                {social.instagram && (
                  <tr>
                    <td>IG: </td>
                    <td>
                      <a
                        href="https://www.instagram.com/{social.instagram}"
                        target="_blank"
                        rel="noopener"
                      >
                        {" "}
                        @{social.instagram}
                      </a>
                    </td>
                  </tr>
                )}
                {social.twitter && (
                  <tr>
                    <td>TT: </td>
                    <td>
                      <a
                        href="https://www.twitter.com/{social.twitter}"
                        target="_blank"
                        rel="noopener"
                      >
                        {" "}
                        @{social.twitter}
                      </a>{" "}
                    </td>
                  </tr>
                )}
              </table>
            </div>
            <button className="button_get-directions btn-floating halfway-fab btn-large waves-effect waves-dark z-depth-4 animated">
              <i className="large material-icons">directions</i>
            </button>
          </div>
        </li>
        <li>
          <div className="divider"></div>
        </li>
        <li>
          <ul className="inline-list actionBar">
            <li>
              <a
                className="tooltipped"
                title="Save This Business"
                data-position="bottom"
                data-delay="50"
                data-tooltip="Save This Business"
                aria-label="Save This Business"
              >
                <tr>{FavoriteStar}</tr>
                <tr>Save</tr>
              </a>
            </li>
            {!isOwner() && authUser() ? (
              <li>
                <a
                  className="tooltipped claim_link"
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Claim This Business"
                  aria-label="Claim This Business"
                >
                  <tr>
                    <FingerprintIcon />
                  </tr>
                  <tr>Claim</tr>
                </a>
              </li>
            ) : (
              <li>
                <a
                  className="tooltipped claim_link"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log(
                      "Log In Before Claiming A Business",
                      3000,
                      "myToast"
                    );
                  }}
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Claim This Business"
                  aria-label="Claim This Business"
                >
                  <tr>
                    <FingerprintIcon />
                  </tr>
                  <tr>Claim</tr>
                </a>
              </li>
            )}

            {isOwner() ? (
              <li>
                <a
                  className="modal-trigger tooltipped"
                  title="Edit This Listing"
                  href="#modalEdit"
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Edit This Business"
                  aria-label="Edit This Business"
                >
                  <tr>
                    <EditIcon />
                  </tr>
                  <tr>Edit</tr>
                </a>
              </li>
            ) : authUser() ? null : ( // <!-- NO EDIT BUTTON !-->
              <li>
                <a
                  className="tooltipped"
                  title="Make Suggestion"
                  href="#"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log(
                      "Log In Before Editing A Business",
                      3000,
                      "myToast"
                    );
                  }}
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Make Suggestion"
                  aria-label="Make a Suggestion"
                >
                  <tr>
                    <EditIcon />
                  </tr>
                  <tr>Edit</tr>
                </a>
              </li>
            )}

            <li>
              <a
                className="tooltipped"
                title="Share"
                href="#"
                data-position="bottom"
                data-delay="50"
                data-tooltip="Share This Business"
                aria-label="Share This Business"
              >
                <tr>
                  <ShareIcon />
                </tr>
                <tr>Share</tr>
              </a>
            </li>
            <li className="verifyItem">
              {authUser() ? (
                verifyUI
              ) : (
                <a
                  className="tooltipped modal-trigger"
                  title="Verify"
                  href="#loginModal"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log(
                      "Log In Before Verifying A Business",
                      3000,
                      "myToast"
                    );
                  }}
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Verify This Business"
                  aria-label="Verify This Business"
                >
                  <tr>
                    <VerifiedUserIcon />
                  </tr>
                  <tr>Verify</tr>
                </a>
              )}
            </li>
          </ul>
        </li>

        {google_id && place && (
          <>
            {place.opening_hours && (
              <>
                <li>
                  <div className="divider"></div>
                </li>
                <li className="item_hours">
                  <span className="section-title">
                    <WatchLaterIcon />Hours:{" "}
                  </span>
                  {openHours() ? (
                    <span className="now_open">Open Now!</span>
                  ) : (
                    <span className="now_closed muted">Closed Now</span>
                  )}
                  <ul className="list_hours">
                    {place.opening_hours.weekday_text.map((time) => (
                      <li>{time}</li>
                    ))}
                  </ul>
                </li>
              </>
            )}

            {place.photos && (
              <>
                <li>
                  <div className="divider"></div>
                </li>
                <li className="item_photos">
                  <span className="section-title">
                    <StarIcon />Photos
                  </span>
                  <br />
                  <div className="row photos_wrapper slider">
                    <ul className="slides">
                      {place.photos.map((photo) => sliderPhoto(photo))}
                    </ul>
                  </div>
                </li>
              </>
            )}
            {place.reviews && (
              <>
                <li>
                  <div className="divider"></div>
                </li>
                <li className="item_reviews">
                  <span className="section-title">
                    <StarIcon />Reviews
                  </span>
                  <br />
                  <ul className="collection">
                    {place.reviews.map((review) => (
                      <li className="collection-item">
                        <div className="row">
                          <div className="s4">
                            <div className="">
                              <a href={review.author_url} className="">
                                <img
                                  src={review.profile_photo_url}
                                  alt={review.author_name}
                                  className=""
                                />
                              </a>
                            </div>
                          </div>
                          <div className="s8">
                            <a href={review.author_url}>
                              <h6>{review.author_name}</h6>
                              <span className="">
                                {review.relative_time_description}{" "}
                              </span>{" "}
                            </a>
                            <span
                              className="badge right"
                              data-badge-caption="/5"
                            >
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        {review.text && (
                          <div className="s12">
                            <p>{review.text}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>

                <li>
                  <div className="divider"></div>
                </li>
                <li>
                  <a
                    className="btn button_leave-review"
                    href="https://search.google.com/local/writereview?placeid={google_id}"
                    target="_blank"
                    rel="noopener"
                  >
                    <RateReviewIcon />Leave Your Review
                  </a>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </>
  );
};

export default SideDrawer;
