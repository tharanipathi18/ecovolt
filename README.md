# ⚡ EcoVolt

> **AI-Powered Renewable Energy Coordination & Smart EV Management Platform**

EcoVolt is a full-stack MVP software platform that connects EV Users, Charging Port Owners, Renewable Energy Generators, Fleet Managers, and Platform Administrators to streamline EV charging workflows, renewable energy trading, and electric vehicle fleet operations.

---

## 🌱 Overview

EcoVolt provides an integrated software ecosystem for modern electric mobility and clean energy distribution. It connects five core stakeholder roles:

- **EV Users:** Search nearby charging ports, reserve charging slots, track battery telemetry, and monitor carbon reduction.
- **Charging Port Owners:** Manage charging station connectors, handle slot reservations, start/stop charging sessions, and procure clean power via the energy marketplace.
- **Renewable Energy Generators:** Register solar, wind, and hydro power facilities, log clean energy production, list renewable energy offers, and approve P2P energy purchase requests.
- **Fleet Managers:** Oversee commercial EV fleets, assign drivers to vehicles, track complaints, schedule maintenance, and manage fleet charging priority schedules.
- **Administrators:** Oversee platform governance, review charging station owner applications, manage user permissions, and monitor system-wide energy trading telemetry.

> [!NOTE]
> **Energy Transmission Clarification:** EcoVolt does **NOT** physically transmit electricity through custom hardware or power lines. It coordinates energy availability, P2P transactions, charging infrastructure, and user bookings through software ledger management over existing electrical grid networks.

---

## 🎯 Problem

The transition to electric mobility faces several operational challenges across fragmented stakeholders:

- **Uncoordinated Renewable Generation:** Renewable energy generators often generate surplus power during off-peak hours that goes unutilized due to lack of direct commercial coordination with charging hubs.
- **Charging Infrastructure Bottlenecks:** EV users experience unpredictable charger availability, queue delays, and lack of real-time port status visibility.
- **Fleet Electrification Complexity:** Commercial fleet operators struggle to coordinate driver assignments, vehicle battery health, maintenance schedules, and charging priorities simultaneously.
- **Fragmented Workflows:** Station operators, power generators, fleet managers, and individual drivers use disconnected software tools, creating inefficiencies in clean energy utilization.

---

## 💡 Solution

EcoVolt unifies these workflows into a single centralized digital ecosystem:

```
+-------------------+      +-------------------+      +-------------------+
|     EV User       | ---> |   Charging Port   | ---> |  Charging Session |
+-------------------+      +-------------------+      +-------------------+

+-------------------+      +-------------------+      +-------------------+
| Energy Generator  | ---> | Energy Marketplace| ---> | Charging Port Owner|
+-------------------+      +-------------------+      +-------------------+

+-------------------+      +-------------------+      +-------------------+
|   Fleet Manager   | ---> |   Fleet Vehicles  | ---> | Driver Assignment |
+-------------------+      +-------------------+      +-------------------+

+-------------------+      +-------------------+
|     Admin         | ---> |Platform Governance|
+-------------------+      +-------------------+
```

---

## 👥 User Roles

| Role | System Symbol | Primary Responsibilities |
| :--- | :--- | :--- |
| **EV User** | `ev_user` | Manages personal EVs, searches nearby charging stations, reserves slots, tracks charging history and sustainability metrics. |
| **Charging Port Owner** | `ev_port` | Manages charging connectors, accepts/rejects slot bookings, controls active charging sessions, purchases clean energy from generators. |
| **Energy Generator** | `generator` | Registers clean power facilities (solar, wind, hydro), logs output, publishes energy sale offers, approves buyer purchase requests. |
| **Fleet Manager** | `fleet_manager` | Registers fleet vehicles, manages driver profiles, assigns vehicles to drivers, handles complaints, schedules maintenance, manages fleet charging. |
| **Administrator** | `admin` | Governs platform access, reviews pending station owner applications, updates user roles, monitors energy marketplace telemetry, dispatches notices. |

---

## 🚀 Core Features

### 🚗 EV User Module
- **Vehicle Management:** Register and manage personal electric vehicles with battery capacity and connector type specifications.
- **Nearby Charger Discovery:** View real-time availability and tariff pricing for nearby charging ports.
- **Slot Reservation:** Reserve charging slots with automated reference tracking.
- **Charging Session History:** Review past charging sessions, energy consumed (kWh), total cost, and renewable matching percentage.
- **Sustainability Dashboard:** Monitor personal CO₂ emission reductions and clean energy usage ratios.

