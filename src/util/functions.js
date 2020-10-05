/* eslint-disable no-unused-vars */
import { GCache } from "./../db/cache.js";
import "./../db/mlab.js";

//====== APP GLOBALS ======
const clientMarker = null;
const clientRadius = null;
const MAP_ZOOM = 4;
const MAP_MARKERS = [];
const MAP_CLUSTER = {};
const AGENT_MARKERS = [];
const MARKER_GROUPS = {};

const { $, GoogleMaps, google } = () => {
  "null";
};


// getOGS = function(url) {
//   let options = {
//     'url': url,
//     'timeout': 4000
//   };
//   ogs(options, function (err, results) {
//     if (err) {
//       console.log('OGS Error:', err); // This is returns true or false. True if there was a error. The error it self is inside the results object.
//       console.log('OGS Results:', results);
//     } else {
//       console.log('OGS Results:', results);
//     }
//   });
// };

// dlImage = async function(url) {

//   const options = {
//     "url": url,
//     "dest": '/public/img'
//   };

//   try {
//     const { filename, image } = await download.image(options);
//     console.log(filename) // => /path/to/dest/image.jpg;
//   } catch (e) {
//     throw e;
//   }

// }



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

// const getGDetails = function (gid) {
//   if (GoogleMaps.loaded()) {
//     console.log("Details Data from API...");
//     //   //get the response and stash it in GCache.
//     const map = GoogleMaps.maps.map;
//     console.log(map);
//     const service = new google.maps.places.PlacesService(map.instance);
//     const req = {
//       placeId: gid,
//     };
//     const cbk = function (res, stat) {
//       if (stat === google.maps.places.PlacesServiceStatus.OK) {
//         console.log(res);
//         // ID_Cache.findOne({key: key}, {$set: {value: place_id}});
//         // Meteor.call('setGCache', gid, res);
//         // resolvedData.set('placeDetails', res);
//         // Session.set('thisPlace', res);
//         return res;
//         //inject with jquery into dom?
//       } else {
//         console.log(stat);
//       }
//     };
//     return service.getDetails(req, cbk);
//   } else {
//     console.log("no map loaded");
//   }
// };



















export const getOG = async (url) => {
  // check(url, String);
  // check(id, String);

  if (!url) {
    console.log(`No URL for ${url}, so no OpenGraph Data.`);
    return false;
  } else {
    let param = encodeURIComponent(url);
    // console.log(param);
    // console.log(`***calling OPENGRAPH API method with URL ${param} and KEY ${Meteor.settings.public.keys.openGraph.key}`);
    let apiUrl = `https://opengraph.io/api/1.0/site/${param}?app_id=${process.env.REACT_APP_OG_KEY}`;
    // console.log("--OGP REQ URL--"+apiUrl);
    const response = await fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => data);
    if (response.error) {
      console.error(`OGP FAILED:::${response.error.message}`);
      return "http://placeimg.com/89/50/arch/sepia";
    }

    const res = {};

    const hiObj = response.htmlInferred;
    let hgObj = response.hybridGraph.image ? response.hybridGraph : null;
    let ogObj =
      !response.openGraph.error && response.openGraph.image
        ? response.openGraph
        : null;

    res.obj = hgObj || ogObj || hiObj;
    // console.log(res.obj);

    // img = (ogObj) ? ogObj.image.url : (hgObj) ? hiObj.image : (hiObj) ? hiObj.image_guess : console.log("no img");
    let img = res.obj.image
      ? res.obj.image || res.obj.image.url
      : res.obj.image_guess
      ? res.obj.image_guess
      : res.obj.images[0];

    // description = (ogObj) ? ogObj.description || ogObj.title : (hgObj) ? hgObj.description || hgObj.title : (hiObj) ? hiObj.description || hiObj.title : console.log("no descr");;
    let description = res.obj.description || res.obj.title || null;
    if (description && description.length > 200) {
      description = description.substring(0, 200);
    }

    const status = response.requestInfo.responseCode;
    // console.log(status);
    if (img) {
      // uri = encodeURIComponent(img);
      // console.log(img);
      // if (uri.includes('http://')) {
      if (img.includes("http://")) {
        img = img.replace("http://", "https://images.weserv.nl/?url=");
        // console.log(img);
      }
      // else if (img.includes('https://')) {
      // else if (img.includes('https://')) {
      //   uri = img.replace("https://", "https://images.weserv.nl/?url=ssl:");
      //   console.log(uri);
      // }
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

      console.log(img);
      return img;
    }
  }
};

export const targetClient = function (map, pos) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  map.panTo(pos);
  // google.maps.event.trigger(map, 'resize');
  map.setZoom(12);
};

export const toPosition = (location) => {
  let latLng = location.split(",");
  let lat = Number(latLng[0]);
  let lng = Number(latLng[1]);
  let pos = new window.google.maps.LatLng({ lat: lat, lng: lng });
  return pos;
};

export const findClosestMarker = function (listings, location) {
  // marker {position: latlngObj, map: mapinstnace, icon: iconurl}
  let distances = [];
  let closest = -1;
  const start = new window.google.maps.LatLng(location);
  for (let i = 0; i < listings.length; i++) {
    if (listings[i].location) {
      let d = window.google.maps.geometry.spherical.computeDistanceBetween(
        toPosition(listings[i].location),
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

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const isHome = (ip) => {
  const home_octets = [
    "114",
    "117",
    "123",
    "126",
    "112",
    "124",
    "108",
    "101",
    "103",
    "111",
    "109",
    "126",
    "150",
  ];
  let base = ip.split(".")[0];
  let octet = ip.split(".")[1];
  if (base === "10" && home_octets.includes(octet)) {
    return true;
  }
  return false;
};

export function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export function getSorting(order, orderBy) {
  return order === "desc"
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

export function panToMarker(map, pos) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  console.log(pos);
  map.panTo(pos);
  map.setZoom(11);
}

export const GEOCENTER = { lat: 39.8283, lng: -98.5795 };
