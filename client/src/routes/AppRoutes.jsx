import { Routes, Route } from 'react-router-dom';

// Auth guards
import { ProtectedRoute, GuestRoute } from '@components/auth';

// Layouts
import MainLayout from '@components/layout/MainLayout';
import PublicLayout from '@pages/public/PublicLayout';
import AdminLayout from '@components/layout/AdminLayout';

// Public pages
import Home from '@pages/public/Home';
import About from '@pages/public/About';
import Features from '@pages/public/Features';
import Contact from '@pages/public/Contact';

// Auth pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import AdminLogin from '@pages/admin/AdminLogin';

// Role Dashboard pages
import Dashboard from '@pages/dashboard/Dashboard';
import EnergyOverview from '@pages/energy/EnergyOverview';
import ChargingStations from '@pages/charging/ChargingStations';
import FleetManagement from '@pages/fleet/FleetManagement';
import AdminPanel from '@pages/admin/AdminPanel';

import NotFound from '@pages/NotFound';

/**
 * Complete Application Route Configuration with Standalone Hidden Admin Portal.
 *
 * Route Structure:
 *  1. Public Website Routes      → PublicLayout (Home, About, Features, Contact)
 *  2. Guest Auth Routes          → Login, Register, ForgotPassword
 *  3. Protected User Dashboards  → MainLayout (Dashboard, Energy, Charging, Fleet)
 *  4. Dedicated Hidden Admin Portal → AdminLayout (/admin/login & /admin/* protected for role: admin)
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

      {/* ─── Guest Auth Routes ────────────────────────────────────────────── */}
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

      {/* ─── Dedicated Admin Portal Login ──────────────────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ─── Standalone Hidden Admin Portal (/admin/*) ────────────────────── */}
      {/* Protected: Only users with role = 'admin' can access. Non-admins see 403 Forbidden */}
      <Route
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route path="/admin/users" element={<AdminPanel />} />
        <Route path="/admin/station-requests" element={<AdminPanel />} />
        <Route path="/admin/approved-stations" element={<AdminPanel />} />
        <Route path="/admin/vehicles" element={<AdminPanel />} />
        <Route path="/admin/bookings" element={<AdminPanel />} />
        <Route path="/admin/sessions" element={<AdminPanel />} />
        <Route path="/admin/reports" element={<AdminPanel />} />
        <Route path="/admin/notifications" element={<AdminPanel />} />
        <Route path="/admin/settings" element={<AdminPanel />} />
      </Route>

      {/* ─── Standard User Dashboard Routes ───────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['ev_user', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/energy"
          element={
            <ProtectedRoute roles={['generator', 'admin']}>
              <EnergyOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/charging"
          element={
            <ProtectedRoute roles={['ev_port', 'admin']}>
              <ChargingStations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fleet"
          element={
            <ProtectedRoute roles={['fleet_manager', 'admin']}>
              <FleetManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ─── 404 Catch-All ────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
