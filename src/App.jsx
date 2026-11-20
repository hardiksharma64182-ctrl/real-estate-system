import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseSettingsModal } from './components/common/SupabaseSettingsModal';
import { MyBookingsModal } from './components/bookings/MyBookingsModal';
import { BookingModal } from './components/bookings/BookingModal';

import { HomePage } from './components/home/HomePage';
import { PropertiesPage } from './components/properties/PropertiesPage';
import { OwnersPage } from './components/owners/OwnersPage';
import { AgentsPage } from './components/agents/AgentsPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { BookingsPage } from './components/bookings/BookingsPage';

import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { CustomerLoginPage } from './components/auth/CustomerLoginPage';
import { OwnerLoginPage } from './components/auth/OwnerLoginPage';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { OwnerDashboard } from './components/owner/OwnerDashboard';

const AppRoutes = () => {
  const location = useLocation();

  const isAuthPage = [
    '/admin/login',
    '/owner/login',
    '/buyer/login'
  ].includes(location.pathname);

  const isFullscreenDashboard =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/owner/dashboard') ||
    location.pathname.startsWith('/buyer/dashboard');

  const showNavbar = !isAuthPage && !isFullscreenDashboard;
  const showFooter = !isAuthPage && !isFullscreenDashboard;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      {showNavbar && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/owners" element={<OwnersPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />

          {/* Login Portals */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route path="/buyer/login" element={<CustomerLoginPage />} />

          {/* Admin Portal */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Owner Portal */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Buyer Portal - database role remains customer */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BookingModal />
      <AuthModal />
      <SupabaseSettingsModal />
      <MyBookingsModal />
      <ToastContainer />

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
