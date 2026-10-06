import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { EntrancePage } from './pages/EntrancePage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveTrackerPage } from './pages/LiveTrackerPage';
import { PlanTripPage } from './pages/PlanTripPage';
import { MyVehiclesPage } from './pages/MyVehiclesPage';
import { TripReportsPage } from './pages/TripReportsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Dynamic Animated Entrance Screen (No login page barrier) */}
              <Route path="/" element={<EntrancePage />} />

              {/* Login route redirects directly to dashboard */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />

              {/* Main Application Layout Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="live-tracker" element={<LiveTrackerPage />} />
                <Route path="plan-trip" element={<PlanTripPage />} />
                <Route path="vehicles" element={<MyVehiclesPage />} />
                <Route path="trip-reports" element={<TripReportsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* Helpful redirects for old module URLs */}
                <Route path="routes" element={<LiveTrackerPage />} />
                <Route path="smart-route" element={<Navigate to="/plan-trip" replace />} />
                <Route path="logistics" element={<Navigate to="/vehicles" replace />} />
                <Route path="fleet" element={<Navigate to="/vehicles" replace />} />
                <Route path="trips" element={<Navigate to="/trip-reports" replace />} />
              </Route>

              {/* Fallback to entrance */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
