import prom from 'prom-client'

// Create default metrics
prom.collectDefaultMetrics()

// HTTP request metrics
export const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
})

export const httpRequestsTotal = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

// Encoding metrics
export const encodingJobsActive = new prom.Gauge({
  name: 'encoding_jobs_active',
  help: 'Number of active encoding jobs',
})

export const encodingJobsCompleted = new prom.Counter({
  name: 'encoding_jobs_completed',
  help: 'Total encoding jobs completed',
  labelNames: ['status'],
})

export const encodingDuration = new prom.Histogram({
  name: 'encoding_duration_seconds',
  help: 'Encoding duration in seconds',
  labelNames: ['platform', 'quality'],
  buckets: [60, 300, 600, 1800, 3600, 7200],
})

// Stream metrics
export const streamConnections = new prom.Gauge({
  name: 'stream_connections_active',
  help: 'Number of active stream connections',
})

export const streamFramesProcessed = new prom.Counter({
  name: 'stream_frames_processed_total',
  help: 'Total stream frames processed',
  labelNames: ['stream_id'],
})

export const streamBitrate = new prom.Gauge({
  name: 'stream_bitrate_kbps',
  help: 'Current stream bitrate in kbps',
  labelNames: ['stream_id'],
})

// Database metrics
export const databaseQueryDuration = new prom.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
})

export const databaseConnections = new prom.Gauge({
  name: 'database_connections',
  help: 'Active database connections',
  labelNames: ['type'],
})

// Cache metrics
export const cacheHits = new prom.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['key'],
})

export const cacheMisses = new prom.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['key'],
})

export const cacheSize = new prom.Gauge({
  name: 'cache_size_bytes',
  help: 'Current cache size in bytes',
})

// Middleware to track HTTP metrics
export function metricsMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000
    const route = req.route?.path || req.path || 'unknown'

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration)

    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc()
  })

  next()
}

// Export metrics endpoint
export async function getMetrics(): Promise<string> {
  return prom.register.metrics()
}

export function recordStreamFrame(streamId: string): void {
  streamFramesProcessed.labels(streamId).inc()
}

export function recordEncodingCompletion(status: string, platform: string, quality: string, duration: number): void {
  encodingJobsCompleted.labels(status).inc()
  encodingDuration.labels(platform, quality).observe(duration)
}

export function updateStreamBitrate(streamId: string, bitrate: number): void {
  streamBitrate.labels(streamId).set(bitrate)
}
