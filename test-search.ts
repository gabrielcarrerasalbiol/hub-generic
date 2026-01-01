import { searchYouTubeVideos } from './server/api/youtube';

async function testSearch() {
  console.log('🔍 Probando búsqueda con término dinámico...\n');
  
  try {
    const result = await searchYouTubeVideos('highlights', 5);
    
    console.log('✅ Resultados encontrados:', result.items?.length || 0);
    
    if (result.items && result.items.length > 0) {
      console.log('\n📹 Videos encontrados:\n');
      result.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.snippet.title}`);
        console.log(`   Canal: ${item.snippet.channelTitle}`);
        console.log(`   ID: ${item.id.videoId}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testSearch();
