import { MongoClient } from "mongodb";

const uri =
  "mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const client = new MongoClient(uri);
const conexion = client.connect();
export { conexion };
