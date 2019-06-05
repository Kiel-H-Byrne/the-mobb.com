
  export const getCollection = (collection) => {
		const MLAB_KEY="xg6a4RoaBglG-hNhV-fAWdkr6hKMDZkg"
		const uri = `https://api.mlab.com/api/1/databases/tkhb_mongodb/collections/${collection}?apiKey=${MLAB_KEY}`

		fetch(uri)
	  .then(function(response) {
	   if (response.status === 200 ) {
	   	return response.json()
	   } else {
	   	return new Error("bad news")
	   }
	  })
	  .then(function(myJson) {
	    return myJson;
	  });
  }