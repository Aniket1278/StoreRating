import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage    from './pages/LoginPage';
import SignupPage   from './pages/SignupPage';
import AdminPage    from './pages/AdminPage';
import StoresPage   from './pages/StoresPage';
import OwnerPage    from './pages/OwnerPage';
import './styles/global.css';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role === 'admin')       return <Navigate to="/admin"  replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner"  replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"       element={<RootRedirect />} />
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            <Route path="/stores" element={
              <ProtectedRoute roles={['user']}>
                <StoresPage />
              </ProtectedRoute>
            } />

            <Route path="/owner" element={
              <ProtectedRoute roles={['store_owner']}>
                <OwnerPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
