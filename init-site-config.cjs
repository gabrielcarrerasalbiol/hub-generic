const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@host:port/database?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function initSiteConfig() {
  try {
    // Clear existing configs
    await pool.query('DELETE FROM site_config');
    console.log('Cleared existing site_config');

    // Insert correct site config values matching what the frontend expects
    const configs = [
      // Site info
      { key: 'site.name', value: 'Hub Madridista', type: 'text', category: 'general', description: 'Site name' },
      { key: 'site.tagline', value: 'Tu fuente de contenido del Real Madrid', type: 'text', category: 'general', description: 'Site tagline' },

      // Logo
      { key: 'site.logo.url', value: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png', type: 'image', category: 'branding', description: 'Logo URL' },
      { key: 'site.logo.alt', value: 'Hub Madridista Logo', type: 'text', category: 'branding', description: 'Logo alt text' },
      { key: 'site.favicon.url', value: '/hubmadridista.png', type: 'image', category: 'branding', description: 'Favicon URL' },

      // Colors
      { key: 'site.colors.primary', value: '#001C58', type: 'text', category: 'branding', description: 'Primary color' },
      { key: 'site.colors.secondary', value: '#FDBE11', type: 'text', category: 'branding', description: 'Secondary color' },
      { key: 'site.colors.accent', value: '#FFFFFF', type: 'text', category: 'branding', description: 'Accent color' },

      // Contact
      { key: 'contact.email', value: 'contacto@hubmadridista.com', type: 'text', category: 'contact', description: 'Contact email' },
      { key: 'contact.phone', value: '+34 667976076', type: 'text', category: 'contact', description: 'Contact phone' },

      // Social
      { key: 'social.twitter.url', value: 'https://x.com/HubMadridistax', type: 'text', category: 'social', description: 'Twitter URL' },
      { key: 'social.facebook.url', value: 'https://www.facebook.com/hubmadridista', type: 'text', category: 'social', description: 'Facebook URL' },
      { key: 'social.instagram.url', value: 'https://www.instagram.com/hubmadridista', type: 'text', category: 'social', description: 'Instagram URL' },
      { key: 'social.youtube.url', value: 'https://www.youtube.com/hubmadridista', type: 'text', category: 'social', description: 'YouTube URL' },

      // SEO
      { key: 'seo.default.title', value: 'Hub Madridista | Agregador de contenido Real Madrid', type: 'text', category: 'seo', description: 'Default SEO title' },
      { key: 'seo.default.description', value: 'Hub Madridista - La plataforma definitiva con los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar', type: 'text', category: 'seo', description: 'Default SEO description' },
      { key: 'seo.default.keywords', value: 'Real Madrid, fútbol, LaLiga, Champions League, videos, noticias, jugadores, análisis', type: 'text', category: 'seo', description: 'SEO keywords' },
      { key: 'seo.og.image', value: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png', type: 'image', category: 'seo', description: 'Open Graph image' },

      // Content
      { key: 'featured.videos.count', value: '5', type: 'number', category: 'content', description: 'Featured videos count' },
      { key: 'latest.videos.count', value: '10', type: 'number', category: 'content', description: 'Latest videos count' },
    ];

    for (const config of configs) {
      await pool.query(
        'INSERT INTO site_config (key, value, type, category, description) VALUES ($1, $2, $3, $4, $5)',
        [config.key, config.value, config.type, config.category, config.description]
      );
    }
    console.log('Site config initialized with', configs.length, 'settings');

    // Verify
    const result = await pool.query('SELECT * FROM site_config');
    console.log('Total site_config rows:', result.rows.length);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

initSiteConfig();
