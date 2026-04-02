import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB, // ✅ FORCE correct DB
  });

  cached.conn = await cached.promise;

  return cached.conn;
};
