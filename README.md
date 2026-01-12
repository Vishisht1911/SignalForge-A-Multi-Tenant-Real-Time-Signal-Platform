# Signal Platform – Backend Assignment

## Overview
This project implements a **multi-tenant, asynchronous trading signal platform** using **FastAPI**, **PostgreSQL**, and **Redis**.

The system ingests OHLCV candles, generates trading signals asynchronously via a Redis queue, caches latest signals in Redis, and exposes APIs for job tracking and signal retrieval with strict tenant isolation.

This implementation satisfies **all mandatory requirements** of the assignment.

---

## High-Level Architecture

Client (Frontend / API Client)
|
v
FastAPI Backend ---> PostgreSQL (Candles, Signals, Jobs, Users)
|
v
Redis
(Queue + Cache)
|
v
Signal Worker


---

## Tech Stack
- **Backend:** FastAPI (Python 3.11)
- **Database:** PostgreSQL 15
- **Cache & Queue:** Redis 7
- **ORM:** SQLAlchemy
- **Auth:** JWT (Bearer tokens)
- **Async Worker:** Python process consuming Redis queue
- **Containerization:** Docker + Docker Compose
- **Frontend:** React (provided)

---

## Database Schema (Detailed)

### tenants
| Column | Type | Notes |
|------|-----|------|
| id | int | PK |
| name | string | unique |

Purpose: top-level tenant isolation boundary.

---

### users
| Column | Type | Notes |
|------|-----|------|
| id | int | PK |
| tenant_id | int | FK → tenants.id |
| email | string | unique |
| password_hash | string | bcrypt |
| created_at | timestamp | |

Indexing:
- `UNIQUE(email)`
- `(tenant_id)`

---

### candles
| Column | Type | Notes |
|------|-----|------|
| id | int | PK |
| tenant_id | int | FK |
| symbol | string | e.g. BTCUSDT |
| timeframe | string | 1m, 5m |
| ts | timestamp | candle open time |
| open | float | |
| high | float | |
| low | float | |
| close | float | |
| volume | float | |
| created_at | timestamp | |

Constraints:

UNIQUE (tenant_id, symbol, timeframe, ts)


Indexes:
- `(tenant_id, symbol, timeframe, ts)` → fast range queries

---

### jobs
| Column | Type | Notes |
|------|-----|------|
| id | uuid | PK |
| tenant_id | int | FK |
| symbol | string | |
| timeframe | string | |
| status | enum | PENDING / RUNNING / SUCCESS / FAILED |
| result | json | signal summary |
| error | text | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

Indexes:
- `(tenant_id, created_at)`

---

### signals
| Column | Type | Notes |
|------|-----|------|
| id | int | PK |
| tenant_id | int | FK |
| symbol | string | |
| timeframe | string | |
| action | string | BUY / SELL / HOLD |
| confidence | float | |
| features | json | EMA, ATR, etc |
| veto_reasons | json | nullable |
| created_at | timestamp | |

Indexes:
- `(tenant_id, created_at DESC)`
- `(tenant_id, symbol, timeframe)`

---

## Multi-Tenancy Approach
- Every table includes `tenant_id`
- Tenant ID derived from JWT token
- All queries explicitly filter by `tenant_id`
- No cross-tenant data visibility
- Redis keys are tenant-scoped

---

## Redis Usage

### 1️⃣ Queue (Async Signal Engine)


Payload:
```json
{
  "job_id": "uuid",
  "tenant_id": 1,
  "symbol": "BTCUSDT",
  "timeframe": "1m"
}
signal:{tenant_id}:{symbol}:{timeframe}


##Seeded Demo user:
Email: demo@mintzy.io
Password: password123
##
