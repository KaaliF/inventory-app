import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banks, setBanks] = useState([]);
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const { data } = await API.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return true;
  };

  const register = async (username, password) => {
    const { data } = await API.post('/auth/register', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setInventory([]);
    setOrders([]);
    setBanks([]);
    setLabor([]);
  };

  const fetchInventory = useCallback(async () => {
    try {
      const { data } = await API.get('/inventory');
      setInventory(data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, []);

  const addItem = async (item) => {
    await API.post('/inventory', item);
    await fetchInventory();
  };

  const updateItem = async (id, updates) => {
    await API.put(`/inventory/${id}`, updates);
    await fetchInventory();
  };

  const deleteItem = async (id) => {
    await API.delete(`/inventory/${id}`);
    await fetchInventory();
  };

  const fetchOrders = useCallback(async (filter = 'all') => {
    try {
      const { data } = await API.get('/orders', { params: { paymentType: filter } });
      setOrders(data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, []);

  const createOrder = async (orderItems, paymentType, customerName, bankId) => {
    const { data } = await API.post('/orders', {
      items: orderItems,
      paymentType,
      customerName,
      bankId,
    });
    await fetchInventory();
    await fetchOrders();
    return data;
  };

  // Banks
  const fetchBanks = useCallback(async () => {
    try {
      const { data } = await API.get('/banks');
      setBanks(data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, []);

  const addBank = async (bank) => {
    await API.post('/banks', bank);
    await fetchBanks();
  };

  const updateBank = async (id, updates) => {
    await API.put(`/banks/${id}`, updates);
    await fetchBanks();
  };

  const deleteBank = async (id) => {
    await API.delete(`/banks/${id}`);
    await fetchBanks();
  };

  // Labor
  const fetchLabor = useCallback(async () => {
    try {
      const { data } = await API.get('/labor');
      setLabor(data);
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, []);

  const addLabor = async (laborData) => {
    await API.post('/labor', laborData);
    await fetchLabor();
  };

  const updateLabor = async (id, updates) => {
    await API.put(`/labor/${id}`, updates);
    await fetchLabor();
  };

  const deleteLabor = async (id) => {
    await API.delete(`/labor/${id}`);
    await fetchLabor();
  };

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      fetchInventory();
      fetchOrders();
      fetchBanks();
      fetchLabor();
    }
  }, [user, fetchInventory, fetchOrders, fetchBanks, fetchLabor]);

  return (
    <AppContext.Provider
      value={{
        user, login, register, logout, loading,
        inventory, addItem, updateItem, deleteItem, fetchInventory,
        orders, createOrder, fetchOrders,
        banks, addBank, updateBank, deleteBank, fetchBanks,
        labor, addLabor, updateLabor, deleteLabor, fetchLabor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
