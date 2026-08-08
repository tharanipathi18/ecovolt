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

import Profile from '@pages/profile/Profile';
import Settings from '@pages/profile/Settings';

import NotFound from '@pages/NotFound';

/**
 * Complete Application Route Configuration with Standalone Hidden Admin Portal.
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
        <Route path="/admin/energy-trading" element={<AdminPanel />} />
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
            <ProtectedRoute roles={['ev_port', 'ev_user', 'fleet_manager', 'admin']}>
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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ─── 404 Catch-All ────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
