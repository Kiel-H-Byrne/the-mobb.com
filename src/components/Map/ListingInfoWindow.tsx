import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import ListingImage from "../ListingImage";

interface ComponentProps{
  activeListing: object
}

// const ListingInfoWindow = ({ activeListing }: ComponentProps) => {
//   let loc = activeListing.location.split(",");
//   let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
//   const { name, image, url, description } = activeListing;

//   return (
//     <InfoWindow
//       position={locObj}
//       options={{
//         pixelOffset: { height: -30, width: 0 },
//       }}
//     >
//       <div className="App-infowindow">
//         <h5>{name}</h5>
//         <ListingImage image={image} name={name} url={url}/>
//         {description}
//       </div>
//     </InfoWindow>
//   );
// };

// export default React.memo(ListingInfoWindow);
