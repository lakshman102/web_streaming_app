import mongoose from 'mongoose'

export interface DBOptimizationConfig {
  connectionPooling: {
    minPoolSize: number
    maxPoolSize: number
    socketTimeoutMS: number
    serverSelectionTimeoutMS: number
    heartbeatFrequencyMS: number
  }
  indexes: {
    ttlSeconds: number
    backgroundBuild: boolean
  }
  replication: {
    enabled: boolean
    readPreference: 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest'
    w: number
  }
}

export const dbOptimizationConfig: DBOptimizationConfig = {
  connectionPooling: {
    minPoolSize: 10,
    maxPoolSize: 100,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  },
  indexes: {
    ttlSeconds: 3600,
    backgroundBuild: true,
  },
  replication: {
    enabled: true,
    readPreference: 'secondaryPreferred',
    w: 1,
  },
}

export async function optimizeDatabase(uri: string): Promise<void> {
  const options = {
    minPoolSize: dbOptimizationConfig.connectionPooling.minPoolSize,
    maxPoolSize: dbOptimizationConfig.connectionPooling.maxPoolSize,
    socketTimeoutMS: dbOptimizationConfig.connectionPooling.socketTimeoutMS,
    serverSelectionTimeoutMS: dbOptimizationConfig.connectionPooling.serverSelectionTimeoutMS,
    heartbeatFrequencyMS: dbOptimizationConfig.connectionPooling.heartbeatFrequencyMS,
    retryWrites: true,
    w: dbOptimizationConfig.replication.w,
    readPreference: dbOptimizationConfig.replication.readPreference,
  }

  await mongoose.connect(uri, options)

  // Create indexes for common queries
  const db = mongoose.connection.db
  if (db) {
    // StreamSession indexes
    await db.collection('streamsessions').createIndex(
      { userId: 1, createdAt: -1 },
      { background: true }
    )
    await db.collection('streamsessions').createIndex(
      { status: 1, createdAt: -1 },
      { background: true }
    )

    // EncodingJob indexes
    await db.collection('encodingjobs').createIndex(
      { streamSessionId: 1, status: 1 },
      { background: true }
    )
    await db.collection('encodingjobs').createIndex(
      { createdAt: 1 },
      { background: true, expireAfterSeconds: dbOptimizationConfig.indexes.ttlSeconds }
    )

    // Recording indexes
    await db.collection('recordings').createIndex(
      { userId: 1, createdAt: -1 },
      { background: true }
    )
    await db.collection('recordings').createIndex(
      { status: 1 },
      { background: true }
    )

    // Chat message indexes
    await db.collection('chatmessages').createIndex(
      { streamSessionId: 1, createdAt: -1 },
      { background: true }
    )
    await db.collection('chatmessages').createIndex(
      { createdAt: 1 },
      { background: true, expireAfterSeconds: 86400 }
    )

    console.log('[v0] Database optimization indexes created')
  }
}

export async function getConnectionPoolStats(): Promise<any> {
  const conn = mongoose.connection
  return {
    readyState: conn.readyState,
    host: conn.host,
    port: conn.port,
    collections: conn.collections ? Object.keys(conn.collections).length : 0,
  }
}
