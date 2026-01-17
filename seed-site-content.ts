import { db } from './server/db';
import { siteConfig } from './server/db/schema';
import { eq } from 'drizzle-orm';

const contentConfig = [
  // Hero Slider - Main (First Slide)
  { key: 'content.hero.title.en', value: 'Madridista Hub' },
  { key: 'content.hero.title.es', value: 'Hub Madridista' },
  { key: 'content.hero.subtitle.en', value: 'The digital home for all madridistas' },
  { key: 'content.hero.subtitle.es', value: 'El hogar digital de todos los madridistas' },
  
  // Hero Slider - Passion
  { key: 'content.hero.passion.title.en', value: 'The White Passion' },
  { key: 'content.hero.passion.title.es', value: 'La Pasión Blanca' },
  { key: 'content.hero.passion.subtitle.en', value: 'Experience every moment with the same intensity' },
  { key: 'content.hero.passion.subtitle.es', value: 'Vive cada momento con la misma intensidad' },
  
  // Hero Slider - Feeling
  { key: 'content.hero.feeling.title.en', value: 'The Feeling' },
  { key: 'content.hero.feeling.title.es', value: 'El Sentimiento' },
  { key: 'content.hero.feeling.subtitle.en', value: 'United by the colors that represent us' },
  { key: 'content.hero.feeling.subtitle.es', value: 'Unidos por los colores que nos representan' },
  
  // Hero Slider - Fans
  { key: 'content.hero.fans.title.en', value: 'The Madridista Fanbase' },
  { key: 'content.hero.fans.title.es', value: 'La Afición Madridista' },
  { key: 'content.hero.fans.subtitle.en', value: 'The heart that beats in every stadium' },
  { key: 'content.hero.fans.subtitle.es', value: 'El corazón que late en cada estadio' },
  
  // About Section
  { key: 'content.about.title.en', value: 'What is Madridista Hub?' },
  { key: 'content.about.title.es', value: '¿Qué es Hub Madridista?' },
  { key: 'content.about.description.en', value: 'Madridista Hub is the definitive platform for Real Madrid fans, offering an immersive and personalized experience with all content related to the most decorated club in the world.' },
  { key: 'content.about.description.es', value: 'Hub Madridista es la plataforma definitiva para aficionados del Real Madrid, ofreciendo una experiencia inmersiva y personalizada con todo el contenido relacionado con el club más laureado del mundo.' },
  
  // Features - Curated Content
  { key: 'content.about.features.curated.title.en', value: 'Curated Content' },
  { key: 'content.about.features.curated.title.es', value: 'Contenido Curado' },
  { key: 'content.about.features.curated.description.en', value: 'Access the best videos, news, and updates from Real Madrid, automatically selected and categorized for you.' },
  { key: 'content.about.features.curated.description.es', value: 'Accede a los mejores vídeos, noticias y actualizaciones del Real Madrid, automáticamente seleccionados y categorizados para ti.' },
  
  // Features - Multiplatform
  { key: 'content.about.features.multiplatform.title.en', value: 'Multiplatform' },
  { key: 'content.about.features.multiplatform.title.es', value: 'Multiplataforma' },
  { key: 'content.about.features.multiplatform.description.en', value: 'Content from YouTube, Twitter, TikTok, and more, all in one place so you never miss anything important.' },
  { key: 'content.about.features.multiplatform.description.es', value: 'Contenido de YouTube, Twitter, TikTok y más, todo en un solo lugar para que nunca te pierdas nada importante.' },
  
  // Features - Notifications
  { key: 'content.about.features.notifications.title.en', value: 'Notifications' },
  { key: 'content.about.features.notifications.title.es', value: 'Notificaciones' },
  { key: 'content.about.features.notifications.description.en', value: 'Stay up to date with personalized alerts about new content from your favorite channels and categories.' },
  { key: 'content.about.features.notifications.description.es', value: 'Mantente actualizado con alertas personalizadas sobre nuevo contenido de tus canales y categorías favoritas.' },
  
  // Premium Section
  { key: 'content.premium.title.en', value: 'Premium Benefits' },
  { key: 'content.premium.title.es', value: 'Beneficios Premium' },
  { key: 'content.premium.description.en', value: 'Unlock the full potential of Madridista Hub with our premium subscription and enjoy exclusive advantages.' },
  { key: 'content.premium.description.es', value: 'Desbloquea todo el potencial de Hub Madridista con nuestra suscripción premium y disfruta de ventajas exclusivas.' },
  
  // Premium Benefits - Exclusive
  { key: 'content.premium.benefits.exclusive.title.en', value: 'Exclusive Channels' },
  { key: 'content.premium.benefits.exclusive.title.es', value: 'Canales Exclusivos' },
  { key: 'content.premium.benefits.exclusive.description.en', value: 'Access to premium channels with exclusive content and in-depth analysis.' },
  { key: 'content.premium.benefits.exclusive.description.es', value: 'Acceso a canales premium con contenido exclusivo y análisis en profundidad.' },
  
  // Premium Benefits - Ad-Free
  { key: 'content.premium.benefits.noAds.title.en', value: 'Ad-Free' },
  { key: 'content.premium.benefits.noAds.title.es', value: 'Sin Anuncios' },
  { key: 'content.premium.benefits.noAds.description.en', value: 'Enjoy an ad-free experience across the entire platform.' },
  { key: 'content.premium.benefits.noAds.description.es', value: 'Disfruta de una experiencia sin anuncios en toda la plataforma.' },
  
  // Premium Benefits - Archive
  { key: 'content.premium.benefits.history.title.en', value: 'Historical Archive' },
  { key: 'content.premium.benefits.history.title.es', value: 'Archivo Histórico' },
  { key: 'content.premium.benefits.history.description.en', value: 'Access our complete archive of historical Real Madrid moments.' },
  { key: 'content.premium.benefits.history.description.es', value: 'Accede a nuestro archivo completo de momentos históricos del Real Madrid.' },
  
  // Premium Benefits - Analysis
  { key: 'content.premium.benefits.analysis.title.en', value: 'Advanced Analysis' },
  { key: 'content.premium.benefits.analysis.title.es', value: 'Análisis Avanzado' },
  { key: 'content.premium.benefits.analysis.description.en', value: 'Detailed statistics and exclusive tactical analysis of each match.' },
  { key: 'content.premium.benefits.analysis.description.es', value: 'Estadísticas detalladas y análisis táctico exclusivo de cada partido.' },
  
  // Premium - Extra fields
  { key: 'content.premium.alreadyPremium.en', value: 'You are already a Premium member' },
  { key: 'content.premium.alreadyPremium.es', value: 'Ya eres miembro Premium' },
  { key: 'content.premium.upgrade.en', value: 'Upgrade to Premium' },
  { key: 'content.premium.upgrade.es', value: 'Actualizar a Premium' },
  
  // Testimonials
  { key: 'content.testimonials.title.en', value: 'What our users say' },
  { key: 'content.testimonials.title.es', value: 'Lo que dicen nuestros usuarios' },
  { key: 'content.testimonials.user1.name.en', value: 'Carlos Rodríguez' },
  { key: 'content.testimonials.user1.name.es', value: 'Carlos Rodríguez' },
  { key: 'content.testimonials.user1.role.en', value: 'Premium User' },
  { key: 'content.testimonials.user1.role.es', value: 'Usuario Premium' },
  { key: 'content.testimonials.user1.quote.en', value: '"Madridista Hub has changed the way I follow Real Madrid. All information in one place and perfectly categorized. Amazing service!"' },
  { key: 'content.testimonials.user1.quote.es', value: '"Hub Madridista ha cambiado la forma en que sigo al Real Madrid. Toda la información en un solo lugar y perfectamente categorizada. ¡Servicio increíble!"' },
  
  // Testimonials - User 2
  { key: 'content.testimonials.user2.name.en', value: 'Laura Martínez' },
  { key: 'content.testimonials.user2.name.es', value: 'Laura Martínez' },
  { key: 'content.testimonials.user2.role.en', value: 'Premium User' },
  { key: 'content.testimonials.user2.role.es', value: 'Usuario Premium' },
  { key: 'content.testimonials.user2.quote.en', value: '"The personalized notifications are great, I never miss new content from my favorite channels. The premium subscription is totally recommended."' },
  { key: 'content.testimonials.user2.quote.es', value: '"Las notificaciones personalizadas son geniales, nunca me pierdo contenido nuevo de mis canales favoritos. La suscripción premium es totalmente recomendable."' },
  
  // Testimonials - User 3
  { key: 'content.testimonials.user3.name.en', value: 'Miguel Sánchez' },
  { key: 'content.testimonials.user3.name.es', value: 'Miguel Sánchez' },
  { key: 'content.testimonials.user3.role.en', value: 'Free User' },
  { key: 'content.testimonials.user3.role.es', value: 'Usuario Gratuito' },
  { key: 'content.testimonials.user3.quote.en', value: '"Even the free version is exceptional. The interface is intuitive and I find all relevant content quickly. I\'m definitely upgrading to Premium."' },
  { key: 'content.testimonials.user3.quote.es', value: '"Incluso la versión gratuita es excepcional. La interfaz es intuitiva y encuentro todo el contenido relevante rápidamente. Definitivamente me pasaré a Premium."' },
  
  // CTA Section
  { key: 'content.cta.title.en', value: 'Join the madridista community' },
  { key: 'content.cta.title.es', value: 'Únete a la comunidad madridista' },
  { key: 'content.cta.description.en', value: 'Thousands of fans already enjoy the best experience to follow and enjoy all content related to Real Madrid. Join our community today!' },
  { key: 'content.cta.description.es', value: 'Miles de aficionados ya disfrutan de la mejor experiencia para seguir y disfrutar de todo el contenido relacionado con el Real Madrid. ¡Únete a nuestra comunidad hoy!' },
  { key: 'content.cta.button.en', value: 'View all videos' },
  { key: 'content.cta.button.es', value: 'Ver todos los vídeos' },
  { key: 'content.cta.registerNow.en', value: 'Register Now' },
  { key: 'content.cta.registerNow.es', value: 'Regístrate Ahora' },
];

