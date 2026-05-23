# CloudStream Studio - Deployment Guide

## Overview
CloudStream Studio is designed for scalable deployment across multiple environments: local development, staging, and production. This guide covers deployment on Kubernetes with Docker containerization.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           NGINX Ingress / Load Balancer              │
└────────────────┬──────────────────────────────────────┘
                 │
     ┌───────────┴────────────┐
     │                        │
┌────▼────────┐    ┌──────────▼──────┐
│ App Pods     │    │ Encoding Pods   │
│ (3x 1CPU)    │    │ (2-10x 2CPU)    │
└────┬────────┘    └────────┬────────┘
     │                      │
     └──────────┬───────────┘
                │
     ┌──────────▼───────────┐
     │   MongoDB Replica    │
     │   Set (3 nodes)      │
     └──────────────────────┘
                │
     ┌──────────▼───────────┐
     │   Redis Cache        │
     │   (Sentinel Mode)    │
     └──────────────────────┘
```

## Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (1.24+)
- kubectl CLI configured
- MongoDB 5.0+
- Redis 6.0+
- NGINX Ingress Controller

## Local Development

### Using Docker Compose

```bash
cd /path/to/cloudstream
docker-compose up -d
```

This starts:
- App on `localhost:3000`
- Encoding service on `localhost:3001`
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- NGINX on `localhost:80`

### Environment Variables

Create `.env.local`:
```
MONGODB_URI=mongodb://root:password@mongo:27017/cloudstream?authSource=admin
REDIS_URL=redis://redis:6379
NODE_ENV=development
```

## Kubernetes Deployment

### 1. Build and Push Docker Images

```bash
# Build images
docker build -f docker/Dockerfile.app -t your-registry/cloudstream-app:latest .
docker build -f docker/Dockerfile.encoding -t your-registry/cloudstream-encoding:latest .

# Push to registry
docker push your-registry/cloudstream-app:latest
docker push your-registry/cloudstream-encoding:latest
```

### 2. Create Kubernetes Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. Create Secrets

```bash
kubectl create secret generic cloudstream-secrets \
  --from-literal=mongodb-uri="mongodb://user:pass@mongo:27017/cloudstream" \
  --from-literal=redis-url="redis://redis:6379" \
  -n cloudstream
```

### 4. Deploy Applications

```bash
# Deploy app
kubectl apply -f k8s/app-deployment.yaml

# Deploy encoding service with HPA
kubectl apply -f k8s/encoding-deployment.yaml

# Wait for deployments
kubectl rollout status deployment/cloudstream-app -n cloudstream
kubectl rollout status deployment/cloudstream-encoding -n cloudstream
```

### 5. Verify Deployments

```bash
# Check pod status
kubectl get pods -n cloudstream

# Check services
kubectl get svc -n cloudstream

# Check HPA status
kubectl get hpa -n cloudstream
```

## Auto-Scaling Configuration

### Horizontal Pod Autoscaler (Encoding)

The encoding service automatically scales based on:
- CPU utilization > 70%
- Memory utilization > 80%

Scaling parameters:
- Min replicas: 2
- Max replicas: 10
- Scale-up response: <30 seconds
- Scale-down response: 5 minutes (cooldown)

### Monitor HPA Status

```bash
kubectl describe hpa cloudstream-encoding-hpa -n cloudstream
kubectl get hpa cloudstream-encoding-hpa -n cloudstream -w
```

## Monitoring & Observability

### Prometheus Metrics

Metrics available at: `/api/metrics`

Key metrics:
- `http_request_duration_seconds` - API response times
- `encoding_jobs_active` - Active encoding count
- `stream_connections_active` - Active streams
- `database_connections` - DB connection pool usage

### View Prometheus Dashboard

```bash
kubectl port-forward -n cloudstream svc/prometheus 9090:9090
# Visit: http://localhost:9090
```

### View Grafana Dashboards

```bash
kubectl port-forward -n cloudstream svc/grafana 3000:3000
# Visit: http://localhost:3000
# Default: admin/admin
```

## Database Optimization

### Connection Pooling

- Min pool size: 10
- Max pool size: 100
- Socket timeout: 45s
- Server selection timeout: 5s

### TTL Indexes

Temporary data automatically cleaned:
- Encoding jobs: 1 hour
- Chat messages: 24 hours

### Read Replicas

Read queries prefer secondary replicas with `secondaryPreferred` preference.

## Production Checklist

- [ ] Docker images built and pushed to registry
- [ ] Kubernetes cluster provisioned (min 3 nodes)
- [ ] MongoDB replica set configured
- [ ] Redis Sentinel configured
- [ ] SSL certificates configured
- [ ] Secrets created in Kubernetes
- [ ] NGINX Ingress configured with SSL
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

## Scaling to 100+ Concurrent Streams

### Expected Performance

With current configuration:
- App replicas: 3 × 1 CPU = 3 CPU cores
- Encoding replicas: Auto-scale 2-10 × 2 CPU = 4-20 CPU cores
- Total capacity: ~100 concurrent 1080p streams
- MongoDB: Replica set with 3 nodes
- Redis: Sentinel mode with 3 nodes

### Optimization Strategies

1. **Increase Node Count**: Add more worker nodes to cluster
2. **Upgrade Resource Limits**: Increase CPU/memory in deployment specs
3. **Database Optimization**: Implement sharding for massive scale
4. **CDN**: Use CDN for static assets and recording playback
5. **Separate Services**: Use separate clusters for encoding/app

## Disaster Recovery

### Backup Strategy

MongoDB:
```bash
# Daily snapshots
mongodump --uri "mongodb://..." --archive=/backup/cloudstream-$(date +%Y%m%d).archive
```

Redis:
```bash
# Persistence enabled in docker-compose
# AOF and RDB snapshots
```

### Recovery

```bash
# MongoDB restore
mongorestore --uri "mongodb://..." --archive=/backup/cloudstream-20240101.archive

# Redis restore from snapshot
# Automatically restored on startup
```

## Troubleshooting

### Pod not starting

```bash
kubectl describe pod <pod-name> -n cloudstream
kubectl logs <pod-name> -n cloudstream
```

### HPA not scaling

```bash
kubectl top nodes
kubectl top pods -n cloudstream
kubectl describe hpa cloudstream-encoding-hpa -n cloudstream
```

### Database connection issues

```bash
# Check connection pool
curl http://localhost:3000/api/health

# Check MongoDB
kubectl exec -it <mongo-pod> -- mongosh
```

### High latency

Check metrics:
```bash
# View slow queries
kubectl logs <app-pod> -n cloudstream | grep "duration"

# Check resource usage
kubectl top pods -n cloudstream
```

## Rollout Strategy

### Canary Deployment

```bash
# Update image in deployment
kubectl set image deployment/cloudstream-app \
  cloudstream-app=your-registry/cloudstream-app:v1.0.1 \
  -n cloudstream

# Monitor rollout
kubectl rollout status deployment/cloudstream-app -n cloudstream

# Rollback if needed
kubectl rollout undo deployment/cloudstream-app -n cloudstream
```

## Cost Optimization

1. **Right-size Resources**: Use resource requests/limits appropriately
2. **Use Node Affinity**: Schedule pods on cheaper node types
3. **Spot Instances**: Use spot instances for encoding service (non-critical)
4. **Reserved Instances**: For app and database tier (critical)
5. **Auto-scale Down**: Aggressively scale down during off-peak hours

## Performance Targets

- API response time p95: < 1 second
- Stream start latency: < 2 seconds
- Encoding startup: < 3 seconds
- Concurrent streams: 100+
- Availability: 99.9%