### 🔌 Charging Port Owner Module
- **Station & Port Registration:** Apply for station owner verification and manage charging port parameters (connector type, max output kW, tariff rate).
- **Reservation Request Approval:** Review, accept, or reject driver slot booking requests.
- **Charging Telemetry Control:** Manually initiate or release active EV charging sessions.
- **Energy Marketplace Procurement:** Browse clean energy offers from registered generators and submit purchase requests.
- **Order History:** Track purchased renewable energy orders and delivery statuses.

### 🌱 Renewable Energy Generator Module
- **Facility Management:** Register solar, wind, or hydro generation facilities with capacity ratings.
- **Production Logging:** Upload daily clean energy production logs (kWh produced, peak power kW).
- **Offer Publishing:** List clean energy lots on the marketplace with custom unit rates ($/kWh) and minimum purchase thresholds.
- **Order Processing:** Review incoming purchase requests from port owners and execute atomic energy sales transactions.
- **Revenue & Sales Analytics:** Monitor total clean energy generated, active marketplace offers, and cumulative sales revenue.

### 🚚 Fleet Manager Module
- **Fleet Vehicle Registration:** Manage commercial fleet units, battery capacities, and charging priorities.
- **Driver Management:** Register drivers, manage license details, track eco-scores and ratings.
- **Driver Assignment:** Link drivers to specific fleet vehicles.
- **Complaints Ledger:** Receive and address vehicle issues reported by drivers.
- **Maintenance Scheduling:** Schedule repair appointments with workshops and track estimated maintenance costs.
- **Fleet Charging Schedules:** Dispatch charging requests for fleet vehicles based on operational priorities.

### 🛡️ Admin Governance Portal
- **Application Review:** Inspect and approve/reject charging station owner applications.
- **User Permission Management:** Modify user roles and suspend/activate accounts.
- **Energy Marketplace Telemetry:** Audit platform-wide marketplace offers, purchase requests, clean energy volume traded, and financial volume.
- **Broadcast System Notices:** Dispatch system-wide alert notifications to all registered users.

---

## ⚡ Renewable Energy Marketplace

EcoVolt includes a peer-to-peer energy marketplace enabling Charging Port Owners to source clean power directly from Renewable Energy Generators:

```
[ Energy Generator ]
        │
        ▼ (Publishes EnergyOffer: kWh available, $/kWh price)
[ Energy Marketplace ]
        ▲
        │ (Browses offers & submits EnergyPurchaseRequest)
[ Charging Port Owner ]
        │
        ▼ (Generator Accepts Request)
[ Atomic Prisma $transaction ]
        ├── Deducts available kWh from EnergyOffer
        ├── Increments Generator totalRevenue
        ├── Creates EnergyTransaction record (status: 'settled')
        └── Dispatches notifications to both parties
```

The marketplace tracks:
- Available vs. total listed energy (kWh)
- Tariff unit rates ($/kWh)
- Transaction total amount ($)
- Destination charging port & source generator facility
- Request lifecycle status (`pending`, `accepted`, `rejected`, `completed`)

---

## 🚚 Fleet Management Workflow

EcoVolt provides complete commercial fleet operational lifecycle management:

```
[ Fleet Manager ] ──> Registers Fleet Vehicle ──> Assigns Driver
                                                       │
                                                       ▼
[ Fleet Charging Request ] <── Driver Reports Issue <── Driver Operates Vehicle
           │                          │
           ▼                          ▼
[ Scheduled Charging ]      [ Complaint Created ] ──> [ Maintenance Scheduled ]
                                                                │
                                                                ▼
                                                        [ Repair Completed ]
```

---

## 🔒 Authentication & Security Architecture

