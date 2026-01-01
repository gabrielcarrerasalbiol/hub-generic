# Example: Updating Footer Component with Site Config

This example shows how to update the Footer component to use dynamic configuration instead of hardcoded values.

## Before (Hardcoded)

```tsx
// client/src/components/Footer.tsx
export default function Footer() {
  return (
    <footer>
      <div>
        <img 
          src="/images/logo-hubmadridista.png" 
          alt="Hub Madridista Logo" 
        />
        <p>Hub Madridista es la plataforma líder...</p>
      </div>
      <div>
        <a href="mailto:contacto@hubmadridista.com">
          contacto@hubmadridista.com
        </a>
        <a href="https://x.com/HubMadridistax">Twitter</a>
        <a href="https://www.facebook.com/hubmadridista">Facebook</a>
      </div>
    </footer>
  );
}
```

## After (Dynamic)

```tsx
// client/src/components/Footer.tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Footer() {
  const { 
    logoUrl, 
    logoAlt, 
    contactEmail, 
    socialTwitter,
    socialFacebook,
    socialInstagram,
    socialYoutube,
    get 
  } = useSiteConfig();

  return (
    <footer>
      <div>
        <img 
          src={logoUrl} 
          alt={logoAlt} 
        />
        <p>{get('footer.about.text')}</p>
      </div>
      <div>
        <a href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
        <a href={socialTwitter}>Twitter</a>
        <a href={socialFacebook}>Facebook</a>
        <a href={socialInstagram}>Instagram</a>
        <a href={socialYoutube}>YouTube</a>
      </div>
    </footer>
  );
}
```

## Benefits of This Change

1. ✅ **Admin can now change**:
   - Footer logo without touching code
   - About text without redeploying
   - Social media links from admin panel
   - Contact email instantly

2. ✅ **Falls back to defaults** if config not loaded
3. ✅ **Type-safe** with TypeScript
4. ✅ **Cached** for performance (5-minute cache)

## Other Components to Update

### Header Component
```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function Header() {
  const { logoUrl, logoAlt, siteName } = useSiteConfig();
  
  return (
    <header>
      <Link href="/">
        <img src={logoUrl} alt={logoAlt} title={siteName} />
      </Link>
      {/* rest of header */}
    </header>
  );
}
```

### SEO Component
```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Helmet } from 'react-helmet';

export default function SEO({ title, description }: Props) {
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

### Home Page Hero
```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function HomePage() {
  const { get } = useSiteConfig();
  
  return (
    <div className="hero">
      <h1>{get('home.hero.title')}</h1>
      <h2>{get('home.hero.subtitle')}</h2>
      <p>{get('home.hero.description')}</p>
    </div>
  );
}
```

### Contact Page
```tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function ContactPage() {
  const { contactEmail, contactPhone } = useSiteConfig();
  
  return (
    <div>
      <h1>Contact Us</h1>
      <p>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
      <p>Phone: <a href={`tel:${contactPhone}`}>{contactPhone}</a></p>
    </div>
  );
}
```

## Migration Checklist

- [ ] Import `useSiteConfig` hook
- [ ] Replace hardcoded logo URLs with `logoUrl`
- [ ] Replace site name with `siteName`
- [ ] Replace social links with `socialTwitter`, `socialFacebook`, etc.
- [ ] Replace contact info with `contactEmail`, `contactPhone`
- [ ] Replace text content with `get('key.name')`
- [ ] Test component renders correctly
- [ ] Verify fallback values work
- [ ] Check mobile responsive

## Testing Your Changes

1. **Without config** (should use defaults):
   ```bash
   # Don't run seed script
   npm run dev
   # Should see default values
   ```

2. **With config** (should use database values):
   ```bash
   # Run seed script
   npx tsx seed-site-config.ts
   npm run dev
   # Should see default values from database
   ```

3. **Modified config** (should use admin changes):
   ```bash
   # Change values in admin panel
   # Refresh page
   # Should see your custom values
   ```

## Performance Considerations

The `useSiteConfig` hook is optimized for performance:

- ✅ **Cached** for 5 minutes (configurable)
- ✅ **Single request** per cache period
- ✅ **No refetch** on window focus
- ✅ **Shared** across all components
- ✅ **Lazy loaded** (only when used)

## Error Handling

The hook gracefully handles errors:

```tsx
const { config, isLoading, error } = useSiteConfig();

if (isLoading) {
  return <div>Loading...</div>;
}

if (error) {
  console.error('Config error:', error);
  // Still uses default values
}

// Use config normally
```

## Best Practices

1. **Always provide fallbacks**:
   ```tsx
   const { get } = useSiteConfig();
   const title = get('custom.title', 'Default Title');
   ```

2. **Use semantic helper properties** when available:
   ```tsx
   const { siteName } = useSiteConfig(); // ✅ Good
   const siteName = get('site.name'); // ❌ Less readable
   ```

3. **Don't overuse `get()`**:
   ```tsx
   // ✅ Good - one call per component
   const { siteName, logoUrl, contactEmail } = useSiteConfig();
   
   // ❌ Bad - multiple hook calls
   const siteName = useSiteConfig().siteName;
   const logoUrl = useSiteConfig().logoUrl;
   ```

4. **Cache appropriately**:
   ```tsx
   // Hook already caches for 5 minutes
   // Don't add extra caching layers
   ```

## Need More Config Options?

To add new configuration options:

1. **Add to admin panel** (`SiteConfigManagement.tsx`)
2. **Add to hook** (`useSiteConfig.ts`) as helper property
3. **Add to seed script** (`seed-site-config.ts`)
4. **Document** in `SITE_CONFIG.md`

See full documentation in `SITE_CONFIG.md` for details.
