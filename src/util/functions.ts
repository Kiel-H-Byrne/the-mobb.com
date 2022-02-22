import { useState, useEffect } from "react";
import { Listing, GLocation } from "../db/Types";
import { mCache } from "../db/mlab";

export const useFetchOG = (url: string) => {
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelRequest = false;
    if (!url) return;

    const fetchData = async () => {
      setStatus("fetching");

      if (mCache.has(url)) {
        setData(mCache.get(url));
        setStatus("FETCHED_CACHE");
      } else {
        try {
          const data = await fetch(url)
            .then((data) => data.json())
            .then((results) => results);
          console.log(data);
          setData(data);
          setStatus("FETCHED");
        } catch (error) {
          if (cancelRequest) return;
          setStatus(`FETCH_ERROR: ${error}`);
        }
      }
    };

    fetchData();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [url]);

  return { status, data };
};

export const useFetchPlace = (url: string) => {
  
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelRequest = false;
    if (!url) return;

    const fetchData = async () => {
      setStatus("fetching");

      if (mCache.has(url)) {
        setData(mCache.get(url));
        setStatus("FETCHED_CACHE");
      } else {
        try {
          const data = await fetch(url)
            .then((data) => data.json())
            .then((results) => results);
          console.log(data);
          setData(data);
          setStatus("FETCHED");
        } catch (error) {
          if (cancelRequest) return;
          setStatus(`FETCH_ERROR: ${error}`);
        }
      }
    };

    fetchData();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [url]);

  return { status, data };
};

// const toggleGroup = function (type) {
//   for (let i = 0; i < MARKER_GROUPS[type].length; i++) {
//     let marker = MARKER_GROUPS[type][i];
//     if (!marker.getVisible()) {
//       marker.setVisible(true);
//       //add to cluster
//       MAP_CLUSTER.addMarker(marker);
//       // console.log('setting marker visible!');
//       //marker.setMap(map);
//     } else {
//       marker.setVisible(false);
//       // console.log('setting marker invisible!');
//       //marker.setMap(null);
//       //remove from cluster
//       MAP_CLUSTER.removeMarker(marker);
//     }
//   }
// };

// const installSW = function () {
//   if ("serviceWorker" in navigator) {
//     window.addEventListener("load", function () {
//       navigator.serviceWorker
//         .register("/sw.js")
//         .then(function (registration) {
//           // Registration was successful
//           // console.log('ServiceWorker registration successful with scope: ', registration.scope);
//         })
//         .catch(function (err) {
//           // registration failed :(
//           console.log("ServiceWorker registration failed: ", err);
//         });
//     });
//   }
// };

// const getLocation = async function() {
//   //const or let??
//     let pos = await Geolocation.latLng();
//     return pos;
// };

// const targetBrowser = function (map) {
//   // SET CENTER,
//   // ZOOM TO CERTAIN LEVEL
//   const pos = Session.get('browserLoc');
//   if (pos) {
//     map.instance.panTo(pos);
//     map.instance.setZoom(8);
//   }
// };

// export const placeMyMarker = (mapInstance, pos) => {
// CREATE MARKER IF IT DOESN'T ALREADY EXIST,
//SET MARKER POSITION

// google.maps.event.trigger(map, 'resize');
//would only not exist if the template reloaded and the browser didn't...(dev mode)
// const radius = 3;

// clientRadius = new google.maps.Circle({
//   map: map.instance,
//   center: pos,
//   radius: (radius * 1609.34),
//   strokeColor: '#FF7733',
//   strokeOpacity: 0.2,
//   strokeWeight: 2,
//   fillColor: '#FFAA00',
//   fillOpacity: 0.10,
// });

// $(document).ready(function () {
//   $('[id="centerButton_button"]').removeClass("pulse");
// });
// };

// const hideImg = function () {
//   $(this).css({ display: "none" });
//   console.log("img broken");
// };

// const setGReviews = function (gid) {
//   if (gid) {
//     let dataFromCache = GCache.get(gid);
//     const res = {};
//     if (dataFromCache) {
//       console.log("Reviews Data from GCache...");
//       console.log(dataFromCache);
//       return dataFromCache;
//     } else {
//       if (GoogleMaps.loaded()) {
//         console.log("Reviews Data from API...");
//         //   //get the response and stash it in GCache.
//         // const map = GoogleMaps.maps[Object.keys(GoogleMaps.maps)[0]];
//         // console.log(map);
//         // const service = new google.maps.places.PlacesService(map.instance);

