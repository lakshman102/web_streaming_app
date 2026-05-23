# CloudStream Studio - Production Runbooks

## Table of Contents
1. [Alert Response Procedures](#alert-response-procedures)
2. [Scaling Operations](#scaling-operations)
3. [Database Management](#database-management)
4. [Troubleshooting](#troubleshooting)
5. [Incident Response](#incident-response)

---

## Alert Response Procedures

### High CPU Usage Alert (>70% for 5 minutes)

**Severity:** WARNING

**Response Steps:**
1. Check pod CPU usage: `kubectl top pods -n cloudstream`
2. Review application logs: `kubectl logs <pod-name> -n cloudstream`
3. Identify resource-intensive operations
4. Increase CPU limits if needed or scale horizontally
5. Monitor for 15 minutes to confirm resolution

**Escalation:**
- If persists >30 minutes: Page on-call engineer
- Check for runaway processes or memory leaks

---

### High Memory Usage Alert (>80% of limit)

**Severity:** WARNING

**Response Steps:**
1. Check memory usage: `kubectl top pods -n cloudstream`
2. Identify memory-consuming pods
3. Check for memory leaks: `kubectl describe pod <pod-name> -n cloudstream`
4. If pod keeps restarting, increase memory limit
5. Monitor garbage collection logs

**Escalation:**
- If OOMKilled pods detected: Page on-call engineer immediately
- May indicate memory leak requiring code review

---

### Pod Restart Loop Alert

**Severity:** CRITICAL

**Response Steps:**
1. Check pod status: `kubectl get pods -n cloudstream`
2. View recent restart logs: `kubectl logs --previous <pod-name> -n cloudstream`
3. Check pod events: `kubectl describe pod <pod-name> -n cloudstream`
4. Investigate common causes:
   - Out of memory (check memory limits)
   - Liveness probe failing (check health endpoint)
   - Resource constraints (CPU throttling)
5. If temporary: Pod will recover automatically
6. If persistent: Rollback last deployment

**Escalation:**
- Immediate page to on-call if >3 restarts in 5 minutes

---

### Service Unavailable Alert

**Severity:** CRITICAL

**Response Steps:**
1. Check service status: `kubectl get svc -n cloudstream`
2. Check endpoints: `kubectl get endpoints -n cloudstream`
3. Check pod running status: `kubectl get pods -n cloudstream`
4. Test service connectivity: `kubectl port-forward svc/cloudstream-app 3000:80`
5. Test health endpoint: `curl http://localhost:3000/api/health`
6. Check NGINX logs: `kubectl logs -n ingress-nginx <nginx-pod>`

**Escalation:**
- Immediate incident response if health check fails
- Page on-call engineer immediately

---

### High Error Rate Alert (>5% for 5 minutes)

**Severity:** WARNING

**Response Steps:**
1. Check error logs: `kubectl logs -f <pod-name> -n cloudstream`
2. Filter for errors: `kubectl logs <pod-name> -n cloudstream | grep ERROR`
3. Identify error patterns (database, network, application)
4. Check downstream services (MongoDB, Redis)
5. Review recent deployments for regression
6. If regression confirmed: Rollback deployment

**Escalation:**
- If >15% error rate: Page on-call immediately
- Check MongoDB/Redis connectivity

---

### Slow Response Time Alert (p95 > 1 second)

**Severity:** WARNING

**Response Steps:**
1. Check query performance: `kubectl logs <app-pod> -n cloudstream | grep "duration"`
2. Review slow queries in MongoDB
3. Check database connection pool status
4. Analyze top endpoints: `kubectl logs <pod> | grep "GET\|POST" | sort | uniq -c`
5. Review recent code changes
6. If database issue: Check indexes and statistics

**Escalation:**
- If p99 latency >5 seconds: Page on-call
- Schedule database performance review

---

## Scaling Operations

### Manual Scale Up (if HPA insufficient)

```bash
# Scale encoding service to N replicas
kubectl scale deployment cloudstream-encoding --replicas=N -n cloudstream

# Scale app service (normally fixed at 3)
kubectl scale deployment cloudstream-app --replicas=3 -n cloudstream
```

### Monitor HPA Status

```bash
# Watch autoscaling decisions
kubectl get hpa -n cloudstream -w

# Check detailed HPA metrics
kubectl describe hpa cloudstream-encoding-hpa -n cloudstream
```

### Manual Scale Down (emergency)

```bash
# Scale to minimum safe replicas
kubectl scale deployment cloudstream-encoding --replicas=2 -n cloudstream
```

---

## Database Management

### MongoDB Connection Pool Status

```bash
# Connect to MongoDB
kubectl exec -it <mongo-pod> -n cloudstream -- mongosh

# Check current connections
db.currentOp()

# Check connection pool status
db.adminCommand({ connectionStatus: 1 })
```

### MongoDB Backup & Recovery

```bash
# Manual backup
./scripts/backup/backup.sh ./backups

# Restore from backup
./scripts/backup/restore.sh ./backups cloudstream

# Check backup status
ls -lh ./backups/
```

### Redis Cache Status

```bash
# Connect to Redis
kubectl exec -it <redis-pod> -n cloudstream -- redis-cli

# Check memory usage
INFO memory

# Clear cache if needed
FLUSHDB

# Check key statistics
DBSIZE
```

---

## Troubleshooting

### Connection Refused to App

```bash
# Check if pod is running
kubectl get pods -n cloudstream

# Port forward and test
kubectl port-forward svc/cloudstream-app 3000:80 -n cloudstream
curl http://localhost:3000/api/health

# Check NGINX Ingress
kubectl get ingress -n cloudstream
kubectl describe ingress cloudstream-ingress -n cloudstream
```

### Database Connection Errors

```bash
# Test MongoDB connectivity
kubectl exec <app-pod> -n cloudstream -- curl -I mongodb://mongo:27017

# Check MongoDB logs
kubectl logs <mongo-pod> -n cloudstream

# Verify secrets
kubectl get secret cloudstream-secrets -n cloudstream -o yaml
```

### High Network Latency

```bash
# Check network policies
kubectl get networkpolicies -n cloudstream

# Test pod-to-pod connectivity
kubectl exec <pod-1> -n cloudstream -- ping <pod-2>

# Check NGINX upstream
kubectl describe svc cloudstream-app -n cloudstream
```

---

## Incident Response

### Full Cluster Recovery

1. **Assess situation**
   - Check all pod statuses
   - Review recent changes/deployments
   - Check resource usage

2. **Stop bleeding** (if applicable)
   - Scale down problematic services
   - Kill hung processes
   - Clear stuck jobs

3. **Restore from backup**
   - Follow restore procedures above
   - Verify data integrity
   - Test basic functionality

4. **Communicate**
   - Notify stakeholders
   - Post incident updates
   - Document timeline

5. **Verify recovery**
   - Run smoke tests
   - Check all services healthy
   - Monitor for 30 minutes

### Deployment Rollback

```bash
# View rollout history
kubectl rollout history deployment/cloudstream-app -n cloudstream

# Rollback to previous version
kubectl rollout undo deployment/cloudstream-app -n cloudstream

# Rollback to specific revision
kubectl rollout undo deployment/cloudstream-app --to-revision=2 -n cloudstream

# Verify rollback
kubectl rollout status deployment/cloudstream-app -n cloudstream
```

### Emergency Service Restart

```bash
# Restart all pods (loses temporary state)
kubectl delete pods -l app=cloudstream-app -n cloudstream
kubectl delete pods -l app=cloudstream-encoding -n cloudstream

# Wait for restart
kubectl get pods -n cloudstream -w
```

---

## On-Call Contact

- **Page Duty**: [Link to page duty rotation]
- **Slack Channel**: #cloudstream-oncall
- **Dashboard**: [Grafana dashboard link]
- **Status Page**: [Link to status page]

## Incident Report Template

See INCIDENT_TEMPLATE.md for post-incident review template.
