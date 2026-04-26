import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Orders() {
  const { orders, fetchOrders } = useApp();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const handleFilter = (f) => {
    setFilter(f);
    fetchOrders(f);
  };

  const filterLabels = {
    all: t('orders.all'),
    cash: t('orders.cash'),
    credit: t('orders.credit'),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h2>
        <div className="flex gap-2">
          {['all', 'cash', 'credit'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          {t('orders.noOrders')}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <span className="text-lg font-bold text-gray-900">{order.orderCode}</span>
                  <span className="text-gray-500 text-sm ml-3">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(order.date).toLocaleString()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentType === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {order.paymentType === 'cash' ? t('orders.cashBadge') : t('orders.creditBadge')}
                  </span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">{t('orders.item')}</th>
                    <th className="text-left py-2 text-gray-500 font-medium">{t('orders.price')}</th>
                    <th className="text-left py-2 text-gray-500 font-medium">{t('orders.qty')}</th>
                    <th className="text-right py-2 text-gray-500 font-medium">{t('orders.subtotal')}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900">{item.name}</td>
                      <td className="py-2 text-gray-600">Rs {item.price.toLocaleString()}</td>
                      <td className="py-2 text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-indigo-600">
                  {t('orders.total')}: Rs {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
