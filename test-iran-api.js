const axios = require('axios');

async function testIranAPI() {
  try {
    console.log('🧪 Testing Iran Country API...\n');

    // فرض کنیم ID کشور ایران 1 است (یا هر ID که در دیتابیس دارید)
    const iranLocationId = 1; // این را با ID واقعی ایران در دیتابیس جایگزین کنید
    
    console.log(`🔍 Testing API for Iran (ID: ${iranLocationId})`);
    
    const response = await axios.get(`http://localhost:3001/location/getWikiDetails/${iranLocationId}`);
    const data = response.data;
    
    if (data.success) {
      console.log('✅ API Response successful');
      console.log('📄 Wiki Data:', data.data.wiki ? {
        title: data.data.wiki.title,
        extract: data.data.wiki.extract ? data.data.wiki.extract.substring(0, 100) + '...' : 'No extract',
        image: data.data.wiki.image || 'No image'
      } : 'No wiki data');
      
      console.log('🌐 Wikidata:', data.data.wikidata ? {
        id: data.data.wikidata.id,
        labels: data.data.wikidata.labels
      } : 'No wikidata');
      
      console.log('🔍 Search Term Used:', data.data.searchTerm);
    } else {
      console.log('❌ API Response failed:', data.message);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

console.log('نکته: اگر سرور روشن نیست، ابتدا آن را با npm start راه‌اندازی کنید');
testIranAPI();