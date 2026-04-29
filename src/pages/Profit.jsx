import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: API_BASE });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Profit() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: result } = await API.get('/profit');
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('profit.title')}</h2>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-xs text-blue-600">{t('profit.totalRevenue')}</p>
            <p className="text-xl font-bold text-blue-700">Rs {data.summary.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-600">{t('profit.totalCost')}</p>
            <p className="text-xl font-bold text-red-700">Rs {data.summary.totalCost.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl border p-4 ${
            data.summary.totalProfit >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-xs ${data.summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {t('profit.totalProfit')}
            </p>
            <p className={`text-xl font-bold ${data.summary.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              Rs {data.summary.totalProfit.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Profit Table — per transaction */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.date')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.itemName')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.party')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.qty')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-red-500 uppercase">{t('profit.costPrice')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-blue-500 uppercase">{t('profit.salePrice')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.profitPerUnit')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('profit.itemProfit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('en-PK')}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <span>{item.itemName}</span>
                  <span className="ml-1.5 text-xs text-gray-400 font-mono">{item.itemCode}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.partyName}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">{item.qty} <span className="text-xs text-gray-400">{item.unit === 'kg' ? 'KG' : 'PCS'}</span></td>
                <td className="px-4 py-3 text-right text-sm text-red-600">Rs {item.costPrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm text-blue-600">Rs {item.salePrice.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right text-sm font-medium ${
                  item.profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  Rs {item.profitPerUnit.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    item.totalProfit >= 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Rs {item.totalProfit.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  {t('profit.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
