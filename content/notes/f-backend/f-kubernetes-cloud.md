---
id: f-kubernetes-cloud
title: "Kubernetes and one cloud, working knowledge"
level: core
phase: 3
week: 38
tags: [backend, kubernetes, cloud, aws, azure]
estMinutes: 30
---

## What it is

**Kubernetes** runs your containers on many machines: it starts them, restarts them when they crash, spreads traffic and scales them up.
Most backend roles want **working knowledge**, not expertise: read a deployment file, know what a pod and a service are, and deploy to one cloud.
In the 2025 Stack Overflow survey about 74% of professional developers used Docker but only about 30% used Kubernetes, so Docker plus one cloud matters more.

## Real-life example

A big restaurant chain. Docker is the standard tiffin box: the same food fits in every kitchen. Kubernetes is the chain manager: "keep 3 cooks on dosa duty; if one goes home sick, call another; on Sunday, add two more".

## Picture

```text
                 Service "orders" (stable name + load balancing)
                 ┌──────────────┼──────────────┐
              Pod 1          Pod 2          Pod 3      ◄── Deployment: "keep 3 replicas"
           [container]    [container]    [container]       of image orders:v7
             node A          node B          node A
```

## How it works inside

- **Pod**: one or more containers that run together. Pods come and go.
- **Deployment**: "keep N pods of this image running". Change the image tag and it rolls out new pods gradually (a rolling update), and can roll back.
- **Service**: a stable name and IP in front of changing pods, with load balancing.
- **Ingress**: routes outside HTTP traffic (`api.example.com/orders`) to services.
- **ConfigMap and Secret**: settings and passwords injected as environment variables or files.
- **Probes**: liveness (restart me if stuck) and readiness (send me traffic only when ready). They use your health endpoints.
- **HPA**: the Horizontal Pod Autoscaler adds pods when CPU or another metric is high.

**One cloud.** Pick AWS by default, or Azure if you target Microsoft-stack companies. Learn the same five things in either: compute (EC2 / App Service, or managed containers like ECS / Container Apps), managed Postgres (RDS / Azure Database for PostgreSQL), object storage (S3 / Blob Storage), a queue (SQS / Service Bus), and identity and permissions (IAM / Entra ID and role assignments). Watch the bill: set a budget alert on day one.

## Python, step by step

What a Deployment's controller does, in a few lines: compare what you want with what runs, and fix the difference.

```python
desired = {"orders": 3, "payments": 2}
running = {"orders": ["o-1", "o-2"], "payments": ["p-1", "p-2", "p-3"]}
counter = {"orders": 2, "payments": 3}

def reconcile():
    actions = []
    for app, want in desired.items():
        pods = running[app]
        while len(pods) < want:                  # too few: start one
            counter[app] += 1
            pods.append(f"{app[0]}-{counter[app]}")
            actions.append(f"start {pods[-1]}")
        while len(pods) > want:                  # too many: stop one
            actions.append(f"stop {pods.pop()}")
    return actions

print(reconcile())
running["orders"].remove("o-1")                  # a pod crashed
print(reconcile())
print(reconcile())                               # nothing to do
```

```output
['start o-3', 'stop p-3']
['start o-4']
[]
```

A minimal Deployment and Service (needs a cluster such as kind or minikube to apply):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: orders }
spec:
  replicas: 3
  selector: { matchLabels: { app: orders } }
  template:
    metadata: { labels: { app: orders } }
    spec:
      containers:
        - name: orders
          image: ghcr.io/you/orders:v7
          ports: [{ containerPort: 8000 }]
          readinessProbe: { httpGet: { path: /health/ready, port: 8000 } }
---
apiVersion: v1
kind: Service
metadata: { name: orders }
spec:
  selector: { app: orders }
  ports: [{ port: 80, targetPort: 8000 }]
```

## Time and space

| Need | Simplest thing that works |
| --- | --- |
| One small API | a managed container service or a single VM |
| Many services, many teams | Kubernetes (usually managed: EKS, AKS, GKE) |
| Scheduled jobs | a cron job or the cloud's scheduler |

## Common mistakes

- Running Kubernetes for one small app. Managed containers are simpler.
- Secrets baked into the image.
- No readiness probe, so traffic hits pods that are still starting.
- No budget alert on a cloud account.

## Patterns that use it

Deploying your flagship project, rolling updates, autoscaling under load, health checks from the resilience note.

## Practice

```practice
Run your API in a local kind or minikube cluster with 3 replicas
Kill one pod and watch the Deployment replace it
Deploy the same API to one cloud with managed Postgres, and set a budget alert
Explain a rolling update and a rollback in 2 minutes
```

## Explain it back

```explain
What is the difference between a pod and a service?
What does a Deployment do when a pod crashes?
Why might you not need Kubernetes at all?
```

## Flashcards

```flashcards
What is a pod? :: One or more containers that run together; pods come and go.
What does a Deployment do? :: Keeps N pods of an image running and rolls out new versions gradually.
What is a Service? :: A stable name and IP that load-balances across changing pods.
Readiness vs liveness probe? :: Readiness: send traffic only when ready. Liveness: restart if stuck.
What five things should you know in one cloud? :: Compute, managed Postgres, object storage, a queue, identity and permissions.
```
