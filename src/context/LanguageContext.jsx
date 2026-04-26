import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.inventory': 'Inventory',
    'nav.newSale': 'New Sale',
    'nav.orders': 'Orders',
    'nav.roznamcha': 'Daily Ledger',
    'nav.logout': 'Logout',

    // Login
    'login.title': 'StockFlow',
    'login.subtitle': 'Inventory Management System',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.usernamePlaceholder': 'Enter username',
    'login.passwordPlaceholder': 'Enter password',
    'login.pleaseWait': 'Please wait...',
    'login.register': 'Register',
    'login.signIn': 'Sign In',
    'login.hasAccount': 'Already have an account? Sign In',
    'login.noAccount': "Don't have an account? Register",
    'login.demo': 'Demo: admin / admin123',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.totalStock': 'Total Stock',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.revenue': 'Revenue',
    'dashboard.cashSales': 'Cash Sales',
    'dashboard.creditSales': 'Credit Sales',
    'dashboard.orders': 'orders',
    'dashboard.lowStock': 'Low Stock Alert',
    'dashboard.left': 'left',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.cash': 'CASH',
    'dashboard.credit': 'CREDIT',

    // Roznamcha
    'roznamcha.title': 'Daily Ledger',
    'roznamcha.newEntry': '+ New Entry',
    'roznamcha.prevDay': '\u2190 Previous Day',
    'roznamcha.nextDay': 'Next Day \u2192',
    'roznamcha.today': 'Today',
    'roznamcha.openingBalance': 'Opening Balance',
    'roznamcha.jama': 'Credit In',
    'roznamcha.naam': 'Debit Out',
    'roznamcha.closingBalance': 'Closing Balance',
    'roznamcha.newEntryTitle': 'New Entry',
    'roznamcha.type': 'Type',
    'roznamcha.category': 'Category',
    'roznamcha.catSale': 'Sale',
    'roznamcha.catPurchase': 'Purchase',
    'roznamcha.catExpense': 'Expense',
    'roznamcha.catUdharWapsi': 'Debt Recovery',
    'roznamcha.catUdharDiya': 'Debt Given',
    'roznamcha.catOther': 'Other',
    'roznamcha.partyName': 'Party Name',
    'roznamcha.description': 'Description',
    'roznamcha.amount': 'Amount (Rs)',
    'roznamcha.partyPlaceholder': 'Name',
    'roznamcha.descPlaceholder': 'Enter details',
    'roznamcha.amountPlaceholder': 'Amount',
    'roznamcha.saving': 'Saving...',
    'roznamcha.saveEntry': 'Save Entry',
    'roznamcha.cancel': 'Cancel',
    'roznamcha.time': 'Time',
    'roznamcha.party': 'Party',
    'roznamcha.balance': 'Balance',
    'roznamcha.noEntries': 'No entries for today',
    'roznamcha.dayTotal': 'Day Total',
    'roznamcha.autoTypeHint': 'Auto-selected based on category',

    // Inventory
    'inventory.title': 'Inventory',
    'inventory.search': 'Search items...',
    'inventory.addItem': '+ Add Item',
    'inventory.editItem': 'Edit Item',
    'inventory.addNewItem': 'Add New Item',
    'inventory.itemName': 'Item Name',
    'inventory.quantity': 'Quantity',
    'inventory.price': 'Price (Rs)',
    'inventory.saving': 'Saving...',
    'inventory.update': 'Update',
    'inventory.add': 'Add',
    'inventory.cancel': 'Cancel',
    'inventory.id': 'ID',
    'inventory.name': 'Name',
    'inventory.actions': 'Actions',
    'inventory.edit': 'Edit',
    'inventory.delete': 'Delete',
    'inventory.noItems': 'No items found',
    'inventory.confirmDelete': 'Are you sure?',

    // Sell
    'sell.title': 'New Sale',
    'sell.orderSuccess': 'Order created successfully!',
    'sell.addItems': 'Add Items',
    'sell.selectItem': 'Select Item...',
    'sell.stock': 'Stock',
    'sell.qty': 'Qty',
    'sell.add': 'Add',
    'sell.item': 'Item',
    'sell.price': 'Price',
    'sell.subtotal': 'Subtotal',
    'sell.remove': 'Remove',
    'sell.orderSummary': 'Order Summary',
    'sell.customerName': 'Customer Name',
    'sell.walkIn': 'Walk-in Customer',
    'sell.paymentType': 'Payment Type',
    'sell.cash': 'Cash',
    'sell.credit': 'Credit',
    'sell.cashSub': 'Debit',
    'sell.creditSub': 'Credit',
    'sell.items': 'Items',
    'sell.total': 'Total',
    'sell.processing': 'Processing...',
    'sell.completeSale': 'Complete Sale',

    // Orders
    'orders.title': 'Orders',
    'orders.all': 'All',
    'orders.cash': 'Cash',
    'orders.credit': 'Credit',
    'orders.noOrders': 'No orders found',
    'orders.cashBadge': 'CASH',
    'orders.creditBadge': 'CREDIT',
    'orders.item': 'Item',
    'orders.price': 'Price',
    'orders.qty': 'Qty',
    'orders.subtotal': 'Subtotal',
    'orders.total': 'Total',
  },

  ur: {
    // Nav
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.inventory': 'انوینٹری',
    'nav.newSale': 'نئی فروخت',
    'nav.orders': 'آرڈرز',
    'nav.roznamcha': 'روزنامچہ',
    'nav.logout': 'لاگ آؤٹ',

    // Login
    'login.title': 'StockFlow',
    'login.subtitle': 'انوینٹری مینجمنٹ سسٹم',
    'login.username': 'صارف نام',
    'login.password': 'پاسورڈ',
    'login.usernamePlaceholder': 'صارف نام درج کریں',
    'login.passwordPlaceholder': 'پاسورڈ درج کریں',
    'login.pleaseWait': '...براہ کرم انتظار کریں',
    'login.register': 'رجسٹر',
    'login.signIn': 'سائن ان',
    'login.hasAccount': 'پہلے سے اکاؤنٹ ہے؟ سائن ان کریں',
    'login.noAccount': 'اکاؤنٹ نہیں ہے؟ رجسٹر کریں',
    'login.demo': 'ڈیمو: admin / admin123',

    // Dashboard
    'dashboard.title': 'ڈیش بورڈ',
    'dashboard.totalProducts': 'کل مصنوعات',
    'dashboard.totalStock': 'کل اسٹاک',
    'dashboard.totalOrders': 'کل آرڈرز',
    'dashboard.revenue': 'آمدنی',
    'dashboard.cashSales': 'نقد فروخت',
    'dashboard.creditSales': 'ادھار فروخت',
    'dashboard.orders': 'آرڈرز',
    'dashboard.lowStock': 'کم اسٹاک الرٹ',
    'dashboard.left': 'باقی',
    'dashboard.recentOrders': 'حالیہ آرڈرز',
    'dashboard.cash': 'نقد',
    'dashboard.credit': 'ادھار',

    // Roznamcha
    'roznamcha.title': 'روزنامچہ',
    'roznamcha.newEntry': '+ نئی اندراج',
    'roznamcha.prevDay': 'پچھلا دن \u2192',
    'roznamcha.nextDay': '\u2190 اگلا دن',
    'roznamcha.today': 'آج',
    'roznamcha.openingBalance': 'ابتدائی بیلنس',
    'roznamcha.jama': 'جمع',
    'roznamcha.naam': 'نام',
    'roznamcha.closingBalance': 'اختتامی بیلنس',
    'roznamcha.newEntryTitle': 'نئی اندراج',
    'roznamcha.type': 'قسم',
    'roznamcha.category': 'زمرہ',
    'roznamcha.catSale': 'فروخت',
    'roznamcha.catPurchase': 'خریداری',
    'roznamcha.catExpense': 'خرچہ',
    'roznamcha.catUdharWapsi': 'ادھار واپسی',
    'roznamcha.catUdharDiya': 'ادھار دیا',
    'roznamcha.catOther': 'دیگر',
    'roznamcha.partyName': 'پارٹی کا نام',
    'roznamcha.description': 'تفصیل',
    'roznamcha.amount': 'رقم (Rs)',
    'roznamcha.partyPlaceholder': 'نام',
    'roznamcha.descPlaceholder': 'تفصیل لکھیں',
    'roznamcha.amountPlaceholder': 'رقم',
    'roznamcha.saving': '...محفوظ ہو رہا ہے',
    'roznamcha.saveEntry': 'اندراج محفوظ کریں',
    'roznamcha.cancel': 'منسوخ',
    'roznamcha.time': 'وقت',
    'roznamcha.party': 'پارٹی',
    'roznamcha.balance': 'بیلنس',
    'roznamcha.noEntries': 'آج کوئی اندراج نہیں ہے',
    'roznamcha.dayTotal': 'دن کا کل',
    'roznamcha.autoTypeHint': 'زمرے کی بنیاد پر خودکار منتخب',

    // Inventory
    'inventory.title': 'انوینٹری',
    'inventory.search': '...اشیاء تلاش کریں',
    'inventory.addItem': '+ نئی شے',
    'inventory.editItem': 'شے میں ترمیم',
    'inventory.addNewItem': 'نئی شے شامل کریں',
    'inventory.itemName': 'شے کا نام',
    'inventory.quantity': 'مقدار',
    'inventory.price': 'قیمت (Rs)',
    'inventory.saving': '...محفوظ ہو رہا ہے',
    'inventory.update': 'اپڈیٹ',
    'inventory.add': 'شامل کریں',
    'inventory.cancel': 'منسوخ',
    'inventory.id': 'آئی ڈی',
    'inventory.name': 'نام',
    'inventory.actions': 'عمل',
    'inventory.edit': 'ترمیم',
    'inventory.delete': 'حذف',
    'inventory.noItems': 'کوئی شے نہیں ملی',
    'inventory.confirmDelete': 'کیا آپ واقعی حذف کرنا چاہتے ہیں؟',

    // Sell
    'sell.title': 'نئی فروخت',
    'sell.orderSuccess': '!آرڈر کامیابی سے بن گیا',
    'sell.addItems': 'اشیاء شامل کریں',
    'sell.selectItem': '...شے منتخب کریں',
    'sell.stock': 'اسٹاک',
    'sell.qty': 'مقدار',
    'sell.add': 'شامل کریں',
    'sell.item': 'شے',
    'sell.price': 'قیمت',
    'sell.subtotal': 'ذیلی کل',
    'sell.remove': 'ہٹائیں',
    'sell.orderSummary': 'آرڈر کا خلاصہ',
    'sell.customerName': 'گاہک کا نام',
    'sell.walkIn': 'واک ان گاہک',
    'sell.paymentType': 'ادائیگی کی قسم',
    'sell.cash': 'نقد',
    'sell.credit': 'ادھار',
    'sell.cashSub': 'نقد',
    'sell.creditSub': 'ادھار',
    'sell.items': 'اشیاء',
    'sell.total': 'کل',
    'sell.processing': '...عمل جاری ہے',
    'sell.completeSale': 'فروخت مکمل کریں',

    // Orders
    'orders.title': 'آرڈرز',
    'orders.all': 'سب',
    'orders.cash': 'نقد',
    'orders.credit': 'ادھار',
    'orders.noOrders': 'کوئی آرڈر نہیں ملا',
    'orders.cashBadge': 'نقد',
    'orders.creditBadge': 'ادھار',
    'orders.item': 'شے',
    'orders.price': 'قیمت',
    'orders.qty': 'مقدار',
    'orders.subtotal': 'ذیلی کل',
    'orders.total': 'کل',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  const t = useCallback(
    (key) => translations[lang]?.[key] || translations.en[key] || key,
    [lang]
  );

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ur' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const isUrdu = lang === 'ur';

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, isUrdu }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
