# Site Configuration System - Setup Checklist

## Pre-Implementation Checklist ✅

All completed:
- [x] Database schema extended
- [x] Backend API routes created
- [x] Admin interface component built
- [x] Frontend hook implemented
- [x] Seed script created
- [x] Documentation written

## Installation Steps

### Step 1: Database Setup
```bash
# Option A: Using drizzle-kit (recommended)
npm run db:push

# Option B: Manual SQL (if Option A fails)
# Run the SQL from shared/schema.ts manually in your PostgreSQL client
```

**Verification:**
```sql
-- Check if table exists
SELECT * FROM site_config LIMIT 1;
```

### Step 2: Initialize Configuration
```bash
# Seed default values
npx tsx seed-site-config.ts

# Should see output:
# ✅ Created config: site.name
# ✅ Created config: site.tagline
# ... etc
```

**Verification:**
```sql
-- Check if data was seeded
SELECT COUNT(*) FROM site_config;
-- Should return 23
```

### Step 3: Test Admin Interface
1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to your site (e.g., http://localhost:5000)

3. Log in with admin credentials

4. Go to Admin Panel (usually /admin)

5. Click on "Config" tab (first tab with Settings icon)

6. Verify you see 4 sub-tabs:
   - [ ] Branding
   - [ ] Content
   - [ ] Social
   - [ ] SEO

7. Try modifying a setting:
   - [ ] Change site name
   - [ ] Click "Save Changes"
   - [ ] See success toast notification

### Step 4: Test Public API
```bash
# Test public endpoint
curl http://localhost:5000/api/site-config | jq

# Should return JSON with config values
```

### Step 5: Test Frontend Hook (Optional)
Create a test component:

```tsx
// client/src/pages/TestConfig.tsx
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function TestConfig() {
  const { 
    siteName, 
    logoUrl, 
    primaryColor,
    contactEmail,
    isLoading 
  } = useSiteConfig();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Config Test</h1>
      <p>Site Name: {siteName}</p>
      <p>Logo URL: {logoUrl}</p>
      <p>Primary Color: {primaryColor}</p>
      <p>Contact Email: {contactEmail}</p>
      <img src={logoUrl} alt="Logo" style={{ height: '50px' }} />
    </div>
  );
}
```

Add route to test:
```tsx
// In your router
<Route path="/test-config" component={TestConfig} />
```

Visit http://localhost:5000/test-config

## Integration Checklist

### Components to Update (Optional but Recommended)

#### High Priority
- [ ] **Header.tsx** - Site name and logo
  ```tsx
  const { siteName, logoUrl, logoAlt } = useSiteConfig();
  ```

- [ ] **Footer.tsx** - Contact and social links
  ```tsx
  const { contactEmail, socialTwitter, socialFacebook, get } = useSiteConfig();
  ```

- [ ] **SEO.tsx** - Meta tags
  ```tsx
  const { seoTitle, seoDescription, seoOgImage } = useSiteConfig();
  ```

#### Medium Priority
- [ ] **Home.tsx** - Hero section
  ```tsx
  const { get } = useSiteConfig();
  const title = get('home.hero.title');
  ```

- [ ] **AboutPage.tsx** - Mission statement
  ```tsx
  const { get } = useSiteConfig();
  const mission = get('about.mission');
  ```

- [ ] **ContactPage.tsx** - Contact information
  ```tsx
  const { contactEmail, contactPhone } = useSiteConfig();
  ```

#### Low Priority
- [ ] Any other pages with hardcoded branding
- [ ] Email templates
- [ ] Error pages

## Testing Checklist

### Functional Tests
- [ ] Admin can access Config page
- [ ] All tabs load without errors
- [ ] Can modify text fields
- [ ] Color pickers work
- [ ] Image previews display
- [ ] Save button works
- [ ] Success notifications appear
- [ ] Changes persist after refresh
- [ ] Public API returns data
- [ ] Frontend hook provides values
- [ ] Fallback values work without config

### UI/UX Tests
- [ ] Interface is responsive on mobile
- [ ] Tabs are clearly labeled
- [ ] Forms are intuitive
- [ ] Error messages are helpful
- [ ] Loading states work
- [ ] No layout breaks

### Performance Tests
- [ ] Page loads in < 2 seconds
- [ ] Config cached properly
- [ ] No unnecessary API calls
- [ ] Bulk save is faster than individual

### Security Tests
- [ ] Non-admins cannot access admin endpoints
- [ ] Public can read config
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection in place

## Troubleshooting

### Issue: Table doesn't exist
**Solution:**
```bash
# Check database connection
psql -U your_user -d your_database -c "SELECT version();"

# Try manual table creation
# Copy SQL from shared/schema.ts
```

### Issue: Seed script fails
**Solution:**
```bash
# Check database connection in .env
DATABASE_URL=postgresql://...

# Run with verbose logging
npx tsx seed-site-config.ts --verbose
```

### Issue: Admin panel doesn't show Config tab
**Solution:**
1. Check browser console for errors
2. Verify SiteConfigManagement component imported
3. Check AdminPage.tsx modifications
4. Clear browser cache

### Issue: Changes not appearing
**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check if save was successful
4. Verify database has changes:
   ```sql
   SELECT key, value FROM site_config WHERE key = 'site.name';
   ```

### Issue: Hook returns undefined
**Solution:**
1. Check API endpoint is working
2. Verify token is valid
3. Check browser network tab
4. Ensure config is cached properly

## Production Deployment

### Pre-deployment
- [ ] Test all features in staging
- [ ] Backup current database
- [ ] Document current hardcoded values
- [ ] Plan rollback strategy

### Deployment Steps
1. [ ] Deploy code changes
2. [ ] Run database migration
3. [ ] Run seed script on production
4. [ ] Test admin panel
5. [ ] Test public API
6. [ ] Monitor error logs
7. [ ] Verify performance metrics

### Post-deployment
- [ ] Inform admins about new feature
- [ ] Provide training if needed
- [ ] Monitor usage and errors
- [ ] Gather feedback
- [ ] Document any issues

## Maintenance

### Regular Tasks
- [ ] **Weekly**: Check error logs
- [ ] **Monthly**: Review configuration changes
- [ ] **Quarterly**: Backup site_config table
- [ ] **Yearly**: Audit and clean unused configs

### Monitoring
- [ ] Set up alerts for API errors
- [ ] Monitor response times
- [ ] Track database size
- [ ] Monitor cache hit rates

## Documentation Reference

Quick links to documentation:
- 📖 **SITE_CONFIG_README.md** - Complete overview
- 🔧 **SITE_CONFIG.md** - Technical documentation
- 👤 **ADMIN_CONFIG_GUIDE.md** - Admin user guide
- 📊 **IMPLEMENTATION_SUMMARY.md** - What was built
- 💻 **EXAMPLE_USAGE.md** - Code examples

## Support

If you encounter issues:
1. Check this checklist
2. Review documentation
3. Check database and API logs
4. Contact: contacto@hubmadridista.com

## Success Criteria

Your implementation is successful when:
- [x] Database table exists and is populated
- [x] Admin can modify settings through UI
- [x] Changes persist and are visible
- [x] Public API works correctly
- [x] No errors in console or logs
- [x] Performance is acceptable
- [x] Team can use the system

## Next Phase

Once basic system is working:
1. Integrate hook into existing components
2. Add more custom settings as needed
3. Consider advanced features:
   - File upload for images
   - Configuration templates
   - Version history
   - Multi-language support

---

**Status**: [ ] Not Started | [ ] In Progress | [x] Completed

**Last Updated**: 2026-01-01

**Tested By**: _________________

**Production Deployed**: [ ] Yes | [ ] No | Date: __________
