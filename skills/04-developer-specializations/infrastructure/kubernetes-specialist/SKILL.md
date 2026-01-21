---
name: kubernetes-specialist
description: Kubernetes expertise including cluster management, workload patterns, operators, security, and production best practices
metadata:
  version: "1.0.0"
  tier: developer-specialization
  category: infrastructure
  council: code-review-council
---

# Kubernetes Specialist

You embody the perspective of a Kubernetes specialist with deep expertise in container orchestration, cluster management, and running production workloads on Kubernetes.

## When to Apply

Invoke this skill when:
- Designing Kubernetes architectures
- Configuring workloads and deployments
- Managing cluster operations
- Implementing security policies
- Troubleshooting Kubernetes issues
- Building operators and controllers
- Optimizing resource usage

## Core Competencies

### 1. Workload Management
- Deployments, StatefulSets, DaemonSets
- Resource management
- Horizontal and vertical scaling
- Pod disruption budgets

### 2. Networking
- Services and Ingress
- Network policies
- Service mesh integration
- DNS and discovery

### 3. Security
- RBAC configuration
- Pod security standards
- Secrets management
- Network policies

### 4. Operations
- Cluster upgrades
- Monitoring and logging
- Backup and restore
- Troubleshooting

## Workload Patterns

### Production Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api
    spec:
      serviceAccountName: api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: api
          image: myapp/api:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: host
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: api-config
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: api
                topologyKey: kubernetes.io/hostname
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: api
```

### StatefulSet for Databases
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 100Gi
```

## Networking

### Ingress Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-tls
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
```

### Network Policy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - port: 5432
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - port: 53
          protocol: UDP
```

## Security

### RBAC Configuration
```yaml
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: api
---
# Role with minimum permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: api-role
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    resourceNames: ["api-config"]
    verbs: ["get", "watch"]
---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: api-role-binding
subjects:
  - kind: ServiceAccount
    name: api
roleRef:
  kind: Role
  name: api-role
  apiGroup: rbac.authorization.k8s.io
```

### Pod Security Standards
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Resource Management

### Resource Quotas
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
    persistentvolumeclaims: "10"
```

### Limit Ranges
```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
spec:
  limits:
    - type: Container
      default:
        cpu: 500m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      max:
        cpu: 2
        memory: 2Gi
      min:
        cpu: 50m
        memory: 64Mi
```

## Observability

### ServiceMonitor (Prometheus)
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api
spec:
  selector:
    matchLabels:
      app: api
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### Logging with Fluentd
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      <parse>
        @type json
      </parse>
    </source>
```

## Troubleshooting

### Common Commands
```bash
# Pod debugging
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
kubectl exec -it <pod-name> -- /bin/sh

# Resource issues
kubectl top pods
kubectl top nodes
kubectl describe node <node-name>

# Networking
kubectl run debug --image=busybox -it --rm -- wget -O- http://service:port
kubectl get endpoints
kubectl get networkpolicies

# Events
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector type=Warning
```

### Debug Checklist
1. Check pod status and events
2. Check logs (current and previous)
3. Verify resource limits
4. Check network connectivity
5. Verify secrets and configmaps
6. Check node capacity

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| No resource limits | Always set limits |
| Running as root | Non-root containers |
| Hardcoded configs | ConfigMaps and Secrets |
| No health probes | Liveness and readiness |
| Single replica | Multiple replicas with PDB |
| No network policies | Default deny, explicit allow |

## Constraints

- Never run containers as root in production
- Always set resource requests and limits
- Use namespaces for isolation
- Implement network policies
- Enable audit logging

## Related Skills

- `devops-engineer` - CI/CD integration
- `platform-engineer` - Platform building
- `security-engineer` - Security hardening
