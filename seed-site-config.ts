import { db } from './server/db';
import { siteConfig } from './shared/schema';
import { eq } from 'drizzle-orm';

const defaultConfigs = [
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
  
  // Content
  {
    key: 'home.hero.title',
    value: 'Hub Madridista',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero title'
  },
  {
    key: 'home.hero.subtitle',
    value: 'Tu portal definitivo de contenido del Real Madrid',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero subtitle'
  },
  {
    key: 'home.hero.description',
    value: 'Descubre los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    type: 'text' as const,
    category: 'content',
    description: 'Home page hero description'
  },
  {
    key: 'footer.about.text',
    value: 'Hub Madridista es la plataforma líder para aficionados del Real Madrid, ofreciendo contenido multimedia de calidad.',
    type: 'text' as const,
    category: 'content',
    description: 'Footer about text'
  },
  {
    key: 'about.mission',
    value: 'Conectar a los madridistas de todo el mundo con el mejor contenido del club',
    type: 'text' as const,
    category: 'content',
    description: 'About page mission statement'
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

async function seedSiteConfig() {
  console.log('🌱 Seeding site configuration...');
  
  try {
    for (const config of defaultConfigs) {
      // Check if config already exists
      const existing = await db
        .select()
        .from(siteConfig)
        .where(eq(siteConfig.key, config.key))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(siteConfig).values(config);
        console.log(`✅ Created config: ${config.key}`);
      } else {
        console.log(`⏭️  Config already exists: ${config.key}`);
      }
    }
    
    console.log('✅ Site configuration seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding site configuration:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSiteConfig()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { seedSiteConfig };