//         const req = {
//           placeId: gid,
//         };
//         const cbk = function (res, stat) {
//           // if (stat === google.maps.places.PlacesServiceStatus.OK) {
//           //     // Session.set('thisPlace', res);
//           //     console.log(res);
//           //     GCache.set(gid, res);
//           //     return res;
//           //     //inject with jquery into dom?
//           // } else {
//           //     console.log(stat);
//           // }
//         };

//         // console.log(service);
//         // service.getDetails(req, cbk);

//         // return resolvedData.get('placeDetails');
//       } else {
//         console.log("Map not yet loaded...");
//       }
//     }
//   } else {
//     console.log("no Google ID");
//     //NO GOOGLE ID
//     return false;
//   }
// };
export const getGDetails = ({gid, map}) => {
    console.log("Details Data from API...");
    //   //get the response and stash it in GCache.
    return new Promise<any>(function (resolve, reject) {
      // @ts-ignore
      const service = new window.google.maps.places.PlacesService(map);
      const req = { placeId: gid };
      const cbk = (place, status) => {
        // @ts-ignore
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          mCache.set(gid, place);
          resolve(place);
          //inject with jquery into dom?
        } else {
          console.error(status);
        }
      };
      service.getDetails(req, cbk);
    });
};


export const getOG = async (url: string) => {
  // check(url, String);
  // check(id, String);

  if (!url) {
    console.log(`No URL for ${url}, so no OpenGraph Data.`);
    return false;
  } else {
    let param = encodeURIComponent(url);
    // console.log(param);
    // console.log(`***calling OPENGRAPH API method with URL ${param} and KEY ${Meteor.settings.public.keys.openGraph.key}`);
    let apiUrl = `https://opengraph.io/api/1.0/site/${param}?app_id=${process.env.NEXT_PUBLIC_OG_KEY}`;
    // console.log("--OGP REQ URL--"+apiUrl);
    if (mCache.has(param)) {
      console.log("from cache...." + param);
      return mCache.get(param);
    } else {
      const response = await fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => data);
      if (response.error) {
        console.error(`OGP FAILED:::${response.error.message}`);
        return "http://placeimg.com/89/50/arch/sepia";
      }

      const hiObj = response.htmlInferred;
      let hgObj = response.hybridGraph.image ? response.hybridGraph : null;
      let ogObj =
        !response.openGraph.error && response.openGraph.image
          ? response.openGraph
          : null;

      let res = hgObj || ogObj || hiObj;

      let img = res?.image || res?.image?.url || res?.image_guess || res?.images[0];

      // description = (ogObj) ? ogObj.description || ogObj.title : (hgObj) ? hgObj.description || hgObj.title : (hiObj) ? hiObj.description || hiObj.title : console.log("no descr");;
      // let description = res.description || res.title || null;
      // if (description && description.length > 200) {
      //   description = description.substring(0, 200);
      // }

      // const status = response.requestInfo.responseCode;
      // console.log(status);
      if (img) {
        if (img.includes("http://")) {
          img = img.replace("http://", "https://images.weserv.nl/?url=");
        }

        //this was causing schema to balk; had to add "if this.isInsert" to location autovalue.
        //sibling fields were returning undefined in schemas during update process.

        // Listings.update(
        //   {
        //     _id: id,
        //   },
        //   {
        //     $set: {
        //       "image.url": img,
        //       description: description,
        //     },
        //   }
        // );
        mCache.set(param, img);
        return img;
      }
    }
  }
};

export const targetClient = function (map: any, pos: any) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  map.panTo(pos);
  // google.maps.event.trigger(map, 'resize');
  map.setZoom(12);
};

export const toPositionObj = (location: string | undefined) => {
  if (location) {
    let latLng = location.split(",");
    let lat = Number(latLng[0]);
    let lng = Number(latLng[1]);
    let pos = new (window as any).google.maps.LatLng({ lat: lat, lng: lng });
    return pos;
  }
};

