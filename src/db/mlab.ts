const ATLAS_GUEST_KEY = process.env.NEXT_PUBLIC_ATLAS_GUEST_KEY;
const ATLAS_MEMBER_KEY = process.env.NEXT_PUBLIC_ATLAS_MEMBER_KEY;
const ATLAS_ADMIN_KEY = process.env.NEXT_PUBLIC_ATLAS_ADMIN_KEY;
const ROOT_URI = "https://api.the-mobb.com";

interface IFetchAllCollection {
  collection: string;
  suffix?: string;
  id?: string;
}

interface IFetchOptions {
  method: string;
  headers: Headers;
  body?: BodyInit;
  redirect?: RequestRedirect;
}

export const fetchAllCollection = ({
  collection,
}: IFetchAllCollection): Promise<any> => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_GUEST_KEY);

  const fetchOptions: IFetchOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const uri = `${ROOT_URI}/${collection}`;

  return fetch(uri, fetchOptions)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const fetchOne = ({ collection, id, query }: any): Promise<any> => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_MEMBER_KEY);

  const fetchOptions: IFetchOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const uri = `${ROOT_URI}/${collection}/${id}`;

  return fetch(uri, fetchOptions)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const createListing = ({ data }) => {
  const uri = `${ROOT_URI}/listings`;
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_MEMBER_KEY);
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  const fetchOptions: IFetchOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(data),
    redirect: "follow",
  };
  return fetch(uri, fetchOptions)
    .then((result) => result.text())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const updateListing = ({ id, action }) => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_MEMBER_KEY);

  const requestOptions: IFetchOptions = {
    method: "PUT",
    headers: myHeaders,
    body: action,
    redirect: "follow",
  };

  fetch(`${ROOT_URI}/listings/${id}`, requestOptions)
    .then((response) => response.text())
    .then((result) => result)
    .catch((error) => console.log("error", error));
};

export const removeListing = ({ id }) => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_ADMIN_KEY);

  const requestOptions: IFetchOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(`${ROOT_URI}/listings/${id}`, requestOptions)
    .then((response) => response.text())
    .then((result) => result)
    .catch((error) => console.log("error", error));
};

export const searchCollection = ({ query }): Promise<any> => {
  const myHeaders = new Headers();
  myHeaders.append("x-api-key", ATLAS_MEMBER_KEY);

  const fetchOptions: IFetchOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  const uri = `${ROOT_URI}/search/?name=${query}`;

  return fetch(uri, fetchOptions)
    .then((result) => result.json())
    .then((response) => response)
    .catch((error) => console.error(error));
};

export const mCache = new Map();

/*

**GET** /collections
**GET/POST** /collections/{collection}
**GET** /collections/listings/{_id}

*/
