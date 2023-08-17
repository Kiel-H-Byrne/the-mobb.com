import { memo, useState } from "react";

import { GoogleMap, LoadScript, MarkerClusterer } from "@react-google-maps/api";

import { GEOCENTER } from "../../util/functions";

import ListingInfoWindow from "./ListingInfoWindow";
import MapAutoComplete from "./MapAutoComplete";
import MyMarker from "./MyMarker";

import { Category, Libraries, Listing } from "../../db/Types";
import SideDrawer from "../SideDrawer/SideDrawer";
import style from "./AppMap.module.scss";
const libraries: Libraries = [
  "places",
  "visualization",
  "geometry",
  "localContext",
];

const clusterStyles = [
  {
    url: "img/map/m1.png",
    height: 53,
    width: 53,
    anchor: [26, 26],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/map/m2.png",
    height: 56,
    width: 56,
    anchor: [28, 28],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/map/m3.png",
    height: 66,
    width: 66,
    anchor: [33, 33],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/map/m4.png",
    height: 78,
    width: 78,
    anchor: [39, 39],
    textColor: "#000",
    textSize: 11,
  },
  {
    url: "img/map/m5.png",
    height: 90,
    width: 90,
    anchor: [45, 45],
    textColor: "#000",
    textSize: 11,
  },
];

