import mongoose from "mongoose";
import { MongoClient } from "mongodb";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type MongoClientCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
  var mongoClientCache: MongoClientCache | undefined;
}

const mongooseCache = global.mongooseCache ?? { conn: null, promise: null };
const mongoClientCache = global.mongoClientCache ?? {
  client: null,
  promise: null,
};

global.mongooseCache = mongooseCache;
global.mongoClientCache = mongoClientCache;

export async function connection() {
  if (mongooseCache.conn) return mongooseCache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");

  mongooseCache.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
  });

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) throw new Error("MONGODB_URI is missing");
  if (!dbName) throw new Error("MONGODB_DB is missing");

  if (mongoClientCache.client) {
    return mongoClientCache.client.db(dbName);
  }

  mongoClientCache.promise ??= new MongoClient(uri).connect();
  mongoClientCache.client = await mongoClientCache.promise;

  return mongoClientCache.client.db(dbName);
}
