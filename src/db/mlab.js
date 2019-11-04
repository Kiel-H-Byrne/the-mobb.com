const MLAB_KEY = "xg6a4RoaBglG-hNhV-fAWdkr6hKMDZkg";

export const getCollection = collection => {
  const dbOptions = {
    method: "GET",
    url: `https://api.mlab.com/api/1/databases/tkhb_mongodb/collections/${collection}?apiKey=${MLAB_KEY}`
  };

  return fetch(dbOptions.url)
    .then(data => data.json())
    .then(results => results);
};
