import React, { useState, useEffect, createContext } from "react";
import { getCollection } from "../db/mlab";

const initialState = {
  listings: [],
  categories: [],
  selected_categories: {},
  mapInstance: {},
  isDrawerOpen: false,
  isInfoWindowOpen: false,
};
export const AppContext = createContext(initialState);

export const AppProvider = React.memo(({ children }) => {
  const [context, setContext] = useState(initialState);
  async function fetchAll() {
    setContext({
      ...context,
      listings: await getCollection("listings"),
      categories: await getCollection("categories"),
    });
  }
  useEffect(() => {
    console.log('fetching...')
    fetchAll();
  }, []);
  return (
    <AppContext.Provider value={[context, setContext]}>
      {children}
    </AppContext.Provider>
  );
});
