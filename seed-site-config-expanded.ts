import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

const expandedConfigs = [
  // Branding
  {
    key: 'site.name',
    value: 'Hub Madridista',
    type: 'text' as const,
    category: 'branding',
    description: 'Site name displayed in header and title'
  },
  {
    key: 'site.tagline',
    value: 'La plataforma definitiva para los fans del Real Madrid',
    type: 'text' as const,
    category: 'branding',
    description: 'Site tagline or slogan'
  },
  {
    key: 'site.logo.url',
    value: '/images/logo-hubmadridista.png',
    type: 'text' as const,
    category: 'branding',
    description: 'Logo image URL'
  },
  {
    key: 'site.logo.alt',
    value: 'Hub Madridista Logo',
    type: 'text' as const,
    category: 'branding',
    description: 'Logo alt text'
  },
  {
    key: 'site.favicon.url',
    value: '/hubmadridista.png',
    type: 'text' as const,
    category: 'branding',
    description: 'Favicon URL'
  },
  {
    key: 'site.colors.primary',
    value: '#001C58',
    type: 'text' as const,
    category: 'branding',
    description: 'Primary brand color'
  },
  {
    key: 'site.colors.secondary',
    value: '#FDBE11',
    type: 'text' as const,
    category: 'branding',
    description: 'Secondary brand color'
  },
  {
    key: 'site.colors.accent',
    value: '#FFFFFF',
    type: 'text' as const,
    category: 'branding',
    description: 'Accent color'
  },
  
  // Content - Spanish
  {
    key: 'home.hero.title.es',
    value: 'Hub Madridista',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero title (Spanish)'
  },
  {
    key: 'home.hero.title.en',
    value: 'Hub Madridista',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero title (English)'
  },
  {
    key: 'home.hero.subtitle.es',
    value: 'Tu portal definitivo de contenido del Real Madrid',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero subtitle (Spanish)'
  },
  {
    key: 'home.hero.subtitle.en',
    value: 'Your ultimate Real Madrid content portal',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero subtitle (English)'
  },
  {
    key: 'home.hero.description.es',
    value: 'Descubre los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero description (Spanish)'
  },
  {
    key: 'home.hero.description.en',
    value: 'Discover the best Real Madrid videos and content from all platforms in one place',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero description (English)'
  },
  
  // Banners
  {
    key: 'banner.announcement.enabled',
    value: 'false',
    type: 'boolean' as const,
    category: 'content',
    description: 'Enable announcement banner'
  },
  {
    key: 'banner.announcement.text.es',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Announcement banner text (Spanish)'
  },
  {
    key: 'banner.announcement.text.en',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Announcement banner text (English)'
  },
  {
    key: 'banner.announcement.link',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Announcement banner link'
  },
  {
    key: 'banner.announcement.color',
    value: '#FDBE11',
    type: 'text' as const,
    category: 'content',
    description: 'Announcement banner background color'
  },
  {
    key: 'banner.promotion.enabled',
    value: 'false',
    type: 'boolean' as const,
    category: 'content',
    description: 'Enable promotion banner'
  },
  {
    key: 'banner.promotion.title.es',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner title (Spanish)'
  },
  {
    key: 'banner.promotion.title.en',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner title (English)'
  },
  {
    key: 'banner.promotion.description.es',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner description (Spanish)'
  },
  {
    key: 'banner.promotion.description.en',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner description (English)'
  },
  {
    key: 'banner.promotion.image',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner image URL'
  },
  {
    key: 'banner.promotion.cta.text.es',
    value: 'Más información',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner CTA text (Spanish)'
  },
  {
    key: 'banner.promotion.cta.text.en',
    value: 'Learn more',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner CTA text (English)'
  },
  {
    key: 'banner.promotion.cta.link',
    value: '',
    type: 'text' as const,
    category: 'content',
    description: 'Promotion banner CTA link'
  },
  
  // Footer
  {
    key: 'footer.about.text.es',
    value: 'Hub Madridista es la plataforma líder para aficionados del Real Madrid, ofreciendo contenido multimedia de calidad.',
    type: 'text' as const,
    category: 'content',
    description: 'Footer about text (Spanish)'
  },
  {
    key: 'footer.about.text.en',
    value: 'Hub Madridista is the leading platform for Real Madrid fans, offering quality multimedia content.',
    type: 'text' as const,
    category: 'content',
    description: 'Footer about text (English)'
  },
  {
    key: 'footer.copyright.es',
    value: '© 2025 Hub Madridista. Todos los derechos reservados.',
    type: 'text' as const,
    category: 'content',
    description: 'Footer copyright (Spanish)'
  },
  {
    key: 'footer.copyright.en',
    value: '© 2025 Hub Madridista. All rights reserved.',
    type: 'text' as const,
    category: 'content',
    description: 'Footer copyright (English)'
  },
  
  // About Page
  {
    key: 'about.mission.es',
    value: 'Conectar a los madridistas de todo el mundo con el mejor contenido del club',
    type: 'text' as const,
    category: 'content',
    description: 'About page mission (Spanish)'
  },
  {
    key: 'about.mission.en',
    value: 'Connecting madridistas worldwide with the best club content',
    type: 'text' as const,
    category: 'content',
    description: 'About page mission (English)'
  },
  {
    key: 'about.vision.es',
    value: 'Ser la plataforma de referencia para fans del Real Madrid',
    type: 'text' as const,
    category: 'content',
    description: 'About page vision (Spanish)'
  },
  {
    key: 'about.vision.en',
    value: 'To be the reference platform for Real Madrid fans',
    type: 'text' as const,
    category: 'content',
    description: 'About page vision (English)'
  },
  {
    key: 'about.values.es',
    value: 'Pasión, Calidad, Comunidad',
    type: 'text' as const,
    category: 'content',
    description: 'About page values (Spanish)'
  },
  {
    key: 'about.values.en',
    value: 'Passion, Quality, Community',
    type: 'text' as const,
    category: 'content',
    description: 'About page values (English)'
  },
  
  // Call to Actions
  {
    key: 'cta.register.text.es',
    value: 'Únete Ahora',
    type: 'text' as const,
    category: 'content',
    description: 'Register CTA button (Spanish)'
  },
  {
    key: 'cta.register.text.en',
    value: 'Join Now',
    type: 'text' as const,
    category: 'content',
    description: 'Register CTA button (English)'
  },
  {
    key: 'cta.premium.text.es',
    value: 'Hazte Premium',
    type: 'text' as const,
    category: 'content',
    description: 'Premium CTA button (Spanish)'
  },
  {
    key: 'cta.premium.text.en',
    value: 'Go Premium',
    type: 'text' as const,
    category: 'content',
    description: 'Premium CTA button (English)'
  },
  {
    key: 'cta.explore.text.es',
    value: 'Explorar',
    type: 'text' as const,
    category: 'content',
    description: 'Explore CTA button (Spanish)'
  },
  {
    key: 'cta.explore.text.en',
    value: 'Explore',
    type: 'text' as const,
    category: 'content',
    description: 'Explore CTA button (English)'
  },
  
  // Contact & Social
  {
    key: 'contact.email',
    value: 'contacto@hubmadridista.com',
    type: 'text' as const,
    category: 'social',
    description: 'Contact email address'
  },
  {
    key: 'contact.phone',
    value: '+34 667976076',
    type: 'text' as const,
    category: 'social',
    description: 'Contact phone number'
  },
  {
    key: 'social.twitter.url',
    value: 'https://x.com/HubMadridistax',
    type: 'text' as const,
    category: 'social',
    description: 'Twitter/X profile URL'
  },
  {
    key: 'social.facebook.url',
    value: 'https://www.facebook.com/hubmadridista',
    type: 'text' as const,
    category: 'social',
    description: 'Facebook page URL'
  },
  {
    key: 'social.instagram.url',
    value: 'https://www.instagram.com/hubmadridista',
    type: 'text' as const,
    category: 'social',
    description: 'Instagram profile URL'
  },
  {
    key: 'social.youtube.url',
    value: 'https://www.youtube.com/hubmadridista',
    type: 'text' as const,
    category: 'social',
    description: 'YouTube channel URL'
  },
  
  // SEO
  {
    key: 'seo.default.title',
    value: 'Hub Madridista | Agregador de contenido Real Madrid',
    type: 'text' as const,
    category: 'seo',
    description: 'Default SEO title'
  },
  {
    key: 'seo.default.description',
    value: 'Hub Madridista - La plataforma definitiva con los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    type: 'text' as const,
    category: 'seo',
    description: 'Default SEO meta description'
  },
  {
    key: 'seo.default.keywords',
    value: 'Real Madrid, fútbol, LaLiga, Champions League, videos, noticias, jugadores, análisis, youtube, ver videos',
    type: 'text' as const,
    category: 'seo',
    description: 'Default SEO keywords'
  },
  {
    key: 'seo.og.image',
    value: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
    type: 'text' as const,
    category: 'seo',
    description: 'Default Open Graph image URL'
  },
];

async function seedSiteConfigExpanded() {
  console.log('🌱 Seeding expanded site configuration...');
  console.log(`📊 Total settings to seed: ${expandedConfigs.length}`);
  
  try {
    let created = 0;
    let existing = 0;
    
    for (const config of expandedConfigs) {
      const existingConfig = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.key, config.key))
        .limit(1);
      
      if (existingConfig.length === 0) {
        await db.insert(siteConfig).values(config);
        console.log(`✅ Created: ${config.key}`);
        created++;
      } else {
        console.log(`⏭️  Exists: ${config.key}`);
        existing++;
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Already existed: ${existing}`);
    console.log(`  📊 Total: ${expandedConfigs.length}`);
    console.log('\n✅ Site configuration seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding site configuration:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSiteConfigExpanded()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

export { seedSiteConfigExpanded };
