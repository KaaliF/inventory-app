import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const API = axios.create({ baseURL: API_BASE });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const categoryTypeMap = {
  sale: 'jama',
  purchase: 'naam',
  payment_received: 'jama',
  payment_sent: 'naam',
  expense: 'naam',
  udhar_wapsi: 'jama',
  udhar_diya: 'naam',
  labor_payment: 'naam',
  other: null,
};

const categoryKeys = [
  { value: 'sale', key: 'roznamcha.catSale' },
  { value: 'purchase', key: 'roznamcha.catPurchase' },
  { value: 'payment_received', key: 'roznamcha.catPaymentReceived' },
  { value: 'payment_sent', key: 'roznamcha.catPaymentSent' },
  { value: 'expense', key: 'roznamcha.catExpense' },
  { value: 'udhar_wapsi', key: 'roznamcha.catUdharWapsi' },
  { value: 'udhar_diya', key: 'roznamcha.catUdharDiya' },
  { value: 'labor_payment', key: 'roznamcha.catLaborPayment' },
  { value: 'other', key: 'roznamcha.catOther' },
];

const categoryLabelKeys = {
  sale: 'roznamcha.catSale',
  purchase: 'roznamcha.catPurchase',
  payment_received: 'roznamcha.catPaymentReceived',
  payment_sent: 'roznamcha.catPaymentSent',
  expense: 'roznamcha.catExpense',
  udhar_wapsi: 'roznamcha.catUdharWapsi',
  udhar_diya: 'roznamcha.catUdharDiya',
  labor_payment: 'roznamcha.catLaborPayment',
  other: 'roznamcha.catOther',
};

const paymentModeBadge = (mode, t) => {
  if (mode === 'bank') return { label: t('roznamcha.modeBank'), cls: 'bg-blue-100 text-blue-700' };
  if (mode === 'credit') return { label: t('roznamcha.modeCredit'), cls: 'bg-red-100 text-red-700' };
  return { label: t('roznamcha.modeCash'), cls: 'bg-green-100 text-green-700' };
};

