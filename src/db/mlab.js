const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://tkhb:Vivitr0n@ds139715.mlab.com/tkhb_mongodb?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});