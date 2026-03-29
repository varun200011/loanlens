# LoanLens — Operations Runbook

**Owner:** DevOps Team  
**Last updated:** 2026-03-25

---

## 1. Local Development

```bash
# Start everything
cp .env.example .env && nano .env   # set JWT_SECRET
docker compose up --build

# Access points
# App:       http://localhost:3000
# API:       http://localhost:8080
# Swagger:   http://localhost:8080/swagger-ui.html
# Prometheus:http://localhost:9090
# Grafana:   http://localhost:3001  (admin / $GRAFANA_PASS)

# Demo login
# email: demo@loanlens.app
# pass:  Demo@1234

# Tear down
docker compose down -v
```

---

## 2. Deploy to Staging

Automatic on push to `develop` branch via GitHub Actions.

Manual trigger:
```bash
git push origin develop
# Monitor: GitHub Actions → CI pipeline → deploy-staging job
```

---

## 3. Deploy to Production

```bash
# 1. Merge develop → main
git checkout main && git merge develop && git push origin main

# 2. GitHub Actions runs full CI pipeline
# 3. Staging E2E tests must pass
# 4. Manual approval required in GitHub Actions → deploy-production

# 5. Monitor rollout
kubectl rollout status deployment/loanlens-backend -n loanlens-prod
kubectl rollout status deployment/loanlens-frontend -n loanlens-prod
```

---

## 4. Rollback Production

```bash
# Immediate rollback (uses previous ReplicaSet)
kubectl rollout undo deployment/loanlens-backend -n loanlens-prod
kubectl rollout undo deployment/loanlens-frontend -n loanlens-prod

# Verify
kubectl rollout status deployment/loanlens-backend -n loanlens-prod

# Rollback to specific revision
kubectl rollout undo deployment/loanlens-backend -n loanlens-prod --to-revision=2
```

---

## 5. Rotate JWT Secret

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 48)

# 2. Update k8s secret
kubectl create secret generic loanlens-jwt-secret \
  --from-literal=secret="$NEW_SECRET" \
  -n loanlens-prod --dry-run=client -o yaml | kubectl apply -f -

# 3. Restart pods to pick up new secret (forces all existing tokens to expire)
kubectl rollout restart deployment/loanlens-backend -n loanlens-prod

# ⚠️ WARNING: This invalidates ALL existing JWT tokens — all users will be logged out
```

---

## 6. Database Backup

```bash
# Manual backup
kubectl exec -n loanlens-prod deployment/loanlens-backend -- \
  mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS loanlens > backup-$(date +%Y%m%d).sql

# Restore
kubectl exec -i -n loanlens-prod deployment/loanlens-backend -- \
  mysql -h $DB_HOST -u $DB_USER -p$DB_PASS loanlens < backup-YYYYMMDD.sql
```

---

## 7. Scaling

```bash
# Manual scale backend
kubectl scale deployment loanlens-backend --replicas=4 -n loanlens-prod

# HPA adjusts automatically based on CPU:
# Min: 2 pods, Max: 6 pods, Target CPU: 70%

# Check HPA status
kubectl get hpa -n loanlens-prod
```

---

## 8. Monitoring Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| High error rate | > 1% for 2 min | Check app logs, consider rollback |
| High latency | p99 > 2s | Scale up or investigate slow queries |
| Pod restarts | > 3 in 5 min | Check OOM, review memory limits |
| DB connections | > 80% pool | Increase `spring.datasource.hikari.maximum-pool-size` |

```bash
# View application logs
kubectl logs -f deployment/loanlens-backend -n loanlens-prod --tail=100

# View with trace ID
kubectl logs deployment/loanlens-backend -n loanlens-prod | grep "traceId=abc123"

# Check pod health
kubectl describe pod -l app=loanlens,component=backend -n loanlens-prod
```

---

## 9. Grafana Dashboards

Access: https://grafana.loanlens.app (credentials in AWS Secrets Manager)

| Dashboard | What to check |
|-----------|---------------|
| API Overview | Request rate, error rate, p95 latency |
| JVM Metrics | Heap usage, GC pauses, thread count |
| Business Metrics | Stress simulations/day, report generations, new registrations |

---

## 10. Common Issues

### App returns 500 on stress simulate
1. Check logs for `NullPointerException` — user may have no income set
2. Verify Redis is reachable: `kubectl exec deployment/loanlens-backend -- redis-cli -h $REDIS_HOST ping`

### JWT token rejected (401) after secret rotation
- Expected — all users must log in again
- If NOT after rotation: check `app.jwt.secret` env var is set correctly

### Flyway migration failure on startup
```bash
# Check migration status
kubectl exec deployment/loanlens-backend -- java -jar app.jar --spring.flyway.repair=true
# Or manually fix:
kubectl exec deployment/loanlens-backend -- mysql -e "UPDATE flyway_schema_history SET success=1 WHERE version='2';"
```

### PDF reports not generating
1. Check `/tmp/loanlens-reports/` is writable in the pod
2. In prod: verify S3 bucket policy allows `s3:PutObject`
3. Check iText license if using commercial features (v8 community is free)
