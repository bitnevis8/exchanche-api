const axios = require('axios');

async function testIranSearch() {
  try {
    console.log('🧪 Testing Iran Country Search...\n');

    // تست برای کشور ایران
    const searchTerms = [
      "ایران",
      "کشور ایران", 
      "جمهوری اسلامی ایران"
    ];
    
    for (const searchTerm of searchTerms) {
      console.log(`🔍 Search Term: "${searchTerm}"`);
      
      const searchRes = await axios.get('https://fa.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          list: 'search',
          srsearch: searchTerm,
          format: 'json',
          srlimit: 5
        }
      });

      if (searchRes.data.query && searchRes.data.query.search.length > 0) {
        console.log('✅ Search Results:');
        searchRes.data.query.search.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title} (ID: ${result.pageid})`);
          console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        });

        // بررسی کدام نتیجه بهتر است
        const results = searchRes.data.query.search;
        
        for (const result of results) {
          const title = result.title.toLowerCase();
          
          if (title === "ایران" || title.includes("جمهوری اسلامی ایران")) {
            console.log(`\n🎯 Best match for Iran: "${result.title}"`);
            
            // دریافت جزئیات صفحه
            const detailRes = await axios.get('https://fa.wikipedia.org/w/api.php', {
              params: {
                action: 'query',
                prop: 'extracts|pageimages',
                pageids: result.pageid,
                exintro: 1,
                explaintext: 1,
                piprop: 'original',
                pithumbsize: 300,
                format: 'json'
              }
            });
            
            const page = detailRes.data.query.pages[result.pageid];
            console.log('📄 Page Title:', page.title);
            console.log('📝 Extract:', page.extract ? page.extract.substring(0, 200) + '...' : 'No extract');
            console.log('🖼️ Image:', page.original?.source || 'No image');
            break;
          }
        }
      } else {
        console.log('❌ No search results found');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIranSearch();