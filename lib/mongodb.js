import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongodInstance = null;

async function getMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Try default local mongodb first
  const defaultLocal = 'mongodb://127.0.0.1:27017/football_bid';
  try {
    const net = await import('net');
    const isReachable = await new Promise((resolve) => {
      const socket = net.createConnection({ port: 27017, host: '127.0.0.1' }, () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => resolve(false));
      socket.setTimeout(800, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (isReachable) {
      return defaultLocal;
    }
  } catch (e) {
    // ignore
  }

  // Fallback to in-memory mongodb for instant zero-config DB
  if (!global.__MONGOD_URI__) {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      global.__MONGOD_URI__ = mongodInstance.getUri();
      console.log('⚡ Using MongoMemoryServer for instant zero-config DB:', global.__MONGOD_URI__);
    } catch (err) {
      console.warn('Could not launch MongoMemoryServer, falling back to local URI:', err.message);
      return defaultLocal;
    }
  }

  return global.__MONGOD_URI__ || defaultLocal;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      const uri = await getMongoUri();
      const m = await mongoose.connect(uri, opts);
      return m;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
