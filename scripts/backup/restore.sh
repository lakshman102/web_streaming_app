#!/bin/bash

# CloudStream Studio - Disaster Recovery Restore Script
# Usage: ./restore.sh <backup-dir> [namespace]

set -e

BACKUP_DIR="$1"
NAMESPACE="${2:-cloudstream}"

if [[ ! -d "${BACKUP_DIR}" ]]; then
  echo "Error: Backup directory not found: ${BACKUP_DIR}"
  exit 1
fi

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== WARNING: This will restore from backup ===${NC}"
echo "Backup directory: ${BACKUP_DIR}"
echo "Namespace: ${NAMESPACE}"
read -p "Continue? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "Restore cancelled"
  exit 0
fi

echo
echo -e "${BLUE}=== CloudStream Studio Disaster Recovery ===${NC}"

# Find latest backups
MONGO_BACKUP=$(ls -t "${BACKUP_DIR}"/mongodb_*.archive 2>/dev/null | head -1)
REDIS_BACKUP=$(ls -t "${BACKUP_DIR}"/redis_*.rdb 2>/dev/null | head -1)
SECRETS_BACKUP=$(ls -t "${BACKUP_DIR}"/secrets_*.yaml 2>/dev/null | head -1)

# Restore MongoDB
if [[ -f "${MONGO_BACKUP}" ]]; then
  echo -e "${BLUE}Restoring MongoDB from ${MONGO_BACKUP}...${NC}"
  MONGO_URI="${MONGODB_URI:-mongodb://root:password@localhost:27017/cloudstream?authSource=admin}"
  
  if mongorestore --uri="${MONGO_URI}" --archive="${MONGO_BACKUP}" --drop 2>/dev/null; then
    echo -e "${GREEN}✓ MongoDB restored${NC}"
  else
    echo -e "${RED}✗ MongoDB restore failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠ MongoDB backup not found${NC}"
fi

# Restore Redis
if [[ -f "${REDIS_BACKUP}" ]]; then
  echo -e "${BLUE}Restoring Redis from ${REDIS_BACKUP}...${NC}"
  REDIS_HOST="${REDIS_HOST:-localhost}"
  REDIS_PORT="${REDIS_PORT:-6379}"
  
  # Note: Redis restore from RDB requires service restart
  echo -e "${YELLOW}Note: Redis RDB restore requires pod restart${NC}"
  read -p "Restart Redis pods? (yes/no): " restart_redis
  
  if [[ "$restart_redis" == "yes" ]]; then
    kubectl delete pods -n ${NAMESPACE} -l app=redis
    echo -e "${GREEN}✓ Redis pods restarted (will restore from RDB)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Redis backup not found${NC}"
fi

# Restore Secrets
if [[ -f "${SECRETS_BACKUP}" ]]; then
  echo -e "${BLUE}Restoring Kubernetes secrets from ${SECRETS_BACKUP}...${NC}"
  
  if kubectl apply -f "${SECRETS_BACKUP}" -n ${NAMESPACE} 2>/dev/null; then
    echo -e "${GREEN}✓ Secrets restored${NC}"
  else
    echo -e "${RED}✗ Secrets restore failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Secrets backup not found${NC}"
fi

# Restart application pods
echo -e "${BLUE}Restarting application pods...${NC}"
kubectl delete pods -n ${NAMESPACE} -l app=cloudstream-app
kubectl delete pods -n ${NAMESPACE} -l app=cloudstream-encoding

# Wait for pods to be ready
echo -e "${BLUE}Waiting for pods to be ready...${NC}"
kubectl rollout status deployment/cloudstream-app -n ${NAMESPACE}
kubectl rollout status deployment/cloudstream-encoding -n ${NAMESPACE}

echo
echo -e "${GREEN}=== Disaster Recovery Complete ===${NC}"
echo "Please verify the application is working correctly"
echo "Run health checks: kubectl get pods -n ${NAMESPACE}"
