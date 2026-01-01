import { searchYouTubeVideos, getYouTubeVideoDetails } from './server/api/youtube';
import { db } from './server/db';
import { videos } from './shared/schema';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Check if video should be excluded based on exclusion terms
 */
async function shouldExcludeVideo(title: string, description: string, channelTitle: string): Promise<boolean> {
  try {
    // Get exclude terms from config
    const result = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.key, 'video.search.exclude'))
      .limit(1);
    
    if (!result.length || !result[0].value) {
      return false;
    }
    
    const excludeTerms = result[0].value.split(',').map(t => t.trim().toLowerCase());
    const titleLower = title.toLowerCase();
    const channelLower = channelTitle.toLowerCase();
    
    // Check if our team (Atlético de Madrid) is in the title
    const hasAtletico = titleLower.includes('atletico') || titleLower.includes('atlético');
    
    // Check for excluded terms
    for (const term of excludeTerms) {
      if (!term) continue;
      
      // Special handling for "madrid" - only exclude if it's "Real Madrid" or appears without "Atletico"
      if (term === 'madrid') {
        // Allow if "Atletico" or "Atlético" is in title
        if (hasAtletico) {
          continue;
        }
        // Otherwise check if it's standalone "Madrid" (likely Real Madrid context)
        if (titleLower.includes('madrid') && !hasAtletico) {
          console.log(`⏭️  Excluido (Madrid sin Atlético): ${title.substring(0, 50)}...`);
          return true;
        }
      }
      
      // For other terms, check if they appear
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (regex.test(titleLower) || regex.test(channelLower)) {
        console.log(`⏭️  Excluido (contiene "${term}"): ${title.substring(0, 50)}...`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking exclusions:', error);
    return false;
  }
}

async function importVideos() {
  console.log('🔍 Buscando nuevos videos del Atlético de Madrid...\n');
  
  try {
    // Search for videos with current search term and exclusions
    const searchResults = await searchYouTubeVideos('highlights', 20); // Get more to filter
    
    if (!searchResults.items || searchResults.items.length === 0) {
      console.log('❌ No se encontraron videos');
      process.exit(1);
    }
    
    console.log(`✅ Encontrados ${searchResults.items.length} videos\n`);
    
    // Get video IDs
    const videoIds = searchResults.items.map(item => item.id.videoId);
    
    // Get detailed info
    const details = await getYouTubeVideoDetails(videoIds);
    
    if (!details || !details.items || details.items.length === 0) {
      console.log('❌ No se pudieron obtener detalles');
      process.exit(1);
    }
    
    let imported = 0;
    let skipped = 0;
    
    for (const video of details.items) {
      try {
        const snippet = video.snippet;
        const statistics = video.statistics;
        const videoId = video.id;
        
        // Check if video should be excluded
        const shouldExclude = await shouldExcludeVideo(
          snippet.title,
          snippet.description || '',
          snippet.channelTitle
        );
        
        if (shouldExclude) {
          skipped++;
          continue;
        }
        
        // Insert into database
        await db.insert(videos).values({
          externalId: videoId,
          title: snippet.title,
          description: snippet.description || '',
          thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          platform: 'youtube',
          channelTitle: snippet.channelTitle,
          channelId: snippet.channelId,
          publishedAt: snippet.publishedAt,
          viewCount: parseInt(statistics.viewCount) || 0,
          duration: video.contentDetails?.duration || 'PT0S',
          featured: false,
          featuredOrder: 0,
          isNotified: false
        });
        
        console.log(`✅ Importado: ${snippet.title.substring(0, 60)}...`);
        imported++;
        
        // Stop when we have 10 good videos
        if (imported >= 10) {
          break;
        }
        
      } catch (error) {
        console.error(`❌ Error importando video:`, error);
      }
    }
    
    console.log(`\n📊 Estadísticas:`);
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ⏭️  Excluidos: ${skipped}`);
    console.log(`\n🎉 Proceso completado`);
    console.log('\n💡 Visita http://localhost:3001 para ver los nuevos videos');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

importVideos();
