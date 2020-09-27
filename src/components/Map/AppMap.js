import React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  GoogleMap,
  LoadScript,
  MarkerClusterer,
  // HeatmapLayer
} from "@react-google-maps/api";

import { GEOCENTER } from "../../util/functions";
import m1 from "./images/m1.png";
import m2 from "./images/m2.png";
import m3 from "./images/m3.png";
import m4 from "./images/m4.png";
import m5 from "./images/m5.png";
import * as ACTIONS from "../../actions/actionConstants";

import MyMarker from "./MyMarker";
import ListingInfoWindow from "./ListingInfoWindow";
import MapAutoComplete from "./MapAutoComplete";
import ClosestCard from "../ClosestCard/ClosestCard";

const clusterStyles = [
  {
    url: m1,
    height: 53,
    width: 53,
    anchor: [26, 26],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: m2,
    height: 56,
    width: 56,
    anchor: [28, 28],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: m3,
    height: 66,
    width: 66,
    anchor: [33, 33],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: m4,
    height: 78,
    width: 78,
    anchor: [39, 39],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: m5,
    height: 90,
    width: 90,
    anchor: [45, 45],
    textColor: "#000",
    textSize: 11,
  },
];

const libraries = ["visualization", "places", "geometry", "localContext"];

const AppMap = ({listings}) => {
  const dispatch = useDispatch();
  const markerInfo = useSelector((state) => state.map.showInfoWindow);
  const browserLoc = useSelector((state) => state.session.browser_location);
  const closestListing = useSelector((state) => state.session.closest_listing);
  const selected_categories = useSelector(
    (state) => state.categories.selected_categories
  );

  const defaultProps = {
    center: GEOCENTER,
    zoom: 5,
    options: {
      clickableIcons: false,
      disableDefaultUI: false,
      fullscreenControl: false,
      mapTypeControl: false,
      scaleControl: false,
      rotateControl: true,
      streetViewControl: false,
      gestureHandling: "cooperative",
      scrollwheel: true,
      maxZoom: 18,
      minZoom: 4,
      // Map styles; snippets from 'Snazzy Maps'.
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 17,
            },
          ],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 30,
            },
          ],
        },
        {
          featureType: "landscape.man_made",
          elementType: "geometry",
          stylers: [
            {
              color: "#000",
            },
            {
              lightness: 10,
            },
          ],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 17,
            },
          ],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 29,
            },
            {
              weight: 0.2,
            },
          ],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 18,
            },
          ],
        },
        {
          featureType: "road.local",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 16,
            },
          ],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              color: "#fff",
            },
            {
              lightness: 21,
            },
          ],
        },
        {
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "on",
            },
            {
              color: "#000000",
            },
            {
              lightness: 25,
            },
          ],
        },
        {
          elementType: "labels.text.fill",
          stylers: [
            {
              saturation: 36,
            },
            {
              color: "#000000",
            },
            {
              lightness: 50,
            },
          ],
        },
        {
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off",
            },
          ],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 19,
            },
          ],
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 20,
            },
          ],
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000",
            },
            {
              lightness: 17,
            },
            {
              weight: 1.2,
            },
          ],
        },
      ],
    },
  };

  const mapLoaded = (map) =>
    dispatch({ type: ACTIONS.MAP_LOADED, payload: map });

  let { center, zoom, options } = defaultProps;

  return (
    // Important! Always set the container height explicitly
    //set via app-map classname
    <LoadScript
      id="script-loader"
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
      language="en"
      region="us"
      libraries={libraries}
    >
      <GoogleMap
        onLoad={(map) => {
          // const bounds = new window.google.maps.LatLngBounds();
          mapLoaded(map);
        }}
        id="GMap"
        mapContainerClassName="App-map"
        center={browserLoc || center}
        zoom={browserLoc ? 16 : zoom}
        options={options}
      >
        <MapAutoComplete />
        {listings && (
          <MarkerClusterer
            styles={clusterStyles}
            // onClick={(event) =>{console.log(event.getMarkers())}}
            minimumClusterSize={3}
          >
            {(clusterer) =>
              Object.values(listings).map((listing) => {
                //return marker if element categories array includes value from selected_categories
                return (
                  listing.categories
                    ? listing.categories.some((el) =>
                        selected_categories.includes(el)
                      )
                    : false
                ) ? (
                  <MyMarker
                    key={listing._id}
                    data={listing}
                    clusterer={clusterer}
                  />
                ) : null;
              })
            }
          </MarkerClusterer>
        )}
        {markerInfo && (
          <ListingInfoWindow position={markerInfo.location} data={markerInfo} />
        )}
        {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
        {closestListing && <ClosestCard closestListing={closestListing} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default AppMap;
