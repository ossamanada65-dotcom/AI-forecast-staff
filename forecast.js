const translations = {
  en: {
    operations: 'Operations', planning: 'Planning', dashboard: 'Dashboard',
    alerts: 'Alerts', inventory: 'Inventory', products: 'Products',
    forecast: 'AI forecast', purchaseOrders: 'Purchase orders',
    staff: 'Warehouse staff', userName: 'User Name',
    subtitle: 'What will run out, when, and how much to reorder',
    search: 'Search products, SKUs...', notifications: 'Notifications',
    lowNotice: '5 products are running low.',
    ordersNotice: '6 purchase orders need review.',
    next7: 'Next 7 days', next14: 'Next 14 days',
    running: 'Running out soon', within7: 'Within 7 days',
    within14: 'Within 14 days', rising: 'Rising', risingTag: 'Rising',
    risingDemand: 'Rising demand', above: 'Above normal use',
    shelves: 'Shelves to prepare', chartTitle: 'Product · projected stock',
    legend: 'Solid: actual · Dashed: forecast', getReady: 'Get ready',
    zoneA: 'Zone A-12', zoneB: 'Zone B-02',
    rice: 'Product 1 shelf will be nearly empty in 3 days',
    oil: 'Product 2 running low in 5 days',
    manager: 'Reordering is handled by the manager.',
    low: 'Running low', product: 'Product', zone: 'Zone',
    stock: 'Stock now', runsOut: 'Runs out in', demand: 'Demand',
    days3: '3 days', days5: '5 days', days9: '9 days',
    days2: '2 days', outNow: 'Out now', stable: 'Stable',
    falling: 'Falling', noResults: 'No products match your search.',
    signOut: 'Sign out', productsCount: 'products',
    logoutNotice: 'Sign out is not connected to an account on this page.'
  },
  ar: {
    operations: 'العمليات', planning: 'التخطيط', dashboard: 'لوحة المعلومات',
    alerts: 'التنبيهات', inventory: 'المخزون', products: 'المنتجات',
    forecast: 'توقعات الذكاء الاصطناعي', purchaseOrders: 'أوامر الشراء',
    staff: 'موظف المخزن', userName: 'اسم المستخدم',
    subtitle: 'تعرّف على المنتجات التي ستنفد وموعد نفادها والكمية المطلوب طلبها',
    search: 'ابحث عن المنتجات أو الرموز...', notifications: 'التنبيهات',
    lowNotice: '5 منتجات قاربت على النفاد.',
    ordersNotice: '6 أوامر شراء بحاجة إلى مراجعة.',
    next7: 'الأيام السبعة القادمة', next14: 'الأيام الأربعة عشر القادمة',
    running: 'منتجات قاربت على النفاد', within7: 'خلال 7 أيام',
    within14: 'خلال 14 يومًا', rising: 'متزايد', risingTag: 'متزايد',
    risingDemand: 'طلب متزايد', above: 'أعلى من الاستهلاك المعتاد',
    shelves: 'أرفف بحاجة إلى تجهيز', chartTitle: 'المنتج · المخزون المتوقع',
    legend: 'المتصل: فعلي · المتقطع: متوقع', getReady: 'استعد',
    zoneA: 'المنطقة A-12', zoneB: 'المنطقة B-02',
    rice: 'المنتج 1 يوشك أن ينفد من الرف خلال 3 أيام',
    oil: 'المنتج 2 يوشك على النفاد خلال 5 أيام',
    manager: 'يتولى المدير إعادة الطلب.',
    low: 'مخزون منخفض', product: 'المنتج', zone: 'المنطقة',
    stock: 'المخزون الحالي', runsOut: 'النفاد خلال', demand: 'الطلب',
    days3: '3 أيام', days5: '5 أيام', days9: '9 أيام',
    days2: 'يومان', outNow: 'نفد الآن', stable: 'مستقر',
    falling: 'متراجع', noResults: 'لا توجد منتجات تطابق بحثك.',
    signOut: 'تسجيل الخروج', productsCount: 'منتجات',
    logoutNotice: 'تسجيل الخروج غير مرتبط بحساب فعلي في هذه الصفحة.'
  }
};

const languageButtons = document.querySelectorAll('.language-button');
const periodButtons = document.querySelectorAll('.period-button');
const searchInput = document.querySelector('#product-search');
const productRows = [...document.querySelectorAll('#product-rows tr')];
const notificationButton = document.querySelector('#notification-button');
const notificationPopover = document.querySelector('#notification-popover');
const toast = document.querySelector('#action-toast');
let currentLanguage = 'en';
let selectedDays = 7;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function updateLanguage(language) {
  if (!Object.hasOwn(translations, language)) return;
  currentLanguage = language;
  const copy = translations[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('.avatar').forEach((avatar) => {
    avatar.textContent = language === 'ar' ? 'ام' : 'UN';
    avatar.classList.toggle('avatar-arabic', language === 'ar');
  });

  document.querySelectorAll('[data-copy]').forEach((element) => {
    const value = copy[element.dataset.copy];
    if (value) element.textContent = value;
  });

  document.querySelectorAll('[data-product]').forEach((element) => {
    element.textContent = language === 'ar'
      ? element.dataset.productAr
      : element.dataset.product;
  });

  searchInput.placeholder = copy.search;
  searchInput.setAttribute('aria-label', copy.search);
  document.querySelector('.logout').setAttribute('aria-label', copy.signOut);
  document.querySelector('.metric-note').textContent = copy[selectedDays === 7 ? 'within7' : 'within14'];
  languageButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.language === language);
  });
  updateResults();
}

function localizeDigits() {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const useArabicDigits = currentLanguage === 'ar';
  const digitPattern = useArabicDigits ? /[0-9]/g : /[٠-٩]/g;
  const digitSet = useArabicDigits ? arabicDigits : '0123456789';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    node.textContent = node.textContent.replace(digitPattern, (digit) => {
      const value = useArabicDigits ? Number(digit) : arabicDigits.indexOf(digit);
      return digitSet[value];
    });
  }
}
function updateResults() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visibleRows = 0;

  productRows.forEach((row) => {
    const name = row.querySelector('[data-product]');
    const matches = row.textContent.toLocaleLowerCase().includes(query)
      || name.dataset.product.toLocaleLowerCase().includes(query)
      || name.dataset.productAr.includes(query);
    row.hidden = !matches;
    if (matches) visibleRows += 1;
  });

  document.querySelector('#empty-state').hidden = visibleRows > 0;
  document.querySelector('#result-count').textContent =
    `${visibleRows} ${translations[currentLanguage].productsCount}`;
  localizeDigits();
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => updateLanguage(button.dataset.language));
});

periodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedDays = Number(button.dataset.days);
    periodButtons.forEach((item) => {
      item.classList.toggle('selected', item === button);
    });
    document.querySelector('#running-count').textContent = selectedDays === 7 ? '5' : '8';
    document.querySelector('[data-copy="within7"]').textContent =
      translations[currentLanguage][selectedDays === 7 ? 'within7' : 'within14'];
  });
});

searchInput.addEventListener('input', updateResults);
notificationButton.addEventListener('click', () => {
  notificationPopover.hidden = !notificationPopover.hidden;
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.notification-wrap')) {
    notificationPopover.hidden = true;
  }
});

document.querySelectorAll('.logout').forEach((button) => {
  button.addEventListener('click', () => {
    showToast(translations[currentLanguage].logoutNotice);
  });
});

updateResults();
