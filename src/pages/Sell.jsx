import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Sell() {
  const { inventory, createOrder } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState(1);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableItems = inventory.filter((item) => item.quantity > 0);

  const addToCart = () => {
    if (!selectedItem) return;
    const item = inventory.find((i) => i.id === selectedItem);
    if (!item) return;

    const existing = cart.find((c) => c.id === item.id);
    const currentQty = existing ? existing.quantity : 0;
    const maxQty = item.quantity - currentQty;

    if (qty > maxQty) {
      alert(`Only ${maxQty} more available for ${item.name}`);
      return;
    }

    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + qty } : c)));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, quantity: qty }]);
    }
    setSelectedItem('');
    setQty(1);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const order = await createOrder(cart, paymentType, customerName || 'Walk-in Customer');
      setSuccess(order);
      setCart([]);
      setCustomerName('');
      setPaymentType('cash');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">New Sale</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
          Order <span className="font-bold">{success.orderCode}</span> created successfully!
          Total: Rs {success.total.toLocaleString()} ({success.paymentType.toUpperCase()})
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Items</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Item...</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — Rs {item.price.toLocaleString()} (Stock: {item.quantity})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={addToCart}
                disabled={!selectedItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">Rs {c.price.toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-700">{c.quantity}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        Rs {(c.price * c.quantity).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => removeFromCart(c.id)}
                          className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Walk-in Customer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('cash')}
                  className={`py-3 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
                    paymentType === 'cash'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Cash
                  <span className="block text-xs mt-0.5 opacity-70">Debit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('credit')}
                  className={`py-3 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${
                    paymentType === 'credit'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Credit
                  <span className="block text-xs mt-0.5 opacity-70">Udhar</span>
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Items</span>
                <span className="text-sm text-gray-700">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-indigo-600">Rs {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0 || submitting}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Complete Sale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
