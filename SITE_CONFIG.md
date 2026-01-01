# Site Configuration System

## Overview

The site configuration system allows administrators to customize logos, texts, colors, and other content throughout the website without modifying code. All settings are stored in the database and can be managed through the admin panel.

## Features

### Customizable Settings

The system supports configuration of:

1. **Branding**
   - Site name and tagline
   - Logo URL and alt text
   - Favicon URL
   - Primary, secondary, and accent colors

2. **Content**
   - Hero section text (title, subtitle, description)
   - Footer about text
   - Mission statement

3. **Contact & Social Media**
   - Contact email and phone
   - Social media URLs (Twitter, Facebook, Instagram, YouTube)

4. **SEO**
   - Default page title
   - Meta description
   - Keywords
   - Open Graph image

## Database Schema

The configuration is stored in the `site_config` table:

```sql
CREATE TABLE site_config (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by_id INTEGER REFERENCES users(id)
);
```

### Supported Types
- `text` - Plain text values
- `json` - JSON objects/arrays
- `image` - Image URLs
- `boolean` - True/false values
- `number` - Numeric values

## API Endpoints

### Public Endpoints

#### Get All Configuration
```
GET /api/site-config
```
Returns all site configuration as a key-value object.

#### Get Single Configuration
```
GET /api/site-config/:key
```
Returns a specific configuration item.

### Admin Endpoints (Authentication Required)

#### Get All Config with Metadata
```
GET /api/admin/site-config
```
Returns all configurations with full metadata.

#### Update/Create Configuration
```
PUT /api/admin/site-config/:key
```
Body:
```json
{
  "value": "New Value",
  "type": "text",
  "category": "branding",
  "description": "Description of setting"
}
```

#### Delete Configuration
```
DELETE /api/admin/site-config/:key
```

#### Bulk Update
```
POST /api/admin/site-config/bulk
```
Body:
```json
{
  "configs": [
    {
      "key": "site.name",
      "value": "New Site Name",
      "type": "text",
      "category": "branding",
      "description": "Site name"
    }
  ]
}
```

## Admin Interface

Access the configuration manager at: **Admin Panel → Config Tab**

### Features:
- Organized tabs for different categories (Branding, Content, Social, SEO)
- Visual color pickers for brand colors
- Image preview for logos and OG images
- Real-time saving with feedback
- Bulk save functionality

## Using Configuration in Frontend

### Hook Usage

```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

function MyComponent() {
  const { siteName, logoUrl, primaryColor, get } = useSiteConfig();
  
  return (
    <div>
      <img src={logoUrl} alt={siteName} />
      <h1 style={{ color: primaryColor }}>{siteName}</h1>
      <p>{get('custom.key', 'default value')}</p>
    </div>
  );
}
```

### Available Helper Properties

```typescript
const {
  // General
  config,           // Full config object
  isLoading,        // Loading state
  error,            // Error state
  get,              // Get any config value with fallback
  
  // Branding
  siteName,         // site.name
  tagline,          // site.tagline
  logoUrl,          // site.logo.url
  logoAlt,          // site.logo.alt
  faviconUrl,       // site.favicon.url
  primaryColor,     // site.colors.primary
  secondaryColor,   // site.colors.secondary
  accentColor,      // site.colors.accent
  
  // Contact
  contactEmail,     // contact.email
  contactPhone,     // contact.phone
  
  // Social
  socialTwitter,    // social.twitter.url
  socialFacebook,   // social.facebook.url
  socialInstagram,  // social.instagram.url
  socialYoutube,    // social.youtube.url
  
  // SEO
  seoTitle,         // seo.default.title
  seoDescription,   // seo.default.description
  seoKeywords,      // seo.default.keywords
  seoOgImage,       // seo.og.image
} = useSiteConfig();
```

## Setup Instructions

### 1. Create the Database Table

The table will be created automatically when you push the schema:

```bash
npm run db:push
```

Or manually create it using the SQL in the schema section above.

### 2. Seed Initial Configuration

Run the seed script to populate default values:

```bash
npx tsx seed-site-config.ts
```

This will create all default configuration entries if they don't exist.