export const findClosestMarker = function (
  listings: Listing[],
  location: GLocation
) {
  // marker {position: latlngObj, map: mapinstnace, icon: iconurl}
  let distances = [""];
  let closest = -1;
  const start = new (window as any).google.maps.LatLng(location);
  for (let i = 0; i < listings.length; i++) {
    if (listings[i].location) {
      let d = (window as any).google.maps.geometry.spherical.computeDistanceBetween(
        toPositionObj(listings[i].location),
        start
      );
      distances[i] = d;
      if (closest === -1 || d < distances[closest]) {
        closest = i;
      }
    }
  }
  const closestMarker = listings[closest];
  return closestMarker;
};

// --- unused ---

// export const isHome = (ip) => {
//   const home_octets = [
//     "114",
//     "117",
//     "123",
//     "126",
//     "112",
//     "124",
//     "108",
//     "101",
//     "103",
//     "111",
//     "109",
//     "126",
//     "150",
//   ];
//   let base = ip.split(".")[0];
//   let octet = ip.split(".")[1];
//   if (base === "10" && home_octets.includes(octet)) {
//     return true;
//   }
//   return false;
// };

// export function desc(a, b, orderBy) {
//   if (b[orderBy] < a[orderBy]) {
//     return -1;
//   }
//   if (b[orderBy] > a[orderBy]) {
//     return 1;
//   }
//   return 0;
// }

// export function stableSort(array, cmp) {
//   const stabilizedThis = array.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = cmp(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   return stabilizedThis.map((el) => el[0]);
// }

// export function getSorting(order, orderBy) {
//   return order === "desc"
//     ? (a, b) => desc(a, b, orderBy)
//     : (a, b) => -desc(a, b, orderBy);
// }

// export function panToMarker(map, pos) {
//   // SET CENTER,
//   // ZOOM TO CERTAIN LEVEL
//   console.log(pos);
//   map.panTo(pos);
//   map.setZoom(11);
// }

export const GEOCENTER = { lat: 39.8283, lng: -98.5795 };

export const getDistance = (start: string, dest: string): string => {
  //Take destination, calculate distance from my location, convert to miles, return distance string.
  const latLng = dest.split(",");

  const lat = Number(latLng[0]);
  const lng = Number(latLng[1]);
  const latLngObj = { lat: lat, lng: lng };

  // let start = new (window as any).google.maps.LatLng(Session.get("clientLoc"));
  // if (!start) return ;

  const finish = new (window as any).google.maps.LatLng(latLngObj);

  let dist = new (window as any).google.maps.geometry.spherical.computeDistanceBetween(
    start,
    finish
  );
  // multiply meters by 0.000621371 for number of miles.
  let res = (dist * 0.000621371).toFixed(1);

  if (res.length > 5) {
    //3432.0 = 6, shorten to 3.4k
    res = `${res.slice(0, 1)}.${res.slice(1, 2)}k`;
  } else if (res.length === 5) {
    //502.3, shorten to 3 places.
    res = res.slice(0, 3);
  }
  return res;
};

export const placesSearch = async ({ name, location }) => {
  // SEARCHES FOR A GOOGLE PLACE_ID GIVEN NAME AND latLong (CAN ALSO USE ADDRESS, NAME, LOCATION)
  // RETURNS GOOGLE ID

  //requ'd: key, location, radius (meters),
  // optional: keyword ()
  const key = process.env.GOOGLE_SERVER_KEY;
  name = encodeURIComponent(name);
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=100&keyword=${name}&key=${key}`;

  try {
    const response = await fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => data);
    console.log(response);
  } catch (error) {
    console.error(`--GOOGLE PLACES: FAILED:::${error.message}`);
    console.error(error);
  }


  // console.log("--GOOGLE PLACES: NEARBY SEARCH --");
  // // console.log("--GOOGLE PLACES: NEARBY SEARCH URL--"+apiUrl);
  // // console.log("still running");
  // if (response && response.results.length !== 0) {
  //   console.log(response);
  //   const result = response.results[0];
  //   if (result.scope == "GOOGLE") {
  //     console.log(name, result.place_id);
  //     return result.place_id;
  //   };
  // } else {
  //   //NO RESULTS, offer to submit to google
  //   console.log("NO GOOGLE_ID FOR " + name);
  //   return false;
  // }
};
