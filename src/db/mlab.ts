"use server";

const ATLAS_KEY = process.env.NEXT_PUBLIC_ATLAS_KEY;
const ROOT_URI = "https://mobb-db.herokuapp.com/api/1/databases/tkhb_mongodb";
// const ROOT_URI = "https://api.the-mobb.com";

interface IFetchAllCollection {
  collection: string;
  suffix?: string;
  id?: string;
}
const transformData = (data) => {
  //url, name, image, description, phone, address

  const myData = {};
  myData["url"] = data.website;
  myData["name"] = data.name;
  myData["image"] = data.image_url;
  myData["description"] = data.description;
  myData["phone"] = data.phone;
  myData["address"] = data.streetaddress;
  myData["location"] = `${data.loc_lat},${data.loc_lng}`;
  return myData;
};

export const fetchExternalCollection = async () => {
  const uri = "https://api2.storepoint.co/v1/15ee507f4584f8/locations?rq";

  const fetched = await fetch(uri)
    .then((r) => r.json())
    .then((data) => data)
    .catch((e) => console.warn(e));

  const newSet = await fetched?.results.locations.map((l) => transformData(l))
  return newSet
};

export const fetchAllCollection = ({
  collection,
  suffix,
}: IFetchAllCollection): Promise<any> => {
  const uri = `${ROOT_URI}/${collection}${suffix ? `&${suffix}` : ""}`;
  // console.log(uri)
  const fetchOptions = {};
  return fetch(uri, fetchOptions)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.warn(error));
};

export const fetchOne = ({ collection, id, query }: any): Promise<any> => {
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

export const updateListing = () => { };

export const removeListing = (params) => { };

export const mCache = new Map();

/*

**GET** /collections
**GET/POST** /collections/{collection}
**GET** /collections/listings/{_id}

*/
