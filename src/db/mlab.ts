const MLAB_KEY = process.env.REACT_APP_MLAB_KEY;
// const ROOT_URL = "https://api.mlab.com/api/1/databases/tkhb_mongodb"
const ROOT_URI = "https://mobb-db.herokuapp.com/api/1/databases/tkhb_mongodb"
const URI_SUFFIX = `?apiKey=${MLAB_KEY}&l=100000`

interface IFetchCollection {
  collection: string; 
  method: "GET" | "POST" | "PUT" | "DELETE"
  id?: string;
}

export const fetchCollection = ({collection, id = '', method}: IFetchCollection): Promise<any> => {
  const dbOptions = {
    method,
    url: `${ROOT_URI}/collections/${collection}${id}${URI_SUFFIX}`,
  };
  return fetch(dbOptions.url)
    .then((data) => data.json())
    .then((results) => results);
};

export const mCache = new Map();

/*

**GET** /collections
**GET/POST** /collections/{collection}
**GET** /collections/listings/{_id}

*/
