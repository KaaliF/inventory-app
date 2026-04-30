import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const navKeys = [
  { to: '/', key: 'nav.dashboard' },
  { to: '/inventory', key: 'nav.inventory' },
  { to: '/orders', key: 'nav.orders' },
  { to: '/ledger', key: 'nav.ledger' },
  { to: '/banks', key: 'nav.banks' },
  { to: '/labor', key: 'nav.labor' },
  { to: '/vendors', key: 'nav.vendors' },
  { to: '/customers', key: 'nav.customers' },
  { to: '/profit', key: 'nav.profit' },
];

export default function Layout() {
  const { user, logout } = useApp();
  const { t, toggleLanguage, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <span className="text-xl font-bold text-indigo-600">StockFlow</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                {isUrdu ? 'English' : 'اردو'}
              </button>
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 bottom-0 z-40 w-64 bg-white border-gray-200 shadow-lg transform transition-transform duration-200 ease-in-out ${
          isUrdu ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          sidebarOpen
            ? 'translate-x-0'
            : isUrdu ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {navKeys.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="pt-14 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
