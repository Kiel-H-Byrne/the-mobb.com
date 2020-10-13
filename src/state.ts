import { createGlobalState } from "react-hooks-global-state";

const initialState = {
  listings: [],
  categories: [],
  selected_categories: {},
  active_listing: {},
  mapInstance: {},
  isDrawerOpen: false,
  isInfoWindowOpen: false,
};

export const { useGlobalState } = createGlobalState(initialState);
