import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseSettingsModal } from './components/common/SupabaseSettingsModal';
import { MyBookingsModal } from './components/bookings/MyBookingsModal';
import { BookingModal } from './components/bookings/BookingModal';

// Public Pages
import { HomePage } from './components/home/HomePage';
import { PropertiesPage } from './components/properties/PropertiesPage';
import { OwnersPage } from './components/owners/OwnersPage';
import { AgentsPage } from './components/agents/AgentsPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { BookingsPage } from './components/bookings/BookingsPage';

// Three Separate Premium Login Pages
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { AgentLoginPage } from './components/auth/AgentLoginPage';
import { CustomerLoginPage } from './components/auth/CustomerLoginPage';

// Role-Protected Dashboards & Route Guard
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';

const AppRoutes = () => {
  const location = useLocation();

  // Hide global navbar/footer on dedicated login pages and fullscreen admin console
  const isAuthPage =
    location.pathname === '/admin/login' ||
    location.pathname === '/agent/login' ||
    location.pathname === '/customer/login';

  const isAdminDashboard = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAgentDashboard = location.pathname.startsWith('/agent/dashboard');
  const isCustomerDashboard = location.pathname.startsWith('/customer/dashboard');

  const showNavbar = !isAuthPage;
  const showFooter = !isAuthPage && !isAdminDashboard && !isAgentDashboard && !isCustomerDashboard;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      {/* Navigation Bar */}
      {showNavbar && <Navbar />}

      {/* Main Content View with Routes */}
      <main className="flex-1">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/owners" element={<OwnersPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />

          {/* 1. Admin Login – /admin/login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* 2. Agent Login – /agent/login */}
          <Route path="/agent/login" element={<AgentLoginPage />} />

          {/* 3. Customer Login – /customer/login */}
          <Route path="/customer/login" element={<CustomerLoginPage />} />

          {/* Protected Role-Based Dashboards */}
          {/* Admin Dashboard: Full Management Permissions */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Agent Dashboard: Only assigned properties and bookings */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Dashboard: Only own profile, favourites, and bookings */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Modals & Notifications */}
      <BookingModal />
      <AuthModal />
      <SupabaseSettingsModal />
      <MyBookingsModal />
      <ToastContainer />

      {/* Footer on Public Showcase */}
      {showFooter && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
