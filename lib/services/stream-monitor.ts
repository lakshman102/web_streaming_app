import { EncodingJob } from '@/lib/models/encoding-job'

export interface StreamMetrics {
  fps: number
  bitrate: number
  framesDropped: number
  memory: number
  cpu: number
  uptime: number
  health: 'excellent' | 'good' | 'fair' | 'poor'
}

export class StreamMonitor {
  private metricsInterval: NodeJS.Timeout | null = null
  private listeners: Set<(metrics: StreamMetrics) => void> = new Set()

  async startMonitoring(streamSessionId: string, interval: number = 1000): Promise<void> {
    this.metricsInterval = setInterval(async () => {
      try {
        const jobs = await EncodingJob.find({
          streamSessionId,
          status: 'running',
        })

        if (jobs.length === 0) return

        // Aggregate metrics across all jobs
        const aggregated = this.aggregateMetrics(jobs)
        this.notifyListeners(aggregated)
      } catch (error) {
        console.error('[v0] Monitoring error:', error)
      }
    }, interval)

    console.log(`[v0] Stream monitoring started for ${streamSessionId}`)
  }

  private aggregateMetrics(jobs: any[]): StreamMetrics {
    const avgFps = jobs.reduce((sum, j) => sum + (j.metrics?.fps || 0), 0) / jobs.length
    const avgBitrate = jobs.reduce((sum, j) => sum + (j.metrics?.bitrate || 0), 0) / jobs.length
    const totalDropped = jobs.reduce((sum, j) => sum + (j.metrics?.framesDropped || 0), 0)
    const avgMemory = jobs.reduce((sum, j) => sum + (j.metrics?.memory || 0), 0) / jobs.length
    const avgCpu = jobs.reduce((sum, j) => sum + (j.metrics?.cpu || 0), 0) / jobs.length
    const uptime = Date.now() - (jobs[0]?.startedAt?.getTime() || 0)

    // Determine health based on metrics
    let health: StreamMetrics['health'] = 'excellent'
    if (totalDropped > 100) health = 'poor'
    else if (totalDropped > 50) health = 'fair'
    else if (totalDropped > 10) health = 'good'

    return {
      fps: Math.round(avgFps * 10) / 10,
      bitrate: Math.round(avgBitrate),
      framesDropped: totalDropped,
      memory: Math.round(avgMemory),
      cpu: Math.round(avgCpu),
      uptime,
      health,
    }
  }

  subscribe(listener: (metrics: StreamMetrics) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(metrics: StreamMetrics): void {
    this.listeners.forEach((listener) => listener(metrics))
  }

  async stopMonitoring(): Promise<void> {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval)
      this.metricsInterval = null
    }
    this.listeners.clear()
    console.log('[v0] Stream monitoring stopped')
  }
}

export const createStreamMonitor = () => new StreamMonitor()