export default function Ledger() {
  const { t } = useLanguage();
  const { labor, banks, vendors, customers, inventory, fetchInventory } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailTx, setDetailTx] = useState(null);
  const [form, setForm] = useState({
    type: 'jama',
    category: 'sale',
    description: '',
    partyName: '',
    amount: '',
    laborId: '',
    vendorId: '',
    customerId: '',
    bankId: '',
    itemId: '',
    itemQty: '1',
    paymentMode: 'cash',
  });
  const [attachFile, setAttachFile] = useState(null);

  const isAutoType = categoryTypeMap[form.category] !== null;

  const fetchData = useCallback(async () => {
    try {
      const { data: result } = await API.get('/ledger', { params: { date } });
      setData(result);
    } catch (err) {
      console.error(err);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ type: 'jama', category: 'sale', description: '', partyName: '', amount: '', laborId: '', vendorId: '', customerId: '', bankId: '', itemId: '', itemQty: '1', paymentMode: 'cash' });
    setAttachFile(null);
    setShowForm(false);
  };

  const handleCategoryChange = (category) => {
    const mappedType = categoryTypeMap[category];
    setForm({
      ...form,
      category,
      type: mappedType !== null ? mappedType : form.type,
      laborId: category === 'labor_payment' ? form.laborId : '',
      vendorId: (category === 'purchase' || category === 'payment_sent') ? form.vendorId : '',
      customerId: (category === 'sale' || category === 'payment_received') ? form.customerId : '',
      itemId: (category === 'sale' || category === 'purchase') ? form.itemId : '',
      bankId: '',
      paymentMode: 'cash',
    });
  };

  const handleLaborSelect = (laborId) => {
    const selectedLabor = labor.find((l) => l.id === laborId);
    setForm({
      ...form,
      laborId,
      partyName: selectedLabor ? selectedLabor.name : form.partyName,
      amount: selectedLabor?.dailyRate ? String(selectedLabor.dailyRate) : form.amount,
      description: selectedLabor ? `Labor payment - ${selectedLabor.name}` : form.description,
    });
  };

  const handleVendorSelect = (vendorId) => {
    const selectedVendor = vendors.find((v) => v.id === vendorId);
    setForm({
      ...form,
      vendorId,
      partyName: selectedVendor ? selectedVendor.name : form.partyName,
      description: form.category === 'payment_sent' && selectedVendor
        ? `Payment sent - ${selectedVendor.name}`
        : form.description,
    });
  };

  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    setForm({
      ...form,
      customerId,
      partyName: selectedCustomer ? selectedCustomer.name : form.partyName,
      description: form.category === 'payment_received' && selectedCustomer
        ? `Payment received - ${selectedCustomer.name}`
        : form.description,
    });
  };

  const handleItemSelect = (itemId) => {
    const selectedItem = inventory.find((item) => item.id === itemId);
    const qty = 1;
    setForm({
      ...form,
      itemId,
      itemQty: String(qty),
      description: selectedItem
        ? `${form.category === 'sale' ? 'Sale' : 'Purchase'} - ${selectedItem.name}`
        : form.description,
      amount: selectedItem?.price ? String(selectedItem.price * qty) : form.amount,
    });
  };

  const handleItemQtyChange = (newQty) => {
    const selectedItem = inventory.find((item) => item.id === form.itemId);
    const qty = Number(newQty) || 0;
    setForm({
      ...form,
      itemQty: newQty,
      amount: selectedItem?.price ? String(selectedItem.price * qty) : form.amount,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', form.type);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('partyName', form.partyName);
      fd.append('amount', form.amount);
      fd.append('paymentMode', form.paymentMode);
      if (form.laborId) fd.append('laborId', form.laborId);
      if (form.vendorId) fd.append('vendorId', form.vendorId);
      if (form.customerId) fd.append('customerId', form.customerId);
      if (form.itemId) {
        fd.append('itemId', form.itemId);
        fd.append('itemQty', form.itemQty);
      }
      if (form.paymentMode === 'bank' && form.bankId) fd.append('bankId', form.bankId);
      if (attachFile) fd.append('attachment', attachFile);

      await API.post('/ledger', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      fetchData();
      if (form.itemId) fetchInventory();
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

  // Helpers for detail modal
  const getBankName = (bankId) => {
    const bank = banks.find((b) => b.id === bankId);
    return bank ? `${bank.name}${bank.accountNo ? ` (${bank.accountNo})` : ''}` : bankId;
  };
  const getLaborName = (laborId) => {
    const l = labor.find((lb) => lb.id === laborId);
    return l ? l.name : laborId;
  };
  const getVendorName = (vendorId) => {
    const v = vendors.find((vn) => vn.id === vendorId);
    return v ? v.name : vendorId;
  };
  const getCustomerName = (customerId) => {
    const c = customers.find((cu) => cu.id === customerId);
    return c ? c.name : customerId;
  };
  const getItemName = (itemId) => {
    const item = inventory.find((i) => i.id === itemId);
    return item ? `${item.name} (${item.itemCode})` : itemId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('roznamcha.title')}</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('roznamcha.newEntry')}
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <button onClick={() => goDay(-1)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
          {t('roznamcha.prevDay')}
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button onClick={() => goDay(1)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 cursor-pointer">
          {t('roznamcha.nextDay')}
        </button>
        <button
          onClick={() => setDate(new Date().toISOString().split('T')[0])}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 cursor-pointer"
        >
          {t('roznamcha.today')}
        </button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500">{t('roznamcha.openingBalance')}</p>
            <p className="text-xl font-bold text-gray-900">Rs {data.openingBalance.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-600">{t('roznamcha.jama')}</p>
            <p className="text-xl font-bold text-green-700">Rs {data.totalJama.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-600">{t('roznamcha.naam')}</p>
            <p className="text-xl font-bold text-red-700">Rs {data.totalNaam.toLocaleString()}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
            <p className="text-xs text-indigo-600">{t('roznamcha.closingBalance')}</p>
            <p className="text-xl font-bold text-indigo-700">Rs {data.closingBalance.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('roznamcha.newEntryTitle')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('roznamcha.type')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => !isAutoType && setForm({ ...form, type: 'jama' })}
                    disabled={isAutoType}
                    className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                      form.type === 'jama'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600'
                    } ${isAutoType ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {t('roznamcha.jama')}
                  </button>
                  <button
                    type="button"
                    onClick={() => !isAutoType && setForm({ ...form, type: 'naam' })}
                    disabled={isAutoType}
                    className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                      form.type === 'naam'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-600'
                    } ${isAutoType ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {t('roznamcha.naam')}
                  </button>
                </div>
                {isAutoType && (
                  <p className="text-xs text-indigo-500 mt-1">{t('roznamcha.autoTypeHint')}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.category')}</label>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {categoryKeys.map((c) => (
                    <option key={c.value} value={c.value}>{t(c.key)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labor dropdown when labor_payment selected */}
            {form.category === 'labor_payment' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.selectLabor')}</label>
                <select
                  value={form.laborId}
                  onChange={(e) => handleLaborSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">{t('roznamcha.selectLabor')}</option>
                  {labor.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.dailyRate ? `— Rs ${l.dailyRate.toLocaleString()}/day` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Vendor dropdown when purchase or payment_sent selected */}
            {(form.category === 'purchase' || form.category === 'payment_sent') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.selectVendor')}</label>
                <select
                  value={form.vendorId}
                  onChange={(e) => handleVendorSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">{t('roznamcha.selectVendor')}</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.phone ? `— ${v.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer dropdown when sale or payment_received selected */}
            {(form.category === 'sale' || form.category === 'payment_received') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.selectCustomer')}</label>
                <select
                  value={form.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">{t('roznamcha.selectCustomer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `— ${c.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Item dropdown + quantity when sale or purchase selected */}
            {(form.category === 'sale' || form.category === 'purchase') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.selectItem')}</label>
                  <select
                    value={form.itemId}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">{t('roznamcha.selectItem')}</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — Rs {item.price.toLocaleString()} ({item.quantity} {item.unit === 'kg' ? 'KG' : 'QTY'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.itemQty')}</label>
                  <input
                    type="number"
                    min="1"
                    value={form.itemQty}
                    onChange={(e) => handleItemQtyChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Payment Mode: Cash / Credit / Bank */}
            {form.category !== 'labor_payment' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roznamcha.paymentMode')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paymentMode: 'cash', bankId: '' })}
                      className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                        form.paymentMode === 'cash'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t('roznamcha.modeCash')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paymentMode: 'credit', bankId: '' })}
                      className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                        form.paymentMode === 'credit'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t('roznamcha.modeCredit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, paymentMode: 'bank' })}
                      className={`py-2 rounded-lg text-sm font-medium border-2 cursor-pointer ${
                        form.paymentMode === 'bank'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t('roznamcha.modeBank')}
                    </button>
                  </div>
                </div>
                {form.paymentMode === 'bank' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.selectBank')}</label>
                    <select
                      value={form.bankId}
                      onChange={(e) => setForm({ ...form, bankId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="">{t('roznamcha.selectBank')}</option>
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.accountNo ? `(${b.accountNo})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.partyName')}</label>
                <input
                  type="text"
                  value={form.partyName}
                  onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={t('roznamcha.partyPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.description')}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={t('roznamcha.descPlaceholder')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.amount')}</label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={t('roznamcha.amountPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('roznamcha.attachment')}</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors">
                  {t('roznamcha.chooseFile')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAttachFile(e.target.files[0] || null)}
                  />
                </label>
                {attachFile && (
                  <span className="text-sm text-gray-600">{attachFile.name}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
              >
                {submitting ? t('roznamcha.saving') : t('roznamcha.saveEntry')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
              >
                {t('roznamcha.cancel')}
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.time')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.description')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.party')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.category')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.paymentMode')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 uppercase">{t('roznamcha.jama')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-red-600 uppercase">{t('roznamcha.naam')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('roznamcha.balance')}</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.openingBalance !== undefined && (
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">—</td>
                <td className="px-4 py-3 text-sm text-gray-500" colSpan={7}>{t('roznamcha.openingBalance')}</td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Rs {data.openingBalance.toLocaleString()}
                </td>
                <td></td>
              </tr>
            )}
            {data?.transactions.map((tx, i) => {
              const badge = paymentModeBadge(tx.paymentMode || 'cash', t);
              return (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {tx.description}
                    {tx.attachment && (
                      <span className="inline-block ml-1.5 text-indigo-500" title={t('roznamcha.attachment')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tx.partyName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {t(categoryLabelKeys[tx.category]) || tx.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                      {badge.label}
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
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setDetailTx(tx)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                    >
                      {t('roznamcha.view')}
                    </button>
                  </td>
                </tr>
              );
            })}
            {data && data.transactions.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                  {t('roznamcha.noEntries')}
                </td>
              </tr>
            )}
            {data && data.transactions.length > 0 && (
              <tr className="bg-indigo-50 font-semibold">
                <td className="px-4 py-3" colSpan={6}>
                  <span className="text-sm text-indigo-700">{t('roznamcha.dayTotal')}</span>
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
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailTx && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetailTx(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{t('roznamcha.details')}</h3>
                <button
                  onClick={() => setDetailTx(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.time')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(detailTx.createdAt).toLocaleString('en-PK')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.type')}</p>
                  <p className={`text-sm font-bold ${detailTx.type === 'jama' ? 'text-green-600' : 'text-red-600'}`}>
                    {detailTx.type === 'jama' ? t('roznamcha.jama') : t('roznamcha.naam')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.category')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {t(categoryLabelKeys[detailTx.category]) || detailTx.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.paymentMode')}</p>
                  {(() => {
                    const b = paymentModeBadge(detailTx.paymentMode || 'cash', t);
                    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${b.cls}`}>{b.label}</span>;
                  })()}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.party')}</p>
                  <p className="text-sm font-medium text-gray-900">{detailTx.partyName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.amount')}</p>
                  <p className="text-sm font-bold text-gray-900">Rs {detailTx.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">{t('roznamcha.description')}</p>
                <p className="text-sm text-gray-900">{detailTx.description}</p>
              </div>

              {detailTx.bankId && (
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.bankName')}</p>
                  <p className="text-sm font-medium text-blue-700">{getBankName(detailTx.bankId)}</p>
                </div>
              )}

              {detailTx.laborId && (
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.laborName')}</p>
                  <p className="text-sm font-medium text-gray-900">{getLaborName(detailTx.laborId)}</p>
                </div>
              )}

              {detailTx.vendorId && (
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.vendorName')}</p>
                  <p className="text-sm font-medium text-gray-900">{getVendorName(detailTx.vendorId)}</p>
                </div>
              )}

              {detailTx.customerId && (
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.customerName')}</p>
                  <p className="text-sm font-medium text-gray-900">{getCustomerName(detailTx.customerId)}</p>
                </div>
              )}

              {detailTx.itemId && (
                <div>
                  <p className="text-xs text-gray-500">{t('roznamcha.selectItem')}</p>
                  <p className="text-sm font-medium text-indigo-700">{getItemName(detailTx.itemId)}</p>
                </div>
              )}

              {detailTx.attachment && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">{t('roznamcha.attachment')}</p>
                  <img
                    src={`${UPLOAD_BASE}${detailTx.attachment}`}
                    alt="Attachment"
                    className="rounded-lg border border-gray-200 max-h-80 w-full object-contain bg-gray-50"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setDetailTx(null)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
                >
                  {t('roznamcha.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
