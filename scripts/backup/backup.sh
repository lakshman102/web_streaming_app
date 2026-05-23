#!/bin/bash

# CloudStream Studio - MongoDB & Redis Backup Script
# Usage: ./backup.sh [backup-dir] [retention-days]

set -e

BACKUP_DIR="${1:-.}/backups"
RETENTION_DAYS="${2:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== CloudStream Studio Backup Script ===${NC}"
echo "Backup directory: ${BACKUP_DIR}"
echo "Retention: ${RETENTION_DAYS} days"
echo

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# MongoDB Backup
echo -e "${BLUE}Backing up MongoDB...${NC}"
MONGO_BACKUP="${BACKUP_DIR}/mongodb_${TIMESTAMP}.archive"

# Get MongoDB connection string from Kubernetes secret or environment
MONGO_URI="${MONGODB_URI:-mongodb://root:password@localhost:27017/cloudstream?authSource=admin}"

if mongodump --uri="${MONGO_URI}" --archive="${MONGO_BACKUP}" 2>/dev/null; then
  MONGO_SIZE=$(du -h "${MONGO_BACKUP}" | cut -f1)
  echo -e "${GREEN}✓ MongoDB backup complete (${MONGO_SIZE})${NC}"
  echo "  Location: ${MONGO_BACKUP}"
else
  echo -e "${RED}✗ MongoDB backup failed${NC}"
  exit 1
fi

# Redis Backup
echo -e "${BLUE}Backing up Redis...${NC}"
REDIS_BACKUP="${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"

if redis-cli --uri="${REDIS_URL:-redis://localhost:6379}" BGSAVE > /dev/null 2>&1; then
  sleep 2
  if redis-cli --uri="${REDIS_URL:-redis://localhost:6379}" --rdb "${REDIS_BACKUP}" > /dev/null 2>&1; then
    REDIS_SIZE=$(du -h "${REDIS_BACKUP}" | cut -f1)
    echo -e "${GREEN}✓ Redis backup complete (${REDIS_SIZE})${NC}"
    echo "  Location: ${REDIS_BACKUP}"
  else
    echo -e "${RED}✗ Redis backup copy failed${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ Redis backup save failed${NC}"
  exit 1
fi

# Backup Secrets
echo -e "${BLUE}Backing up Kubernetes secrets...${NC}"
SECRETS_BACKUP="${BACKUP_DIR}/secrets_${TIMESTAMP}.yaml"

if kubectl get secrets -n cloudstream -o yaml > "${SECRETS_BACKUP}" 2>/dev/null; then
  SECRETS_SIZE=$(du -h "${SECRETS_BACKUP}" | cut -f1)
  echo -e "${GREEN}✓ Secrets backup complete (${SECRETS_SIZE})${NC}"
  echo "  Location: ${SECRETS_BACKUP}"
else
  echo -e "${RED}✗ Secrets backup failed${NC}"
  exit 1
fi

# Cleanup old backups
echo -e "${BLUE}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "*.archive" -o -name "*.rdb" -o -name "*.yaml" | while read file; do
  if [[ $(find "$file" -mtime +${RETENTION_DAYS} 2>/dev/null) ]]; then
    rm -f "$file"
    echo "  Deleted: $(basename $file)"
  fi
done

echo
echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Total backups: $(ls -1 ${BACKUP_DIR}/*.{archive,rdb,yaml} 2>/dev/null | wc -l)"
echo "Total size: $(du -sh ${BACKUP_DIR} | cut -f1)"
