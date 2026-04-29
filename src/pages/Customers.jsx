import { useState } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL: API_BASE });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  // Ledger modal state
  const [ledgerCustomer, setLedgerCustomer] = useState(null);
  const [ledgerTxns, setLedgerTxns] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const resetForm = () => {
    setForm({ name: '', phone: '', address: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCustomer(editingId, { name: form.name, phone: form.phone, address: form.address });
      } else {
        await addCustomer({ name: form.name, phone: form.phone, address: form.address });
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving customer');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setForm({ name: customer.name, phone: customer.phone || '', address: customer.address || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('customers.confirmDelete'))) return;
    try {
      await deleteCustomer(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting customer');
    }
  };

  const openLedger = async (customer) => {
    setLedgerCustomer(customer);
    setLedgerLoading(true);
    try {
      const { data } = await API.get(`/customers/${customer.id}/transactions`);
      setLedgerTxns(data);
    } catch (err) {
      setLedgerTxns([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const closeLedger = () => {
    setLedgerCustomer(null);
    setLedgerTxns([]);
  };

  const totalAmount = ledgerTxns.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('customers.addCustomer')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? t('customers.editCustomer') : t('customers.addNewCustomer')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('customers.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('customers.namePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('customers.phone')}</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('customers.phonePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('customers.address')}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('customers.addressPlaceholder')}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? t('customers.saving') : editingId ? t('customers.update') : t('customers.add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {t('customers.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('customers.name')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('customers.phone')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('customers.address')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('customers.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((customer, i) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.address || '—'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openLedger(customer)}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium cursor-pointer"
                  >
                    {t('customers.ledger')}
                  </button>
                  <button
                    onClick={() => startEdit(customer)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                  >
                    {t('customers.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                  >
                    {t('customers.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {t('customers.noCustomers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Modal */}
      {ledgerCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeLedger}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('customers.ledgerFor')} {ledgerCustomer.name}
                  </h3>
                  {ledgerCustomer.phone && (
                    <p className="text-sm text-gray-500">{ledgerCustomer.phone}</p>
                  )}
                </div>
                <button
                  onClick={closeLedger}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {!ledgerLoading && ledgerTxns.length > 0 && (
                <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                  <p className="text-xs text-green-600">{t('customers.totalSales')}</p>
                  <p className="text-xl font-bold text-green-700">Rs {totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{ledgerTxns.length} {t('customers.transactions')}</p>
                </div>
              )}

              {ledgerLoading ? (
                <div className="py-12 text-center text-gray-400">{t('customers.loading')}</div>
              ) : ledgerTxns.length === 0 ? (
                <div className="py-12 text-center text-gray-400">{t('customers.noTransactions')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.date')}</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.description')}</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.item')}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.qty')}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.amount')}</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.paymentMode')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerTxns.map((tx, i) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(tx.createdAt).toLocaleDateString('en-PK')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{tx.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {tx.item ? `${tx.item.name} (${tx.item.itemCode})` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{tx.itemQty || '—'}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                            Rs {tx.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              tx.paymentMode === 'bank' ? 'bg-blue-100 text-blue-700' :
                              tx.paymentMode === 'credit' ? 'bg-red-100 text-red-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {tx.paymentMode === 'bank' ? t('roznamcha.modeBank') :
                               tx.paymentMode === 'credit' ? t('roznamcha.modeCredit') :
                               t('roznamcha.modeCash')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={closeLedger}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
                >
                  {t('ledgerModal.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
