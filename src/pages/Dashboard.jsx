import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { inventory, orders } = useApp();
  const { t } = useLanguage();

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalProducts = inventory.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const cashOrders = orders.filter((o) => o.paymentType === 'cash');
  const creditOrders = orders.filter((o) => o.paymentType === 'credit');
  const cashTotal = cashOrders.reduce((sum, o) => sum + o.total, 0);
  const creditTotal = creditOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = inventory.filter((item) => item.quantity <= 10);

  const stats = [
    { label: t('dashboard.totalProducts'), value: totalProducts, color: 'bg-blue-500' },
    { label: t('dashboard.totalStock'), value: totalItems, color: 'bg-green-500' },
    { label: t('dashboard.totalOrders'), value: totalOrders, color: 'bg-purple-500' },
    { label: t('dashboard.revenue'), value: `Rs ${totalRevenue.toLocaleString()}`, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className={`w-10 h-10 ${stat.color} rounded-lg mb-3 flex items-center justify-center`}>
              <span className="text-white text-lg font-bold">#</span>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.cashSales')}</h3>
          <p className="text-3xl font-bold text-green-600">Rs {cashTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{cashOrders.length} {t('dashboard.orders')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">{t('dashboard.creditSales')}</h3>
          <p className="text-3xl font-bold text-red-500">Rs {creditTotal.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{creditOrders.length} {t('dashboard.orders')}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-3">{t('dashboard.lowStock')}</h3>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-amber-700">{item.name} ({item.itemCode})</span>
                <span className="font-medium text-amber-900">{item.quantity} {t('dashboard.left')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('dashboard.recentOrders')}</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium text-gray-900">{order.orderCode}</span>
                  <span className="text-gray-500 text-sm ml-2">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      order.paymentType === 'cash'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {order.paymentType === 'cash' ? t('dashboard.cash') : t('dashboard.credit')}
                  </span>
                  <span className="font-semibold text-gray-900">Rs {order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
