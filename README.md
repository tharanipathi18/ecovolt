# ⚡ EcoVolt — Production-Ready Decentralized Renewable Energy & Smart EV Management Platform

**AI-Powered Decentralized Renewable Energy Coordination & Smart EV Management System**

---

## 🌟 Overview

**EcoVolt** is a production-ready software platform connecting:
1. **Renewable Energy Generators** (Solar, Wind, Hydro)
2. **EV Charging Ports** (Physical connectors, station hubs)
3. **EV Users** (Individual electric vehicle drivers)
4. **Fleet Managers** (Commercial fleet logistics)
5. **Administrators** (System governance & root access)

The platform coordinates renewable energy availability, predicts charging demand using AI machine learning models, recommends optimal clean energy windows, and provides end-to-end commercial fleet and user EV management.

> ⚠️ **Important:** EcoVolt does **NOT** physically transfer electricity. It coordinates renewable energy availability through the existing electrical grid or local microgrids.

---

## 🏗️ System Architecture

```
                                    ┌──────────────────────────────────────────────┐
                                    │             React + Vite Frontend            │
                                    │         (Tailwind CSS, Glassmorphism,        │
                                    │             Recharts, React Router)          │
                                    └──────────────────────┬───────────────────────┘
                                                           │ (REST APIs + JWT)
                                                           ▼
                                    ┌──────────────────────────────────────────────┐
                                    │           Express.js Node Backend            │
                                    │          (JWT, bcrypt, Helmet, CORS,         │
                                    │            Mongoose MongoDB ODM)             │
                                    └──────────────┬────────────────┬──────────────┘
                                                   │                │
                                (Mongoose MongoDB) │                │ (Axios HTTP)
                                                   ▼                ▼
                                    ┌────────────────────┐   ┌─────────────────────┐
                                    │ MongoDB Atlas      │   │ Python FastAPI      │
                                    │ (15 Collections +  │   │ AI Microservice     │
                                    │ 2dsphere Indexes)  │   │ (RandomForest,      │
                                    └────────────────────┘   │  Scikit-Learn)      │
                                                             └─────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 🔑 Authentication & Role Authorization
- Roles: `admin`, `generator`, `ev_port`, `ev_user`, `fleet_manager`.
- Features: Password hashing (bcrypt 12 rounds), JWT access token issuance, protected routes, guest route guards, role dashboard path resolver, auto-login.

### 2. ☀️ Renewable Energy Generator Module (`/energy`)
- Features: Generator facility registration, total capacity tracking, real-time power generation output, excess energy calculation, upload production modal, credit settlement ledger, and Recharts analytics.

### 3. 🔌 EV Charging Port Module (`/charging`)
- Features: Live charging connector slots status grid (`Available`, `Occupied` with battery progress bar, `Maintenance`, `Offline`), Start/Stop session lifecycle, driver queue dispatching, clean energy allocation screen, and revenue/power draw reports.

### 4. ⚡ Smart EV Companion Module (`/dashboard`)
- Features: Smart Vehicle Remote Controller (Live Simulator for Door Locks, Charging Start/Stop, Climate Control, Flashers), Battery Diagnostics (SoH %, Temp, Pack Voltage), Nearby Clean Station search, Advance Slot Booking, Charging History, and Sustainability Metrics (CO2 offset & tree equivalents 🌳).

### 5. 🚛 Commercial Fleet Management Module (`/fleet`)
- Features: Commercial EV fleet roster, driver assignment directory, live status simulator (`In Transit`, `Charging`, `Idle`, `Maintenance`), AI-matched clean charging schedule timetable, fleet maintenance tickets, and carbon savings analytics.

### 6. 🛡️ System Administration & Governance Module (`/admin`)
- Features: Platform user directory with role switching & account suspensions, generator & charging port asset oversight, clean energy transaction ledgers, in-app notification broadcasting, system configuration settings, and API request traffic analytics.

### 7. 🤖 Python FastAPI AI Microservice (`ai-service/`)
- ML Models:
  - **Demand Forecasting:** Predicts station kW demand & optimal active ports count using Scikit-Learn `RandomForestRegressor`.
  - **Battery Health Diagnostics:** Models SoH % decay and remaining useful charge cycle life (RUL).
  - **Predictive Maintenance:** Evaluates asset failure probability (0.0 to 1.0) and recommended maintenance dates.
  - **Clean Energy Recommendation Engine:** Recommends optimal clean charge windows (Solar/Wind off-peak) to maximize tariff savings and CO2 reduction.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router DOM v6, Axios, Recharts |
| **Backend** | Node.js v18+, Express.js, MongoDB Atlas, Mongoose v8, JWT, bcryptjs, Helmet, CORS |
| **AI Service** | Python 3.10+, FastAPI, Uvicorn, Scikit-Learn, XGBoost, NumPy, Pydantic v2 |
| **Database** | MongoDB Atlas with 15 collections, 2dsphere location indexes, compound indexes |

---

## 💻 Installation & Setup Guide

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Python >= 3.10
- MongoDB Atlas cluster or local MongoDB server

### 2. Environment Configuration

```bash
# Client environment variables (.env)
VITE_API_BASE_URL=http://localhost:5000/api

