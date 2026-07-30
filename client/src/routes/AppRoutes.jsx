import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

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
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public Website Routes (Wrapped in PublicLayout) ────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ─── Guest Auth Routes ──────────────────────────────────────── */}
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

      {/* ─── Private / Protected Dashboard Routes (MainLayout) ────── */}
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ─── 404 Catch-All ──────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
