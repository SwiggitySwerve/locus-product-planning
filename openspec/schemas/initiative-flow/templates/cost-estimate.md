---
status: draft
created: ${DATE}
version: "1.0"
---

# Infrastructure Cost Estimate: ${TITLE}

## Summary

| Category | Monthly | Annual |
|----------|---------|--------|
| Compute | $ | $ |
| Database | $ | $ |
| Storage & CDN | $ | $ |
| Monitoring | $ | $ |
| Third-Party | $ | $ |
| **Total** | **$** | **$** |

## Detailed Breakdown

### Compute
| Service | Instance Type | Quantity | $/Unit | Monthly |
|---------|---------------|----------|--------|---------|
| API Servers | | | | $ |
| Workers | | | | $ |
| **Subtotal** | | | | **$** |

### Database
| Service | Instance Type | Storage | Monthly |
|---------|---------------|---------|---------|
| Primary DB | | GB | $ |
| Read Replica | | GB | $ |
| Cache | | | $ |
| **Subtotal** | | | **$** |

### Storage & CDN
| Service | Volume | Monthly |
|---------|--------|---------|
| Object Storage | GB | $ |
| CDN | GB transfer | $ |
| Backups | GB | $ |
| **Subtotal** | | **$** |

### Monitoring & Logging
| Service | Tier/Volume | Monthly |
|---------|-------------|---------|
| APM | | $ |
| Logs | | $ |
| Alerts | | $ |
| **Subtotal** | | **$** |

### Third-Party Services
| Service | Plan | Monthly |
|---------|------|---------|
| | | $ |
| **Subtotal** | | **$** |

## Scaling Projections

| Scale | Users | Traffic | Monthly Cost | Notes |
|-------|-------|---------|--------------|-------|
| Launch | | req/s | $ | Baseline |
| 6 months | | req/s | $ | |
| 12 months | | req/s | $ | |
| 24 months | | req/s | $ | May need arch review |

## Cost Optimization Applied

- [ ] Right-sized instances
- [ ] Reserved instances for baseline (savings: $X/month)
- [ ] Spot instances for batch jobs (savings: $X/month)
- [ ] Storage lifecycle policies
- [ ] CDN for static assets
- [ ] Serverless for variable workloads

## Assumptions

1. [Assumption about traffic]
2. [Assumption about data growth]
3. [Assumption about pricing tier]

## Review Schedule

- Monthly: Review actual vs estimated
- Quarterly: Update projections
- Annually: Renegotiate contracts