### 3. Access Admin Panel

1. Log in as an administrator
2. Navigate to Admin Panel
3. Click on the "Config" tab
4. Modify settings as needed
5. Click "Save Changes"

## Adding New Configuration Items

### 1. Add to Admin Component

Edit `/client/src/components/admin/SiteConfigManagement.tsx`:

```tsx
// Add to configData state
const [configData, setConfigData] = useState<ConfigFormData>({
  // ... existing configs
  'custom.new.key': 'default value',
});

// Add input field in appropriate tab
<div className="space-y-2">
  <Label htmlFor="custom-key">Custom Setting</Label>
  <Input
    id="custom-key"
    value={configData['custom.new.key'] || ''}
    onChange={(e) => handleInputChange('custom.new.key', e.target.value)}
    placeholder="Enter value"
  />
</div>
```

### 2. Add to Hook (Optional)

Edit `/client/src/hooks/useSiteConfig.ts`:

```tsx
export function useSiteConfig() {
  // ... existing code
  return {
    // ... existing properties
    customKey: config?.['custom.new.key'] || 'default',
  };
}
```

### 3. Add to Seed Script (Optional)

Edit `seed-site-config.ts`:

```typescript
const defaultConfigs = [
  // ... existing configs
  {
    key: 'custom.new.key',
    value: 'default value',
    type: 'text' as const,
    category: 'general',
    description: 'Description of custom setting'
  },
];
```

## Configuration Key Naming Convention

Use dot notation for hierarchical organization:
- `category.subcategory.name`
- Examples:
  - `site.logo.url`
  - `social.twitter.url`
  - `seo.default.title`

### Categories:
- `branding` - Visual identity (logos, colors)
- `content` - Text content
- `social` - Contact and social media
- `seo` - Search engine optimization
- `general` - Other settings

## Best Practices

1. **Always provide fallback values** when using `get()` or accessing config
2. **Use semantic naming** for configuration keys
3. **Document new settings** in the description field
4. **Test changes** before deploying to production
5. **Backup configurations** before major changes
6. **Use appropriate types** (text, json, boolean, number, image)
7. **Keep sensitive data** out of public config (use environment variables instead)

## Examples

### Customizing the Header

```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

function Header() {
  const { logoUrl, logoAlt, siteName } = useSiteConfig();
  
  return (
    <header>
      <img src={logoUrl} alt={logoAlt} />
      <h1>{siteName}</h1>
    </header>
  );
}
```

### Dynamic Footer

```tsx
function Footer() {
  const { 
    contactEmail, 
    contactPhone,
    socialTwitter,
    socialFacebook,
    get 
  } = useSiteConfig();
  
  return (
    <footer>
      <p>{get('footer.about.text')}</p>
      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      <a href={`tel:${contactPhone}`}>{contactPhone}</a>
      <a href={socialTwitter}>Twitter</a>
      <a href={socialFacebook}>Facebook</a>
    </footer>
  );
}
```

### SEO Component

```tsx
import { Helmet } from 'react-helmet';

function PageSEO({ title, description }: { title?: string; description?: string }) {
  const { seoTitle, seoDescription, seoKeywords, seoOgImage } = useSiteConfig();
  
  return (
    <Helmet>
      <title>{title || seoTitle}</title>
      <meta name="description" content={description || seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta property="og:image" content={seoOgImage} />
    </Helmet>
  );
}
```

## Troubleshooting

### Configuration not loading
- Check database connection
- Verify table exists: `SELECT * FROM site_config;`
- Check browser console for API errors

### Changes not appearing
- Clear browser cache
- Force refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check if config was saved successfully in admin panel

### Migration issues
- Ensure database user has CREATE TABLE permissions
- Check for conflicting table names
- Review migration logs

## Future Enhancements

Potential features for future versions:
- Image upload functionality directly in admin panel
- Multi-language support for configuration values
- Configuration versioning and rollback
- Configuration export/import
- Real-time preview of changes
- Configuration templates for different themes
- Scheduled configuration changes

## Support

For issues or questions:
- Email: contacto@hubmadridista.com
- Check application logs for detailed error messages
- Review database logs for query issues
