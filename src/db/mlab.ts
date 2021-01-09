const ATLAS_KEY = process.env.NEXT_PUBLIC_ATLAS_KEY;
// const ROOT_URL = "https://api.mlab.com/api/1/databases/tkhb_mongodb"
// const ROOT_URI = "https://mobb-db.herokuapp.com/api/1/databases/tkhb_mongodb"
const ROOT_URI = "https://zw9bicu0l0.execute-api.us-east-1.amazonaws.com/dev";

interface IFetchAllCollection {
  collection: string;
  suffix?: string;
  id?: string;
}

export const fetchAllCollection = ({
  collection,
  suffix,
}: IFetchAllCollection): Promise<any> => {
  const uri = `${ROOT_URI}/${collection}${suffix ? `&${suffix}` : ''}`;
  // console.log(uri)
  const fetchOptions = {
    // headers: {`Access-Control-Allow-Origin`}
  }
  return fetch(uri, fetchOptions)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const fetchOne = ({
  collection,
  id, 
  query,
}: any): Promise<any> => {
  const uri = `${ROOT_URI}/${collection}/${id}${query && `&${query}`}`;
  return fetch(uri)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const createListing = (data) => {
  const uri = `${ROOT_URI}/listings`;
  const fetchOptions = {
    method: "POST",
    headers: {
      "X-API-KEY": `${ATLAS_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  return fetch(uri, fetchOptions)
    .then((result) => result.text())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const updateListing = () => {};

export const removeListing = (params) => {};

export const mCache = new Map();

/*

**GET** /collections
**GET/POST** /collections/{collection}
**GET** /collections/listings/{_id}

*/
