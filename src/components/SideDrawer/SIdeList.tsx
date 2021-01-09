interface ISideList {
  activeListing: Listing;
  mapInstance: any;
}

const SideList = ({activeListing, mapInstance}: ISideList) => {
  const { image, url, address, description, name, phone } = activeListing;
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
  return (
    <Grid
      container
      direction="column"
      alignContent="stretch"
      // className={"App_drawer"}
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
        <Fab className="button_get-directions">
          <DirectionsIcon />
        </Fab>
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
};