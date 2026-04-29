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

export default function Vendors() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  // Ledger modal state
  const [ledgerVendor, setLedgerVendor] = useState(null);
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
        await updateVendor(editingId, { name: form.name, phone: form.phone, address: form.address });
      } else {
        await addVendor({ name: form.name, phone: form.phone, address: form.address });
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving vendor');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (vendor) => {
    setEditingId(vendor.id);
    setForm({ name: vendor.name, phone: vendor.phone || '', address: vendor.address || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('vendors.confirmDelete'))) return;
    try {
      await deleteVendor(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting vendor');
    }
  };

  const openLedger = async (vendor) => {
    setLedgerVendor(vendor);
    setLedgerLoading(true);
    try {
      const { data } = await API.get(`/vendors/${vendor.id}/transactions`);
      setLedgerTxns(data);
    } catch (err) {
      setLedgerTxns([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const closeLedger = () => {
    setLedgerVendor(null);
    setLedgerTxns([]);
  };

  const totalDebit = ledgerTxns.filter(tx => tx.category === 'purchase').reduce((sum, tx) => sum + tx.amount, 0);
  const totalCredit = ledgerTxns.filter(tx => tx.category === 'payment_sent').reduce((sum, tx) => sum + tx.amount, 0);
  const netBalance = totalDebit - totalCredit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('vendors.title')}</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('vendors.addVendor')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? t('vendors.editVendor') : t('vendors.addNewVendor')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendors.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('vendors.namePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendors.phone')}</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('vendors.phonePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vendors.address')}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('vendors.addressPlaceholder')}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? t('vendors.saving') : editingId ? t('vendors.update') : t('vendors.add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {t('vendors.cancel')}
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('vendors.name')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('vendors.phone')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('vendors.address')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('vendors.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((vendor, i) => (
              <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{vendor.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{vendor.address || '—'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openLedger(vendor)}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium cursor-pointer"
                  >
                    {t('vendors.ledger')}
                  </button>
                  <button
                    onClick={() => startEdit(vendor)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                  >
                    {t('vendors.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                  >
                    {t('vendors.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {t('vendors.noVendors')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger Modal */}
      {ledgerVendor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={closeLedger}>
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('vendors.ledgerFor')} {ledgerVendor.name}
                  </h3>
                  {ledgerVendor.phone && (
                    <p className="text-sm text-gray-500">{ledgerVendor.phone}</p>
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-red-50 rounded-xl border border-red-200 p-3">
                    <p className="text-xs text-red-600">{t('vendors.totalPurchases')}</p>
                    <p className="text-lg font-bold text-red-700">Rs {totalDebit.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl border border-green-200 p-3">
                    <p className="text-xs text-green-600">{t('vendors.totalPaid')}</p>
                    <p className="text-lg font-bold text-green-700">Rs {totalCredit.toLocaleString()}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${netBalance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <p className={`text-xs ${netBalance > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>{t('vendors.balance')}</p>
                    <p className={`text-lg font-bold ${netBalance > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>Rs {netBalance.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {ledgerLoading ? (
                <div className="py-12 text-center text-gray-400">{t('vendors.loading')}</div>
              ) : ledgerTxns.length === 0 ? (
                <div className="py-12 text-center text-gray-400">{t('vendors.noTransactions')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.date')}</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.description')}</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.item')}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-red-600 uppercase">{t('ledgerModal.debit')}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 uppercase">{t('ledgerModal.credit')}</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('ledgerModal.balance')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        let runBal = 0;
                        return ledgerTxns.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((tx, i) => {
                          const isDebit = tx.category === 'purchase';
                          if (isDebit) runBal += tx.amount; else runBal -= tx.amount;
                          return (
                            <tr key={tx.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(tx.createdAt).toLocaleDateString('en-PK')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{tx.description}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {tx.item ? `${tx.item.name}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                {isDebit ? `Rs ${tx.amount.toLocaleString()}` : ''}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                {!isDebit ? `Rs ${tx.amount.toLocaleString()}` : ''}
                              </td>
                              <td className={`px-4 py-3 text-sm text-right font-bold ${runBal > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                Rs {runBal.toLocaleString()}
                              </td>
                            </tr>
                          );
                        });
                      })()}
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
