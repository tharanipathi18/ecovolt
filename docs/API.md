# EcoVolt — API Documentation

## Base URL

```
Development: http://localhost:5000/api
AI Service:  http://localhost:8000
```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Auth
| Method | Endpoint            | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| POST   | /auth/register      | Public  | Register new user        |
| POST   | /auth/login         | Public  | Login & get token        |
| GET    | /auth/me            | Private | Get current user profile |
| POST   | /auth/logout        | Private | Logout                   |

### Energy
| Method | Endpoint                          | Access  | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| GET    | /energy/generators                | Private | List all generators                |
| GET    | /energy/generators/:id            | Private | Get single generator               |
| POST   | /energy/generators                | Private | Create generator (operator/admin)  |
| GET    | /energy/production/summary        | Private | Real-time production summary       |
| GET    | /energy/allocation/recommendations| Private | AI allocation recommendations      |

### Charging
| Method | Endpoint                          | Access  | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| GET    | /charging/stations                | Private | List all stations                  |
| GET    | /charging/stations/:id            | Private | Get station with ports             |
| POST   | /charging/sessions                | Private | Start charging session             |
| PATCH  | /charging/sessions/:id/stop       | Private | Stop charging session              |
| GET    | /charging/sessions/active         | Private | Get active sessions                |
| GET    | /charging/demand/forecast         | Private | AI demand forecast                 |

### Fleet
| Method | Endpoint                          | Access  | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| GET    | /fleet                            | Private | List user's fleets                 |
| GET    | /fleet/:id                        | Private | Get single fleet                   |
| GET    | /fleet/:id/vehicles               | Private | List fleet vehicles                |
| GET    | /fleet/:id/analytics              | Private | Fleet analytics & reports          |
| GET    | /fleet/:id/charging-schedule      | Private | AI charging schedule               |

### Admin
| Method | Endpoint                          | Access  | Description                        |
|--------|-----------------------------------|---------|------------------------------------|
| GET    | /admin/users                      | Admin   | List all users                     |
| GET    | /admin/users/:id                  | Admin   | Get user details                   |
| PUT    | /admin/users/:id                  | Admin   | Update user role/status            |
| GET    | /admin/system/stats               | Admin   | Platform statistics                |

### Health
| Method | Endpoint    | Access | Description          |
|--------|-------------|--------|----------------------|
| GET    | /health     | Public | API health check     |

## Response Format

### Success
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Development only
}
```

### Paginated
```json
{
  "success": true,
  "count": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "data": [ ... ]
}
```