async function seedContent() {
  console.log('🌱 Seeding site content configuration...');
  console.log('');
  
  let updated = 0;
  let inserted = 0;
  
  for (const item of contentConfig) {
    try {
      // Check if key exists
      const existing = await db.query.siteConfig.findFirst({
        where: eq(siteConfig.key, item.key),
      });
      
      if (existing) {
        // Update existing
        await db.update(siteConfig)
          .set({ value: item.value })
          .where(eq(siteConfig.key, item.key));
        updated++;
      } else {
        // Insert new
        await db.insert(siteConfig).values(item);
        inserted++;
      }
      
      process.stdout.write(`\r✓ Processed: ${updated + inserted}/${contentConfig.length}`);
    } catch (error) {
      console.error(`\n❌ Error processing ${item.key}:`, error);
    }
  }
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Site Content Seeding Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📝 Total items: ${contentConfig.length}`);
  console.log(`✨ New entries: ${inserted}`);
  console.log(`🔄 Updated entries: ${updated}`);
  console.log('');
  console.log('🌐 Content now available in:');
  console.log('   - English (.en)');
  console.log('   - Spanish (.es)');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('   1. Restart your application: pm2 restart hub-generic');
  console.log('   2. Hard refresh browser: Ctrl+Shift+R');
  console.log('   3. Switch language in settings');
  console.log('   4. Landing page will show in selected language!');
  console.log('═══════════════════════════════════════════════════════════');
}

seedContent()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
