import React, { Component } from "react";
import {
  GoogleMap,
  LoadScript,
  MarkerClusterer
  // HeatmapLayer
} from "@react-google-maps/api";
import { connect } from "react-redux";

import { GEOCENTER } from "../../util/functions";
import m1 from "./images/m1.png";
import m2 from "./images/m2.png";
import m3 from "./images/m3.png";
import m4 from "./images/m4.png";
import m5 from "./images/m5.png";
import * as ACTIONS from "../../actions/actionConstants";

import MyMarker from "./MyMarker";
import ListingInfoWindow from "./ListingInfoWindow";
// import CenterButton from './CenterButton'
import MapAutoComplete from "./MapAutoComplete";

const clusterStyles = [
  {
    url: m1,
    height: 53,
    width: 53,
    anchor: [26, 26],
    textColor: "#000",
    textSize: 11
  },
  {
    url: m2,
    height: 56,
    width: 56,
    anchor: [28, 28],
    textColor: "#000",
    textSize: 11
  },
  {
    url: m3,
    height: 66,
    width: 66,
    anchor: [33, 33],
    textColor: "#000",
    textSize: 11
  },
  {
    url: m4,
    height: 78,
    width: 78,
    anchor: [39, 39],
    textColor: "#000",
    textSize: 11
  },
  {
    url: m5,
    height: 90,
    width: 90,
    anchor: [45, 45],
    textColor: "#000",
    textSize: 11
  }
];

const libraries = ["visualization", "places"];

class AppMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null
    };
  }
  static defaultProps = {
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
      maxZoom: 14,
      minZoom: 3,
      // Map styles; snippets from 'Snazzy Maps'.
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            }
          ]
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 30
            }
          ]
        },
        {
          featureType: "landscape.man_made",
          elementType: "geometry",
          stylers: [
            {
              color: "#000"
            },
            {
              lightness: 10
            }
          ]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            }
          ]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 29
            },
            {
              weight: 0.2
            }
          ]
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 18
            }
          ]
        },
        {
          featureType: "road.local",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 16
            }
          ]
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [
            {
              color: "#fff"
            },
            {
              lightness: 21
            }
          ]
        },
        {
          elementType: "labels.text.stroke",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#000000"
            },
            {
              lightness: 25
            }
          ]
        },
        {
          elementType: "labels.text.fill",
          stylers: [
            {
              saturation: 36
            },
            {
              color: "#000000"
            },
            {
              lightness: 50
            }
          ]
        },
        {
          elementType: "labels.icon",
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 19
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.fill",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 20
            }
          ]
        },
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [
            {
              color: "#000000"
            },
            {
              lightness: 17
            },
            {
              weight: 1.2
            }
          ]
        }
      ]
    }
  };

  handleMouseOverCluster = cluster => {
    this.setState({
      showInfoWindows: true
    });
  };

  render() {
    let { center, zoom, options } = this.props;
    let { mapLoaded, markerInfo, listingsData, browserLoc } = this.props;

    //Render What? A HOC that loads the google-maps-sdk, the Map container and all components within it.
    //Render Map
    //Render WAN Markers (cluster, but change colors...)
    //Render LAN Markers (Cluster)
    //Render Info Window(s)
    // console.log(this.props)
    // let lanData = Object.values(data).filter(x => isHome(x.ip_local));
    // let wanData = Object.values(data).filter(x => !isHome(x.ip_local))
    // const listingData = [{"name":"store name", "address":"134 random address","createdBy": "randomuserId"},{"name":"another store name", "address":"2343 random address","createdBy": "randomuserId234"}]
    // let locArray = wanData.map(x => {
    //   let locObjs = {"lat": parseFloat(x.location.split(",")[0]), "lng": parseFloat(x.location.split(",")[1]) }
    //   return locObjs
    //   } )
    // const { handleMouseOverCluster} = this;
    return (
      // Important! Always set the container height explicitly
      //set via app-map classname

      <LoadScript
        id="script-loader"
        googleMapsApiKey="AIzaSyAuvQtaNuOF1phJQcTv3ytk9VyNCrlrOO4"
        language="en"
        region="us"
        libraries={libraries}
      >
        <GoogleMap
          onLoad={map => {
            // const bounds = new window.google.maps.LatLngBounds();
            mapLoaded(map);
          }}
          id="GMap"
          mapContainerClassName="App-map"
          center={browserLoc || center}
          zoom={zoom}
          options={options}
        >
          <MapAutoComplete />
          {listingsData && (
            <MarkerClusterer
              styles={clusterStyles}
              // onClick={(event) =>{console.log(event.getMarkers())}}
              minimumClusterSize={3}
            >
              {clusterer =>
                Object.values(listingsData).map(z => (
                  <MyMarker key={z._id} data={z} clusterer={clusterer} />
                ))
              }
            </MarkerClusterer>
          )}
          {markerInfo && (
            <ListingInfoWindow
              position={markerInfo.location}
              data={markerInfo}
            />
          )}

          {/* <CenterButton /> */}
          {/* <HeatmapLayer map={this.state.map && this.state.map} data={data.map(x => {x.location})} /> */}
        </GoogleMap>
      </LoadScript>
    );
  }
}
//Redux
function mapStateToProps(state) {
  return {
    state,
    markerInfo: state.map.showInfoWindow
  };
}
function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    mapLoaded: map => dispatch({ type: ACTIONS.MAP_LOADED, payload: map })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppMap);
