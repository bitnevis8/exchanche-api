const axios = require('axios');

// تابع پیدا کردن شهرستان والد (مستقیم یا غیرمستقیم)
const findParentCounty = async (locationId, locations) => {
  let currentId = locationId;
  
  while (currentId) {
    const currentLocation = locations.find(loc => loc.id === currentId);
    if (!currentLocation) break;
    
    // اگر شهرستان باشد (divisionType === 2)
    if (currentLocation.divisionType === 2) {
      return currentLocation;
    }
    
    currentId = currentLocation.parentId;
  }
  
  return null;
};

// تابع ساخت عبارت جستجو بر اساس نوع تقسیمات
const buildSearchTerm = async (location, locations) => {
  if (location.divisionType === 0) {
    // کشور: فقط displayName
    return location.displayName;
  } else if (location.divisionType === 1) {
    // استان: فقط displayName
    return location.displayName;
  } else if (location.divisionType === 2) {
    // شهرستان: اولویت با name، اگر نبود displayName
    return location.name || location.displayName;
  } else {
    // پایین‌تر از شهرستان: displayName + خط فاصله + نام شهرستان والد + ایران
    const parentCounty = await findParentCounty(location.parentId, locations);
    if (parentCounty) {
      return `${location.displayName} - ${parentCounty.displayName} ایران`;
    } else {
      // اگر شهرستان والد پیدا نشد، فقط displayName + ایران
      return `${location.displayName} ایران`;
    }
  }
};

// تابع ساخت fallback search term
const buildFallbackSearchTerm = async (location, locations) => {
  if (location.divisionType === 0 || location.divisionType === 1) {
    // کشور یا استان: فقط name
    return location.name;
  } else if (location.divisionType === 2) {
    // شهرستان: فقط name
    return location.name;
  } else {
    // پایین‌تر از شهرستان: ابتدا شهرستان والد را پیدا کن
    const parentCounty = await findParentCounty(location.parentId, locations);
    if (parentCounty) {
      return parentCounty.name; // از نام شهرستان والد استفاده کن
    } else {
      return `${location.displayName} ایران`;
    }
  }
};

// داده‌های نمونه برای تست
const sampleLocations = [
  {
    id: 1,
    name: "ایران",
    displayName: "کشور ایران",
    divisionType: 0,
    parentId: null
  },
  {
    id: 2,
    name: "خوزستان",
    displayName: "استان خوزستان",
    divisionType: 1,
    parentId: 1
  },
  {
    id: 3,
    name: "دزفول",
    displayName: "شهرستان دزفول",
    divisionType: 2,
    parentId: 2
  },
  {
    id: 4,
    name: "مرکزی",
    displayName: "بخش مرکزی",
    divisionType: 3,
    parentId: 3
  },
  {
    id: 5,
    name: "دزفول",
    displayName: "شهر دزفول",
    divisionType: 5,
    parentId: 4
  }
];

// تست تابع‌ها
const testSearchTerms = async () => {
  console.log('=== تست عبارت‌های جستجو ===\n');
  
  for (const location of sampleLocations) {
    const searchTerm = await buildSearchTerm(location, sampleLocations);
    const fallbackTerm = await buildFallbackSearchTerm(location, sampleLocations);
    
    console.log(`📍 ${location.displayName} (${getDivisionTypeName(location.divisionType)})`);
    console.log(`   Search Term: "${searchTerm}"`);
    console.log(`   Fallback Term: "${fallbackTerm}"`);
    console.log('');
  }
};

// تابع کمکی برای نمایش نام نوع تقسیمات
const getDivisionTypeName = (divisionType) => {
  const types = {
    0: 'کشور',
    1: 'استان',
    2: 'شهرستان',
    3: 'بخش',
    4: 'دهستان',
    5: 'شهر',
    6: 'آبادی'
  };
  return types[divisionType] || 'نامشخص';
};

// تست درخواست‌های واقعی به ویکی‌پدیا
const testWikipediaSearch = async (searchTerm) => {
  try {
    console.log(`🔍 جستجو در ویکی‌پدیا: "${searchTerm}"`);
    
    const response = await axios.get('https://fa.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: searchTerm,
        format: 'json',
        srlimit: 3
      }
    });
    
    if (response.data.query && response.data.query.search.length > 0) {
      console.log('✅ نتایج یافت شد:');
      response.data.query.search.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title} (ID: ${result.pageid})`);
        console.log(`      ${result.snippet.replace(/<[^>]*>/g, '')}`);
      });
    } else {
      console.log('❌ نتیجه‌ای یافت نشد');
    }
  } catch (error) {
    console.error('❌ خطا در جستجو:', error.message);
  }
  console.log('');
};

// تست درخواست‌های واقعی به Wikidata
const testWikidataSearch = async (searchTerm) => {
  try {
    console.log(`🔍 جستجو در Wikidata: "${searchTerm}"`);
    
    const searchParams = new URLSearchParams({
      action: 'wbsearchentities',
      search: searchTerm,
      language: 'fa',
      format: 'json',
      type: 'item',
      limit: 3
    });

    const response = await axios.get(`https://www.wikidata.org/w/api.php?${searchParams.toString()}`);
    
    if (response.data.search && response.data.search.length > 0) {
      console.log('✅ نتایج یافت شد:');
      response.data.search.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title} (ID: ${result.id})`);
        if (result.description) {
          console.log(`      ${result.description}`);
        }
      });
    } else {
      console.log('❌ نتیجه‌ای یافت نشد');
    }
  } catch (error) {
    console.error('❌ خطا در جستجو:', error.message);
  }
  console.log('');
};

// اجرای تست‌ها
const runTests = async () => {
  console.log('🚀 شروع تست منطق جستجوی جدید\n');
  
  // تست عبارت‌های جستجو
  await testSearchTerms();
  
  // تست درخواست‌های واقعی
  console.log('=== تست درخواست‌های واقعی ===\n');
  
  // تست ویکی‌پدیا
  await testWikipediaSearch('کشور ایران');
  await testWikipediaSearch('استان خوزستان');
  await testWikipediaSearch('دزفول');
  await testWikipediaSearch('بخش مرکزی - شهرستان دزفول ایران');
  
  // تست Wikidata
  await testWikidataSearch('کشور ایران');
  await testWikidataSearch('استان خوزستان');
  await testWikidataSearch('دزفول');
  await testWikidataSearch('بخش مرکزی - شهرستان دزفول ایران');
  
  // تست fallback برای Wikidata
  console.log('=== تست Fallback برای Wikidata ===\n');
  await testWikidataSearch('بخش مرکزی ایران');
  await testWikidataSearch('دزفول');
  await testWikidataSearch('شهرستان دزفول');
  
  console.log('✅ تست‌ها کامل شد');
};

// اجرای تست‌ها
runTests().catch(console.error); 