# Server environment variables (.env)
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecovolt?retryWrites=true&w=majority
JWT_SECRET=ecovolt_production_jwt_secret_key_2026_super_secure
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000

# AI Service environment variables (.env)
PORT=8000
CORS_ORIGIN=http://localhost:5000
```

### 3. Run Applications Locally

```bash
# 1. Start Python FastAPI AI Microservice (Terminal 1)
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Start Node.js Express Backend (Terminal 2)
cd server
npm install
npm run dev

# 3. Start React Vite Frontend (Terminal 3)
cd client
npm install
npm run dev
```

- Access Frontend: `http://localhost:5173`
- Access Express API: `http://localhost:5000/api/health`
- Access FastAPI Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 📦 Production Build & Deployment

### 1. Build Client Distribution Bundle

```bash
cd client
npm run build
```
- Production output directory: `client/dist/`

### 2. Docker Container Deployment

#### Docker Compose Config (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - CORS_ORIGIN=http://localhost:5000

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
```

---

## 📄 API Documentation Summary

### Auth APIs (`/api/auth`)
- `POST /api/auth/register` — Register user with role (`admin`, `generator`, `ev_port`, `ev_user`, `fleet_manager`)
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/auth/me` — Get active user profile
- `POST /api/auth/forgot-password` — Generate reset password token

### Energy APIs (`/api/energy`)
- `GET /api/energy/generators` — List generator facilities
- `POST /api/energy/generators` — Register generator facility
- `POST /api/energy/log-production` — Log energy production output (kWh)
- `GET /api/energy/analytics` — Generator revenue & output analytics

### Charging APIs (`/api/charging`)
- `GET /api/charging/ports` — List charging ports
- `POST /api/charging/ports` — Register charging port
- `POST /api/charging/sessions/start` — Start charging session
- `PATCH /api/charging/sessions/:id/stop` — Complete charging session
- `POST /api/charging/allocate-energy` — Allocate clean energy credits

### EV Companion APIs (`/api/ev`)
- `GET /api/ev/vehicles` — List user's EVs
- `POST /api/ev/vehicles` — Register EV
- `GET /api/ev/nearby-stations` — Search nearby charging ports
- `POST /api/ev/bookings` — Reserve charging slot
- `GET /api/ev/sustainability` — CO2 savings & tree equivalents

### Fleet APIs (`/api/fleet`)
- `GET /api/fleet/vehicles` — Commercial fleet roster
- `POST /api/fleet/drivers` — Register commercial driver
- `POST /api/fleet/assign-driver` — Assign driver to vehicle
- `POST /api/fleet/maintenance` — File maintenance ticket

### Admin APIs (`/api/admin`)
- `GET /api/admin/overview` — Platform overview metrics
- `GET /api/admin/users` — User governance list
- `PUT /api/admin/users/:id` — Update user role or active status
- `POST /api/admin/notifications` — Broadcast system alert
- `PUT /api/admin/settings` — Update platform config parameters

### AI Microservice APIs (`/api/v1`)
- `POST /api/v1/predict/demand` — Demand forecasting
- `POST /api/v1/predict/battery-health` — Battery SoH & life prediction
- `POST /api/v1/predict/maintenance` — Predictive maintenance failure probability
- `POST /api/v1/recommend/charging` — Clean energy window recommendation

---

## 📜 License

MIT © EcoVolt Platform Engineering Team
