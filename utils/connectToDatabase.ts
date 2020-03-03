// Import Dependencies
import url from "url";
import { MongoClient, Db } from "mongodb";

// Create cached connection variable
let cachedDb: Db | null = null;

// A function for connecting to MongoDB,
// taking a single parameter of the connection string
async function connectToDatabase(): Promise<Db | null> {
  let uri = process.env.MONGODB_URI;

  // Strip " from start/end of URI
  uri = uri?.slice(1, uri.length - 1);

  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });

  // Select the database through the connection,
  // using the database path of the connection string
  const db = await client.db(url.parse(uri).pathname.substr(1));

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
}

export default connectToDatabase;