- **Independent Tab Sessions:** Authentication state is stored in `sessionStorage` (`ecovolt_token` and `ecovolt_user`), enabling users to test different roles simultaneously in separate browser tabs without cross-tab session leakage.
- **JWT Authorization:** Requests are authenticated via `Authorization: Bearer <JWT>` headers validated by Express backend middleware.
- **Password Security:** Passwords are hashed using `bcryptjs` with 12 salt rounds before database storage.
- **Backend Authorization:** Role guards (`authorize(...)`) and database ownership validation enforce zero trust on all API routes.
- **Security Middleware:** Express app protected with `helmet`, configurable CORS whitelist, and request rate limiting (`express-rate-limit`).

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            React + Vite Frontend             │
                    │      (Tailwind CSS, Recharts, Context API)   │
                    └──────────────────────┬───────────────────────┘
                                           │ (REST API + Bearer JWT)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │           Express.js Node Backend            │
                    │         (JWT, bcrypt, Helmet, CORS,          │
                    │                 Prisma ORM)                  │
                    └──────────────┬────────────────┬──────────────┘
                                   │                │
             (Prisma Client / SQL) │                │ (Axios HTTP Proxy)
                                   ▼                ▼
                    ┌────────────────────┐   ┌─────────────────────┐
                    │ Supabase           │   │ Python FastAPI      │
                    │ PostgreSQL Database│   │ AI Microservice     │
                    │ (Relational DB)    │   │ (Scikit-Learn,      │
                    └────────────────────┘   │  XGBoost)           │
                                             └─────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `^18.3.1` | User Interface Components |
| | Vite | `^6.0.6` | Frontend Build Tool & Dev Server |
| | Tailwind CSS | `^3.4.17` | Utility-first Design System |
| | Recharts | `^2.15.0` | Telemetry & Analytics Charts |
| | React Hook Form | `^7.54.2` | Client-side Form Validation |
| | React Router | `^6.28.2` | Single Page Application Routing |
| **Backend** | Node.js | `>=18.0.0` | JavaScript Runtime |
| | Express | `^4.21.2` | HTTP REST API Framework |
| | Prisma ORM | `^6.19.3` | Database Client & Schema Management |
| | Supabase PostgreSQL | Latest | Relational Database Storage |
| | JSON Web Token | `^9.0.2` | Stateless Authentication |
| | bcryptjs | `^2.4.3` | Password Hashing (12 rounds) |
| | Helmet & CORS | `^8.0.0` | Web Security & Cross-Origin Middleware |
| | Rate Limit | `^7.5.0` | API DDoS & Brute-force Protection |
| **AI Service** | Python | `>=3.10` | AI Microservice Runtime |
| | FastAPI | `>=0.115.0` | Asynchronous Python API Framework |
| | Scikit-Learn | `>=1.6.0` | Demand & Health ML Models |
| | XGBoost | `>=2.1.0` | Gradient Boosting Predictive Analytics |
| | Pandas & NumPy | Latest | Data Manipulation & Vector Math |

---

## 📂 Project Structure

```
EcoVolt/
├── client/                   # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Modal, Table, Card, Button, Input)
│   │   ├── contexts/         # AuthContext (sessionStorage authentication provider)
│   │   ├── pages/            # Role-specific dashboard pages (admin, charging, dashboard, energy, fleet)
│   │   ├── routes/           # AppRoutes & ProtectedRoute role guards
│   │   ├── services/         # API services (auth, charging, energy, fleet, admin, ai)
│   │   └── styles/           # Tailwind CSS styles and custom utility classes
│   └── package.json
│
├── server/                   # Node.js + Express Backend API
│   ├── prisma/
│   │   └── schema.prisma     # Prisma Schema for Supabase PostgreSQL
│   ├── src/
│   │   ├── config/           # Environment and DB singleton configuration
│   │   ├── controllers/      # Route controllers (auth, charging, energy, fleet, admin, ai)
│   │   ├── middleware/       # Auth, role authorization, and error handling middleware
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Business logic layer & Prisma transactions
│   │   └── validators/       # Request payload validation rules
│   └── package.json
│
├── ai-service/               # Python FastAPI Microservice
│   ├── app/
│   │   ├── api/              # AI endpoints (predict demand, battery health, maintenance, charging recs)
│   │   ├── main.py           # FastAPI application entry point
│   │   └── services/         # Scikit-learn ML model implementations
│   └── requirements.txt
│
└── README.md
```

---

## 🗄️ Database Architecture (Prisma & Supabase PostgreSQL)

The database schema (`server/prisma/schema.prisma`) contains 19 relational models:

