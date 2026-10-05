import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveTrackerPage } from './pages/LiveTrackerPage';
import { FleetPage } from './pages/FleetPage';
import { TripsPage } from './pages/TripsPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected SaaS Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="live-tracker" element={<LiveTrackerPage />} />
              <Route path="routes" element={<LiveTrackerPage />} />
              <Route path="fleet" element={<FleetPage />} />
              <Route path="trips" element={<TripsPage />} />
              <Route path="accessibility" element={<AccessibilityPage />} />
              <Route path="logistics" element={<LogisticsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
