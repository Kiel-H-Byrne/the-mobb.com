import { GLocation } from "@/db/Types";

export const targetClient = function (map: any, pos: GLocation) {
  // SET CENTER,
  // ZOOM TO CERTAIN LEVEL
  map.panTo(pos);
  // google.maps.event.trigger(map, 'resize');
  map.setZoom(18);
};

export const GEOCENTER = { lat: 39.8283, lng: -98.5795 };
