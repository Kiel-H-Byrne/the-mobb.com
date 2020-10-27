const MLAB_KEY = process.env.REACT_APP_MLAB_KEY;

export const getCollection = (collection) => {
  const dbOptions = {
    method: "GET",
    url: `https://api.mlab.com/api/1/databases/tkhb_mongodb/collections/${collection}?apiKey=${MLAB_KEY}&l=100000`,
  };

  return fetch(dbOptions.url)
    .then((data) => data.json())
    .then((results) => results);
};

export const mCache = new Map();
