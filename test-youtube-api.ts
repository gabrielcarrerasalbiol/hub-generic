import axios from 'axios';

async function testYouTubeAPI() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  console.log('🔑 API Key presente:', apiKey ? 'Sí' : 'No');
  console.log('🔑 API Key (primeros 10 chars):', apiKey?.substring(0, 10) || 'N/A');
  
  if (!apiKey) {
    console.log('❌ No hay API key configurada');
    process.exit(1);
  }
  
  try {
    console.log('\n🔍 Probando búsqueda: "Atletico Madrid highlights"...\n');
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: 'Atletico Madrid highlights',
        maxResults: 3,
        type: 'video',
        key: apiKey
      }
    });
    
    console.log('✅ API funcionando!');
    console.log('📊 Videos encontrados:', response.data.items?.length || 0);
    
    if (response.data.items && response.data.items.length > 0) {
      console.log('\n📹 Videos:\n');
      response.data.items.forEach((item: any, index: number) => {
        console.log(`${index + 1}. ${item.snippet.title}`);
        console.log(`   Canal: ${item.snippet.channelTitle}`);
      });
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
  
  process.exit(0);
}

testYouTubeAPI();