- **`User`:** User identity, role, credentials, contact address.
- **`Vehicle`:** Driver EV vehicle specifications and battery capacities.
- **`EnergyGenerator`:** Solar, wind, or hydro clean power generation facilities.
- **`ChargingPort`:** Public charging station connectors and tariff rates.
- **`ChargingQueue`:** Waiting queue position tracking for busy ports.
- **`ChargingSession`:** Active and completed EV charging sessions.
- **`Booking`:** Scheduled charging slot reservations.
- **`EnergyTransaction`:** Settled P2P energy marketplace transactions.
- **`FleetVehicle`:** Commercial fleet units with priority charging settings.
- **`Driver`:** Employed driver profiles, ratings, and eco-scores.
- **`Complaint`:** Vehicle issues raised by drivers for fleet manager review.
- **`MaintenanceSchedule`:** Scheduled workshop appointments for fleet units.
- **`MaintenanceReport`:** Hardware issue reports logged for assets.
- **`BatteryReport`:** Diagnostic State of Health (SoH) battery logs.
- **`EnergyProductionLog`:** Logged output batches from generators.
- **`Payment`:** Payment records linked to charging sessions.
- **`Notification`:** System notifications delivered to users.
- **`EnergyOffer`:** Published clean energy marketplace sale offers.
- **`EnergyPurchaseRequest`:** Buyer purchase requests for renewable energy.

---

## 🌐 API Documentation

### Health Check
- `GET /api/health` — Returns server health status, environment, and timestamp.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user account.
- `POST /api/auth/login` — Authenticate credentials & receive JWT.
- `GET /api/auth/me` — Fetch current user profile.
- `POST /api/auth/forgot-password` — Initiate password reset.
- `POST /api/auth/reset-password/:token` — Reset password using token.
- `PUT /api/auth/change-password` — Change password for authenticated user.

### EV User (`/api/ev`)
- `GET /api/ev/dashboard` — Fetch EV User overview statistics.
- `GET /api/ev/vehicles` — List user's registered EVs.
- `POST /api/ev/vehicles` — Register a new EV.
- `GET /api/ev/bookings` — Get active slot bookings.
- `GET /api/ev/history` — Get charging session history.
- `GET /api/ev/sustainability` — Get carbon offset metrics.

### Charging Ports & Sessions (`/api/charging`)
- `GET /api/charging/ports` — List charging ports.
- `GET /api/charging/ports/nearby` — Search nearby charging ports.
- `POST /api/charging/ports` — Register a new charging connector.
- `POST /api/charging/sessions/start` — Initiate an EV charging session.
- `POST /api/charging/sessions/:sessionId/stop` — Stop a charging session.
- `GET /api/charging/sessions` — List charging sessions.
- `POST /api/charging/bookings` — Reserve a charging slot.
- `GET /api/charging/bookings` — List port bookings.
- `PATCH /api/charging/bookings/:bookingId/status` — Accept/reject booking request.
- `POST /api/charging/apply` — Apply to become a Station Owner.
- `GET /api/charging/analytics` — Get station operator analytics.

### Energy Marketplace (`/api/energy`)
- `GET /api/energy/generators` — List renewable energy generators.
- `POST /api/energy/generators` — Register a new clean power facility.
- `POST /api/energy/production/upload` — Upload production output log.
- `GET /api/energy/offers` — List active marketplace offers.
- `POST /api/energy/offers` — Publish a clean energy offer.
- `GET /api/energy/offers/my` — Get generator's published offers.
- `POST /api/energy/requests` — Submit an energy purchase request.
- `GET /api/energy/requests/received` — Get received buyer requests (Generator).
- `GET /api/energy/requests/my` — Get submitted energy purchases (Port Owner).
- `PUT /api/energy/requests/:requestId/status` — Accept/reject energy purchase request.
- `GET /api/energy/transactions` — Get energy settlement transaction history.
- `GET /api/energy/admin/trading` — Get platform-wide energy trading telemetry (Admin).

