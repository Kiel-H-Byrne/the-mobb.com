import request from 'request';
//   export const getCollection = (collection) => {
// 	const MLAB_KEY="xg6a4RoaBglG-hNhV-fAWdkr6hKMDZkg"
// 	const uri = `https://api.mlab.com/api/1/databases/tkhb_mongodb/collections/${collection}?apiKey=${MLAB_KEY}`
// 	console.log(uri)
// 	fetch(uri)
// 	.then(function(response) {
// 	if (response.status === 200 ) {
// 		return response.json()
// 	} else {
// 		return new Error("bad news")
// 	}
// 	})
// 	.then(function(myJson) {
// 		return myJson;
// 	});
//   }

export const getCollection = (collection) => {
	const MLAB_KEY="xg6a4RoaBglG-hNhV-fAWdkr6hKMDZkg"
	const dbOptions = {
		method: 'GET',
		url: `https://api.mlab.com/api/1/databases/tkhb_mongodb/collections/${collection}?apiKey=${MLAB_KEY}`
	}
	
	return new Promise(function(resolve,reject){
		request(dbOptions, function (error, response, body) {
			if (error) return reject(error)
		try {
			let rawArr = JSON.parse(body);
			let collection = Object.assign({},...rawArr.map(n => ({[n._id]: n}) ))
			resolve(collection);
		} catch(e) {
			reject(e)
		}
		});
	})
}