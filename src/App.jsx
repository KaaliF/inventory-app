import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sell from './pages/Sell';
import Orders from './pages/Orders';
import Ledger from './pages/Ledger';
import Banks from './pages/Banks';
import Labor from './pages/Labor';

function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useApp();
  return user ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/banks" element={<Banks />} />
            <Route path="/labor" element={<Labor />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
