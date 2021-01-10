import { Button, Divider, Fab, Grid, Snackbar } from "@material-ui/core";
import { FingerprintTwoTone } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { useState } from "react";



export const LegacyDrawer = ({ activeListing }) => {
/*

  const {
    _id,
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

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  return (
    <>
      <Grid container  >
        <Grid item>
          <div className="">
            <div className="card-image">
              {image?.url ? (
                <a href="{url}" target="_blank" rel="noopener noreferrer">
                  <img alt="image" src={image.url} />
                </a>
              ) : url ? (
                <a href="{url}" target="_blank" rel="noopener noreferrer">
                  <img alt="image" src="{getImage url _id}" />
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
                        {
                          // style="font-size:100%; margin-right:2px; "
                        }
                        <PublicIcon />
                      </td>
                      <td>{address}</td>
                    </>
                  ) : (
                    <>
                      <td>
                        {
                          // style="font-size:100%; margin-right:2px; "
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
                        rel="noopener noreferrer"
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
                      {
                        // style="font-size:100%; margin-right:2px; "
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
              {social && (
                <table className="">
                  {social.facebook && (
                    <tr>
                      <td>FB: </td>
                      <td>
                        <a
                          href="https://www.facebook.com/{social.facebook}"
                          target="_blank"
                          rel="noopener noreferrer"
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
                          rel="noopener noreferrer"
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
                          rel="noopener noreferrer"
                        >
                          {" "}
                          @{social.twitter}
                        </a>{" "}
                      </td>
                    </tr>
                  )}
                </table>
              )}
            </div>
            <Fab className="button_get-directions">
              <DirectionsIcon />
            </Fab>
          </div>
        </Grid>
        <Divider className="divider" />
        <Grid item>
          <div className="inline-list actionBar">
            <div>
              <Button
                className="tooltipped"
                title="Save This Business"
                data-position="bottom"
                data-delay="50"
                data-tooltip="Save This Business"
                aria-label="Save This Business"
              >
                <FavoriteStar _id={_id} />

                <div>Save</div>
              </Button>
            </div>
            {!isOwner() && authUser() ? (
              <Button
                className="tooltipped "
                data-tooltip="Claim This Business"
                aria-label="Claim This Business"
              >
                <div>
                  <FingerprintIcon />
                </div>
                <div>Claim</div>
              </Button>
            ) : (
              <Grid item>
                <Button
                  className="tooltipped"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSnackBarOpen(true);
                  }}
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Claim This Business"
                  aria-label="Claim This Business"
                >
                  <Snackbar open={snackBarOpen} autoHideDuration={3000}>
                    <Alert severity={"info"}>
                      Log In Before Claiming A Business
                    </Alert>
                  </Snackbar>
                  <div>
                    <FingerprintIcon />
                  </div>
                  <div>Claim</div>
                </Button>
              </Grid>
            )}

            {isOwner() ? (
              <Button
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
              </Button>
            ) : authUser() ? null : ( // <!-- NO EDIT BUTTON !-->
              <Button
                className="tooltipped"
                title="Make Suggestion"
                href="#"
                onClick={() => setSnackBarOpen(true)}
                data-position="bottom"
                data-delay="50"
                data-tooltip="Make Suggestion"
                aria-label="Make a Suggestion"
              >
                <Snackbar open={snackBarOpen} autoHideDuration={3000}>
                  <Alert severity={"info"}>
                    Log In Before Editing A Business
                  </Alert>
                </Snackbar>
                <EditIcon />
                <div>Edit</div>
              </Button>
            )}

            <Button
              className="tooltipped"
              title="Share"
              href="#"
              data-position="bottom"
              data-delay="50"
              data-tooltip="Share This Business"
              aria-label="Share This Business"
            >
              <ShareIcon />
              <div>Share</div>
            </Button>
            <Grid item className="verifyItem">
              {authUser() ? (
                verifyUI
              ) : (
                <Button
                  className="tooltipped modal-trigger"
                  title="Verify"
                  href="#loginModal"
                  onClick={(event) => setSnackBarOpen(true)}
                  data-position="bottom"
                  data-delay="50"
                  data-tooltip="Verify This Business"
                  aria-label="Verify This Business"
                >
                  <Snackbar open={snackBarOpen} autoHideDuration={3000}>
                    <Alert severity={"info"}>
                      Log In Before Verifying A Business
                    </Alert>
                  </Snackbar>
                  <VerifiedUserIcon />
                  <div>Verify</div>
                </Button>
              )}
            </Grid>
          </div>
        </Grid>

        {google_id && place && (
          <>
            {place.opening_hours && (
              <>
                <Grid>
                  <Divider />
                </Grid>
                <Grid className="item_hours">
                  <span className="section-title">
                    <WatchLaterIcon />
                    Hours:{" "}
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
                </Grid>
              </>
            )}

            {place.photos && (
              <>
                <Divider />
                <Grid className="item_photos">
                  <span className="section-title">
                    <StarIcon />
                    Photos
                  </span>
                  <br />
                  <div className="row photos_wrapper slider">
                    <Grid className="slides">
                      {place.photos.map((photo) => sliderPhoto(photo))}
                    </Grid>
                  </div>
                </Grid>
              </>
            )}
            {place.reviews && (
              <>
                <Divider />
                <Grid className="item_reviews">
                  <span className="section-title">
                    <StarIcon />
                    Reviews
                  </span>
                  <br />
                  <Grid className="collection">
                    {place.reviews.map((review) => (
                      <div className="collection-item">
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
                      </div>
                    ))}
                  </Grid>
                </Grid>

                <Divider />
                <Grid>
                  <a
                    className="btn button_leave-review"
                    href="https://search.google.com/local/writereview?placeid={google_id}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RateReviewIcon />
                    Leave Your Review
                  </a>
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>
    </>
  );
  */
};