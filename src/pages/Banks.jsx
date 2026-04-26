import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Banks() {
  const { banks, addBank, updateBank, deleteBank } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', accountNo: '' });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ name: '', accountNo: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateBank(editingId, { name: form.name, accountNo: form.accountNo });
      } else {
        await addBank({ name: form.name, accountNo: form.accountNo });
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving bank');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (bank) => {
    setEditingId(bank.id);
    setForm({ name: bank.name, accountNo: bank.accountNo || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('banks.confirmDelete'))) return;
    try {
      await deleteBank(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting bank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('banks.title')}</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('banks.addBank')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? t('banks.editBank') : t('banks.addNewBank')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('banks.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('banks.namePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('banks.accountNo')}</label>
              <input
                type="text"
                value={form.accountNo}
                onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('banks.accountPlaceholder')}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? t('banks.saving') : editingId ? t('banks.update') : t('banks.add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {t('banks.cancel')}
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('banks.name')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('banks.accountNo')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('banks.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banks.map((bank, i) => (
              <tr key={bank.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{bank.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{bank.accountNo || '—'}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => startEdit(bank)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                  >
                    {t('banks.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(bank.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                  >
                    {t('banks.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {banks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  {t('banks.noBanks')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
