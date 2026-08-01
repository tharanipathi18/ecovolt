import { Routes, Route, Navigate } from 'react-router-dom';

// Auth guards
import { ProtectedRoute, GuestRoute } from '@components/auth';

// Layouts
import MainLayout from '@components/layout/MainLayout';
import PublicLayout from '@pages/public/PublicLayout';

// Public pages
import Home from '@pages/public/Home';
import About from '@pages/public/About';
import Features from '@pages/public/Features';
import Contact from '@pages/public/Contact';

// Auth pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';

// Role Dashboard pages
import Dashboard from '@pages/dashboard/Dashboard';
import EnergyOverview from '@pages/energy/EnergyOverview';
import ChargingStations from '@pages/charging/ChargingStations';
import FleetManagement from '@pages/fleet/FleetManagement';
import AdminPanel from '@pages/admin/AdminPanel';

import NotFound from '@pages/NotFound';

/**
 * Complete Application Route Configuration.
 *
 * Route guard logic:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  GuestRoute     — allows only unauthenticated users                    │
 * │                   authenticated users → redirected to their dashboard  │
 * │                                                                         │
 * │  ProtectedRoute — allows only authenticated users                      │
 * │                   unauthenticated → redirected to /login               │
 * │                   with `state.from` so Login can send them back        │
 * │                                                                         │
 * │  ProtectedRoute roles={[...]} — additionally checks user.role          │
 * │                   wrong role → shows Access Denied screen              │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Route nesting:
 *  Public routes        → PublicLayout (navbar + footer, no auth required)
 *  Auth routes          → GuestRoute (standalone pages, no layout)
 *  Dashboard routes     → ProtectedRoute → MainLayout → inner ProtectedRoute
 *                         (double guard: outer checks auth, inner checks role)
 */
export default function AppRoutes() {
  return (
    <Routes>

      {/* ─── Public Website Routes (Wrapped in PublicLayout) ──────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ─── Guest-Only Auth Routes ───────────────────────────────────────── */}
      {/*
        GuestRoute behaviour:
        • loading  → full-screen spinner (prevents flash)
        • isAuthenticated → <Navigate to={getDashboardPath()} replace />
        • guest    → renders the child page
      */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      {/* ─── Protected Dashboard Routes ───────────────────────────────────── */}
      {/*
        Outer ProtectedRoute (no roles):
          • loading        → full-screen spinner
          • !isAuthenticated → <Navigate to="/login" state={{ from: location }} replace />
          • authenticated  → renders MainLayout (sidebar + topbar shell)
            └── Outlet renders the matched child route

        Inner ProtectedRoute (with roles):
          • wrong role → Access Denied screen with Link back to /dashboard
          • correct role → renders the page component
      */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* /dashboard — EV Users & Admins */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ev_user', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* /energy — Energy Generators & Admins */}
        <Route
          path="/energy"
          element={
            <ProtectedRoute roles={['generator', 'admin']}>
              <EnergyOverview />
            </ProtectedRoute>
          }
        />

        {/* /charging — Port Operators & Admins */}
        <Route
          path="/charging"
          element={
            <ProtectedRoute roles={['ev_port', 'admin']}>
              <ChargingStations />
            </ProtectedRoute>
          }
        />

        {/* /fleet — Fleet Managers & Admins */}
        <Route
          path="/fleet"
          element={
            <ProtectedRoute roles={['fleet_manager', 'admin']}>
              <FleetManagement />
            </ProtectedRoute>
          }
        />

        {/* /admin — Admins only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ─── 404 Catch-All ────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