### Fleet Management (`/api/fleet`)
- `GET /api/fleet/overview` — Get fleet manager KPI summary.
- `GET /api/fleet/vehicles` — List fleet vehicles.
- `POST /api/fleet/vehicles` — Register a new fleet vehicle.
- `PUT /api/fleet/vehicles/:id` — Update fleet vehicle details.
- `DELETE /api/fleet/vehicles/:id` — Remove a fleet vehicle.
- `GET /api/fleet/drivers` — List employed drivers.
- `POST /api/fleet/drivers` — Add a new driver.
- `POST /api/fleet/assignments` — Assign a driver to a fleet vehicle.
- `GET /api/fleet/complaints` — List driver complaints.
- `POST /api/fleet/complaints` — Submit a vehicle complaint.
- `GET /api/fleet/maintenance` — List maintenance schedules.
- `POST /api/fleet/maintenance` — Schedule vehicle workshop maintenance.
- `POST /api/fleet/charging/request` — Create a fleet vehicle charging request.

### AI Microservice (`/api/ai`)
- `POST /api/ai/predict-demand` — Predict station charging demand & optimal ports count.
- `POST /api/ai/predict-battery` — Predict EV battery State of Health (SoH) & RUL.
- `POST /api/ai/predict-maintenance` — Predict asset failure probability & maintenance date.
- `POST /api/ai/recommend-charging` — Recommend optimal clean charging time window.

---

## 🤖 AI Microservice Capabilities

EcoVolt includes a Python FastAPI microservice (`ai-service`) with Scikit-learn models:

1. **Station Demand Forecasting (`/api/v1/predict/demand`):** Evaluates hour of day, day of week, ambient temperature, and historical kWh to forecast power demand (kW) and recommend active ports.
2. **EV Battery Health & Lifetime Prediction (`/api/v1/predict/battery-health`):** Evaluates charge cycle count, average pack temperature, fast charge ratio, and pack voltage to predict State of Health (SoH %) and remaining useful charge life cycles.
3. **Predictive Asset Maintenance (`/api/v1/predict/maintenance`):** Analyzes operating hours, temperature anomalies, and efficiency decay rate to calculate failure probability and schedule maintenance before hardware failure.
4. **Optimal Clean Charging Recommendation (`/api/v1/recommend/charging`):** Recommends optimal charging time windows matching peak renewable generation, calculating estimated cost savings (%) and CO₂ reduction (kg).

---

## 💻 Local Setup Instructions

### Prerequisites
- **Node.js:** `>=18.0.0`
- **npm:** `>=9.0.0`
- **Python:** `>=3.10` (for AI microservice)
- **Database:** Supabase PostgreSQL instance

### 1. Clone Repository
```bash
git clone https://github.com/tharanipathi18/ecovolt.git
cd ecovolt
```

### 2. Configure Environment Variables
Create `.env` files in `server/` and `ai-service/` based on `.env.example`:

**`server/.env`:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your_supabase_postgresql_database_url"
JWT_SECRET="your_secure_jwt_secret"
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

**`ai-service/.env`:**
```env
PROJECT_NAME="EcoVolt AI Service"
VERSION="1.0.0"
PORT=8000
```

### 3. Install & Start Backend (Server)
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 4. Install & Start Frontend (Client)
```bash
cd ../client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 5. Install & Start AI Microservice (Python)
```bash
cd ../ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*AI Microservice runs on `http://localhost:8000` (Docs: `http://localhost:8000/docs`)*

---

## 📸 UI Screenshots

Placeholders for platform UI views:

- **EV User Dashboard:** Discover nearby ports, reserve slots, view battery analytics.
- **Charging Port Owner Hub:** Manage connectors, accept reservations, purchase clean power.
- **Energy Generator Portal:** Log production output, publish energy offers, approve requests.
- **Fleet Management Dashboard:** Oversee vehicles, assign drivers, schedule maintenance.
- **Admin Governance Portal:** Review station applications, manage permissions, audit trading.

---

## 📌 MVP Status

EcoVolt is currently a **Full-stack MVP (v1.0.0)**. 

All primary application workflows—user authentication, tab-independent sessions, charging port reservations, P2P renewable energy marketplace transactions, fleet management, admin governance, and AI predictive REST microservices—are implemented and backed by a Supabase PostgreSQL database using Prisma ORM.

---

## 🔮 Future Scope

- **OCPP Charger Protocol Integration:** Native Open Charge Point Protocol (OCPP 2.0.1) hardware integration.
- **Automated Payment Gateway:** Stripe / PayPal escrow integration for energy transactions.
- **Advanced Microgrid Telemetry:** Real-time IoT sensor telemetry streaming via WebSockets.
- **Dynamic Tariff Bidding:** Algorithmic automated spot price energy auctions.
