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

// تست ویکی‌پدیا
const testWikipedia = async (location) => {
  console.log(`\n🔍 تست ویکی‌پدیا برای: ${location.displayName}`);
  console.log(`   نوع: ${getDivisionTypeName(location.divisionType)}`);
  
  const searchTerm = await buildSearchTerm(location, sampleLocations);
  console.log(`   Search Term: "${searchTerm}"`);
  
  try {
    const response = await axios.get('https://fa.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: searchTerm,
        format: 'json',
        srlimit: 1
      }
    });
    
    if (response.data.query && response.data.query.search.length > 0) {
      const result = response.data.query.search[0];
      console.log(`   ✅ یافت شد: ${result.title} (ID: ${result.pageid})`);
      
      // دریافت جزئیات
      const detailResponse = await axios.get('https://fa.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          prop: 'extracts|pageimages|coordinates',
          pageids: result.pageid,
          exintro: 1,
          explaintext: 1,
          piprop: 'original',
          pithumbsize: 600,
          format: 'json'
        }
      });
      
      const page = detailResponse.data.query.pages[result.pageid];
      if (page.extract) {
        console.log(`   📝 خلاصه: ${page.extract.substring(0, 150)}...`);
      }
      if (page.coordinates && page.coordinates[0]) {
        console.log(`   📍 مختصات: ${page.coordinates[0].lat}, ${page.coordinates[0].lon}`);
      }
      if (page.original && page.original.source) {
        console.log(`   🖼️ تصویر: ${page.original.source}`);
      }
    } else {
      console.log('   ❌ نتیجه‌ای یافت نشد');
    }
  } catch (error) {
    console.log(`   ❌ خطا: ${error.message}`);
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

// اجرای تست‌ها
const runTests = async () => {
  console.log('🚀 شروع تست ویکی‌پدیا\n');
  
  for (const location of sampleLocations) {
    await testWikipedia(location);
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n✅ تست‌ها کامل شد');
};

// اجرای تست‌ها
runTests().catch(console.error); 