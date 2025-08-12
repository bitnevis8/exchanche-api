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

// داده‌های نمونه
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

// تست استراتژی fallback چندمرحله‌ای
const testWikidataFallback = async (location) => {
  console.log(`\n🔍 تست Wikidata Fallback برای: ${location.displayName}`);
  console.log(`   نوع: ${getDivisionTypeName(location.divisionType)}`);
  
  // ساخت fallback terms
  const fallbackTerms = [];
  
  if (location.divisionType === 0 || location.divisionType === 1) {
    // کشور یا استان: فقط name
    fallbackTerms.push(location.name);
  } else if (location.divisionType === 2) {
    // شهرستان: فقط name
    fallbackTerms.push(location.name);
  } else {
    // پایین‌تر از شهرستان: چندین استراتژی
    const parentCounty = await findParentCounty(location.parentId, sampleLocations);
    if (parentCounty) {
      fallbackTerms.push(parentCounty.name); // نام شهرستان والد
      fallbackTerms.push(parentCounty.displayName); // displayName شهرستان والد
    }
    fallbackTerms.push(`${location.displayName} ایران`);
    fallbackTerms.push(location.name); // نام اصلی
  }
  
  console.log(`   Fallback Terms: [${fallbackTerms.map(t => `"${t}"`).join(', ')}]`);
  
  // امتحان کردن همه fallback terms
  for (const fallbackTerm of fallbackTerms) {
    try {
      console.log(`\n   🔍 امتحان: "${fallbackTerm}"`);
      
      const searchParams = new URLSearchParams({
        action: 'wbsearchentities',
        search: fallbackTerm,
        language: 'fa',
        format: 'json',
        type: 'item',
        limit: 3
      });

      const response = await axios.get(`https://www.wikidata.org/w/api.php?${searchParams.toString()}`);
      
      if (response.data.search && response.data.search.length > 0) {
        console.log(`   ✅ یافت شد: ${response.data.search.length} نتیجه`);
        response.data.search.forEach((result, index) => {
          console.log(`      ${index + 1}. ${result.title} (ID: ${result.id})`);
          if (result.description) {
            console.log(`         ${result.description}`);
          }
        });
        return response.data.search[0]; // اولین نتیجه را برگردان
      } else {
        console.log(`   ❌ نتیجه‌ای یافت نشد`);
      }
    } catch (error) {
      console.log(`   ❌ خطا: ${error.message}`);
    }
  }
  
  return null;
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
const runFallbackTests = async () => {
  console.log('🚀 شروع تست استراتژی Fallback چندمرحله‌ای Wikidata\n');
  
  for (const location of sampleLocations) {
    const result = await testWikidataFallback(location);
    if (result) {
      console.log(`\n   🎯 بهترین نتیجه: ${result.title} (${result.id})`);
    } else {
      console.log(`\n   ❌ هیچ نتیجه‌ای یافت نشد`);
    }
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n✅ تست‌ها کامل شد');
};

// اجرای تست‌ها
runFallbackTests().catch(console.error); 