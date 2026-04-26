import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Labor() {
  const { labor, addLabor, updateLabor, deleteLabor } = useApp();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', dailyRate: '' });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({ name: '', phone: '', dailyRate: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : null,
      };
      if (editingId) {
        await updateLabor(editingId, payload);
      } else {
        await addLabor(payload);
      }
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving labor');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      phone: item.phone || '',
      dailyRate: item.dailyRate ? String(item.dailyRate) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('labor.confirmDelete'))) return;
    try {
      await deleteLabor(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting labor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('labor.title')}</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          {t('labor.addLabor')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? t('labor.editLabor') : t('labor.addNewLabor')}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labor.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('labor.namePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labor.phone')}</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('labor.phonePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('labor.dailyRate')}</label>
              <input
                type="number"
                min="0"
                value={form.dailyRate}
                onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t('labor.ratePlaceholder')}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? t('labor.saving') : editingId ? t('labor.update') : t('labor.add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {t('labor.cancel')}
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('labor.name')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('labor.phone')}</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('labor.dailyRate')}</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('labor.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {labor.map((item, i) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {item.dailyRate ? `Rs ${item.dailyRate.toLocaleString()}` : '—'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                  >
                    {t('labor.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                  >
                    {t('labor.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {labor.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {t('labor.noLabor')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
