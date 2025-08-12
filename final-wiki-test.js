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

// تست کامل API
const testCompleteAPI = async (location) => {
  console.log(`\n🔍 تست کامل برای: ${location.displayName}`);
  console.log(`   نوع: ${getDivisionTypeName(location.divisionType)}`);
  
  const searchTerm = await buildSearchTerm(location, sampleLocations);
  const fallbackTerm = await buildFallbackSearchTerm(location, sampleLocations);
  
  console.log(`   Search Term: "${searchTerm}"`);
  console.log(`   Fallback Term: "${fallbackTerm}"`);
  
  // تست ویکی‌پدیا
  console.log('\n   📚 ویکی‌پدیا:');
  try {
    const wikiRes = await axios.get('https://fa.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: searchTerm,
        format: 'json',
        srlimit: 1
      }
    });
    
    if (wikiRes.data.query && wikiRes.data.query.search.length > 0) {
      const result = wikiRes.data.query.search[0];
      console.log(`   ✅ یافت شد: ${result.title} (ID: ${result.pageid})`);
      
      // دریافت جزئیات
      const detailRes = await axios.get('https://fa.wikipedia.org/w/api.php', {
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
      
      const page = detailRes.data.query.pages[result.pageid];
      if (page.extract) {
        console.log(`   📝 خلاصه: ${page.extract.substring(0, 100)}...`);
      }
      if (page.coordinates && page.coordinates[0]) {
        console.log(`   📍 مختصات: ${page.coordinates[0].lat}, ${page.coordinates[0].lon}`);
      }
    } else {
      console.log('   ❌ نتیجه‌ای یافت نشد');
    }
  } catch (error) {
    console.log(`   ❌ خطا: ${error.message}`);
  }
  
  // تست Wikidata
  console.log('\n   🗃️ Wikidata:');
  try {
    const searchParams = new URLSearchParams({
      action: 'wbsearchentities',
      search: searchTerm,
      language: 'fa',
      format: 'json',
      type: 'item',
      limit: 1
    });

    const wdRes = await axios.get(`https://www.wikidata.org/w/api.php?${searchParams.toString()}`);
    
    if (wdRes.data.search && wdRes.data.search.length > 0) {
      const result = wdRes.data.search[0];
      console.log(`   ✅ یافت شد: ${result.title} (ID: ${result.id})`);
      if (result.description) {
        console.log(`   📝 توضیحات: ${result.description}`);
      }
      
      // دریافت جزئیات entity
      const entityParams = new URLSearchParams({
        action: 'wbgetentities',
        ids: result.id,
        format: 'json',
        languages: 'fa|en',
        props: 'labels|descriptions|claims'
      });

      const entityRes = await axios.get(`https://www.wikidata.org/w/api.php?${entityParams.toString()}`);
      const entity = entityRes.data.entities[result.id];
      
      if (entity && entity.claims) {
        const claims = entity.claims;
        if (claims.P1082) {
          console.log(`   👥 جمعیت: ${claims.P1082[0].mainsnak.datavalue.value.amount}`);
        }
        if (claims.P2046) {
          console.log(`   📐 مساحت: ${claims.P2046[0].mainsnak.datavalue.value.amount} کیلومتر مربع`);
        }
        if (claims.P625) {
          const coords = claims.P625[0].mainsnak.datavalue.value;
          console.log(`   📍 مختصات: ${coords.latitude}, ${coords.longitude}`);
        }
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
const runCompleteTests = async () => {
  console.log('🚀 شروع تست کامل منطق جستجوی ویکی‌پدیا و Wikidata\n');
  
  for (const location of sampleLocations) {
    await testCompleteAPI(location);
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n✅ تست‌ها کامل شد');
};

// اجرای تست‌ها
runCompleteTests().catch(console.error); 