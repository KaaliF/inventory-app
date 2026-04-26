import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const navKeys = [
  { to: '/', key: 'nav.dashboard' },
  { to: '/inventory', key: 'nav.inventory' },
  { to: '/sell', key: 'nav.newSale' },
  { to: '/orders', key: 'nav.orders' },
  { to: '/roznamcha', key: 'nav.roznamcha' },
];

export default function Layout() {
  const { user, logout } = useApp();
  const { t, toggleLanguage, isUrdu } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-indigo-600 mr-6">StockFlow</span>
              {navKeys.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                {isUrdu ? 'English' : 'اردو'}
              </button>
              <span className="text-sm text-gray-500">
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