const defaultProps = {
  center: GEOCENTER,
  zoom: 5, //mobb0
  options: {
    backgroundColor: "#555",
    clickableIcons: true,
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: true,
    // zoomControlOptions: {
    //   position: window.google.maps.ControlPosition.RIGHT_CENTER,
    // },
    mapTypeControl: false,
    // mapTypeControlOptions: {
    //   style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    //   position: window.google.maps.ControlPosition.RIGHT_CENTER,
    //   mapTypeIds: ['roadmap', 'terrain']
    // },
    scaleControl: false,
    rotateControl: true,
    streetViewControl: false,
    // streetViewControlOptions: {
    //   position: window.google.maps.ControlPosition.BOTTOM_CENTER,
    // },
    //gestureHandling sets the mobile panning on a scrollable page: COOPERATIVE, GREEDY, AUTO, NONE
    gestureHandling: "greedy",
    scrollwheel: true,
    maxZoom: 18,
    minZoom: 4, //3 at mobbv0
    // Map styles; snippets from 'Snazzy Maps'.
    styles: [
      {
        featureType: "administrative",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#C3BBAE",
          },
        ],
      },
      {
        featureType: "administrative",
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#565250",
          },
        ],
      },
      {
        featureType: "administrative.country",
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#5C5A6F",
          },
        ],
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#FFFAF3",
          },
        ],
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#696969",
          },
        ],
      },
      {
        featureType: "administrative.neighborhood",
        elementType: "labels.text.stroke",
        stylers: [
          {
            color: "#696969",
          },
        ],
      },
      {
        featureType: "landscape",
        elementType: "all",
        stylers: [
          {
            color: "#FBB03B",
          },
          {
            weight: 2,
          },
        ],
      },
      {
        featureType: "landscape",
        elementType: "geometry.fill",
        stylers: [
          {
            color: "#565250",
          },
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [
          {
            hue: "#003300",
          },
          {
            saturation: -80,
          },
          {
            lightness: -5,
          },
          {
            gamma: 0.3,
          },
          {
            visibility: "simplified",
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "poi.business",
        elementType: "geometry",
        stylers: [
          {
            saturation: -10,
          },
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "all",
        stylers: [
          {
            saturation: -60,
          },
          {
            lightness: -45,
          },
        ],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [
          {
            color: "#FBB03B",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "labels.text.stroke",
        stylers: [
          {
            weight: 4,
          },
          {
            color: "#484848",
          },
        ],
      },
      {
        featureType: "road",
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "all",
        stylers: [
          {
            visibility: "simplified",
          },
          {
            color: "#323232",
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "transit.station.bus",
        elementType: "all",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "transit.station.bus",
        elementType: "geometry",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "transit.station.bus",
        elementType: "labels",
        stylers: [
          {
            visibility: "off",
          },
          {
            hue: "#ff0000",
          },
        ],
      },
      {
        featureType: "transit.station.bus",
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
          {
            hue: "#ff2300",
          },
        ],
      },
      {
        featureType: "transit.station.rail",
        elementType: "geometry",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "transit.station.rail",
        elementType: "labels",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "transit.station.rail",
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "on",
          },
        ],
      },
      {
        featureType: "water",
        elementType: "all",
        stylers: [
          {
            color: "#ffffff",
          },
          {
            visibility: "on",
          },
        ],
      },
    ],
  },
};

interface IAppMap {
  listings: Listing[];
  categories: Category[];
  browserLocation: any;
  setMapInstance: any;
  mapInstance: any;
}

const AppMap = memo(
  ({
    listings,
    categories,
    browserLocation,
    setMapInstance,
    mapInstance,
  }: IAppMap) => {
    const [isDrawerOpen, setisDrawerOpen] = useState(false);
    const [isInfoWindowOpen, setisInfoWindowOpen] = useState(false);
    const [activeListing, setactiveListing] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState(
      new Set(categories)
    );

    let { center, zoom, options } = defaultProps;
    return (
      // Important! Always set the container height explicitly via mapContainerClassName
      <LoadScript
        id="script-loader"
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
        language="en"
        region="us"
        libraries={libraries}
      >
        <GoogleMap
          onLoad={(map) => {
            // const bounds = new window.google.maps.LatLngBounds();
            setMapInstance(map);
          }}
          id="GMap"
          mapContainerClassName={style.map}
          center={browserLocation || center}
          zoom={browserLocation ? 16 : zoom}
          options={options}
        >
          <MapAutoComplete
            listings={listings}
            categories={categories}
            mapInstance={mapInstance}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
          />
          {listings && (
            <MarkerClusterer
              styles={clusterStyles}
              // onClick={(event) =>{console.log(event.getMarkers())}}
              gridSize={23}
              // minimumClusterSize={3}
            >
              {(clusterer) =>
                //* mongodb must have had indexed object instead of flat array
                // Object.values(listings).
                listings.map((listing: Listing) => {
                  //return marker if element categories array includes value from selected_categories\\
                  if (
                    listing.categories &&
                    listing.categories.some((el: Category) =>
                      selectedCategories.has(el)
                    )
                    // && mapInstance.containsLocation(listings.location)
                  ) {
                    // if (listing.location) {
                    //   const [lat, lng] = listing.location.split(",");

                    //   let isInside = new window.google.maps.LatLngBounds().contains(
                    //     { lat: +lat, lng: +lng }
                    //   );
                    //   // console.log(isInside);
                    // }
                    return (
                      // return (
                      //   listing.categories
                      //     ? listing.categories.some((el) =>
                      //         selected_categories.includes(el)
                      //       )
                      //     : false
                      // ) ? (

                      <MyMarker
                        key={`marker-${listing._id}`}
                        //@ts-ignore
                        data={listing}
                        clusterer={clusterer}
                        setactiveListing={setactiveListing}
                        setisDrawerOpen={setisDrawerOpen}
                        setisInfoWindowOpen={setisInfoWindowOpen}
                        selectedCategories={selectedCategories}
                      />
                    );
                  }
                })
              }
            </MarkerClusterer>
          )}
          {activeListing && isInfoWindowOpen && (
            <ListingInfoWindow activeListing={activeListing} />
          )}

          {activeListing && isDrawerOpen && (
            <SideDrawer
              activeListing={activeListing}
              isOpen={isDrawerOpen}
              setOpen={setisDrawerOpen}
              mapInstance={mapInstance}
            />
          )}

          {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
        </GoogleMap>
      </LoadScript>
    );
  }
);

export default AppMap;
