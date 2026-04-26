import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const categories = [
  { value: 'sale', label: 'Sale' },
  { value: 'purchase', label: 'Khareedari' },
  { value: 'expense', label: 'Kharcha' },
  { value: 'udhar_wapsi', label: 'Udhar Wapsi' },
  { value: 'udhar_diya', label: 'Udhar Diya' },
  { value: 'other', label: 'Other' },
];

const categoryLabels = {
  sale: 'Sale',
  purchase: 'Khareedari',
  expense: 'Kharcha',
  udhar_wapsi: 'Udhar Wapsi',
  udhar_diya: 'Udhar Diya',
  other: 'Other',
};

export default function Roznamcha() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'jama',
    category: 'sale',
    description: '',
    partyName: '',
    amount: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const { data: result } = await API.get('/roznamcha', { params: { date } });
      setData(result);
    } catch (err) {
      console.error(err);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ type: 'jama', category: 'sale', description: '', partyName: '', amount: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/roznamcha', {
        ...form,
        amount: Number(form.amount),
      });
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving entry');
    } finally {
      setSubmitting(false);
    }
  };

  const goDay = (offset) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Roznamcha (روزنامچہ)</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          + New Entry
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <button onClick={() => goDay(-1)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
          &larr; Pichla Din
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button onClick={() => goDay(1)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
          Agla Din &rarr;
        </button>
        <button
          onClick={() => setDate(new Date().toISOString().split('T')[0])}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 cursor-pointer"
        >
          Aaj
        </button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Opening Balance</p>
            <p className="text-xl font-bold text-gray-900">Rs {data.openingBalance.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-600">Jama (In)</p>
            <p className="text-xl font-bold text-green-700">Rs {data.totalJama.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-600">Naam (Out)</p>
            <p className="text-xl font-bold text-red-700">Rs {data.totalNaam.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
            <p className="text-xs text-indigo-600">Closing Balance</p>
            <p className="text-xl font-bold text-indigo-700">Rs {data.closingBalance.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'jama' })}
                    className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                      form.type === 'jama'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Jama (In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'naam' })}
                    className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                      form.type === 'naam'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Naam (Out)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                <input
                  type="text"
                  value={form.partyName}
                  onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Naam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Detail likhein"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs)</label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Raqam"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Party</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 uppercase">Jama (In)</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-red-600 uppercase">Naam (Out)</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.openingBalance !== undefined && (
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">—</td>
                <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>Opening Balance</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Rs {data.openingBalance.toLocaleString()}
                </td>
              </tr>
            )}
            {data?.transactions.map((tx, i) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{tx.description}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{tx.partyName}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {categoryLabels[tx.category] || tx.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                  {tx.type === 'jama' ? `Rs ${tx.amount.toLocaleString()}` : ''}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-red-600">
                  {tx.type === 'naam' ? `Rs ${tx.amount.toLocaleString()}` : ''}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  Rs {tx.balance.toLocaleString()}
                </td>
              </tr>
            ))}
            {data && data.transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  Aaj koi entry nahi hai
                </td>
              </tr>
            )}
            {data && data.transactions.length > 0 && (
              <tr className="bg-indigo-50 font-semibold">
                <td className="px-4 py-3" colSpan={5}>
                  <span className="text-sm text-indigo-700">Day Total</span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-green-700">
                  Rs {data.totalJama.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm text-red-700">
                  Rs {data.totalNaam.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm text-indigo-700">
                  Rs {data.closingBalance.toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
