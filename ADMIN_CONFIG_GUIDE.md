# Quick Start Guide - Site Configuration

## Overview
The site configuration system allows you to customize your website's branding, content, and settings without touching any code. Everything can be managed through a user-friendly admin panel.

## Accessing the Configuration Panel

1. **Log in** to your admin account
2. Navigate to **Admin Panel** (admin icon in header or `/admin` URL)
3. Click on the **Config** tab (first tab with Settings icon)

## Configuration Sections

### 1. 🎨 Branding Tab
Customize your site's visual identity:

**Site Identity**
- **Site Name**: The name displayed in the header and page titles
- **Tagline**: Your site's slogan or description
- **Logo URL**: Path to your logo image (e.g., `/images/your-logo.png`)
- **Logo Alt Text**: Alternative text for accessibility
- **Favicon URL**: Browser tab icon

**Brand Colors**
- **Primary Color**: Main brand color (default: dark blue #001C58)
- **Secondary Color**: Accent color (default: gold #FDBE11)
- **Accent Color**: Additional color (default: white #FFFFFF)

💡 **Tip**: Use the color pickers for easy color selection!

### 2. 📝 Content Tab
Manage text content across your site:

**Home Page**
- **Hero Title**: Main headline on homepage
- **Hero Subtitle**: Secondary headline
- **Hero Description**: Brief description text

**About & Footer**
- **Footer About Text**: Description in footer
- **Mission Statement**: Your organization's mission

### 3. 📧 Social Tab
Update contact and social media information:

**Contact Info**
- **Email**: Contact email address
- **Phone**: Contact phone number

**Social Media Links**
- **Twitter/X URL**: Your Twitter profile
- **Facebook URL**: Your Facebook page
- **Instagram URL**: Your Instagram profile
- **YouTube URL**: Your YouTube channel

### 4. 🔍 SEO Tab
Optimize for search engines:

- **Default Title**: SEO title for pages
- **Default Description**: Meta description
- **Keywords**: Search keywords (comma-separated)
- **Open Graph Image**: Social media share image URL

## Making Changes

1. **Edit** any field in the configuration panel
2. Click **"Save Changes"** button (top-right or bottom)
3. **Refresh** your website to see the changes
4. Changes are **instant** and affect all pages

## Tips & Best Practices

### Images
- Use **web-optimized images** (JPG, PNG, WebP)
- Recommended logo size: **300-500px** wide
- Recommended OG image: **1200x630px**
- Store images in `/public/images/` folder

### Colors
- Test colors for **readability** (contrast)
- Use **hex color codes** (e.g., #001C58)
- Keep colors **consistent** with brand identity

### Text Content
- Keep text **concise** and clear
- Use **proper grammar** and spelling
- Test on **mobile devices**

### Social Media
- Use **complete URLs** (https://...)
- Verify links are **working**
- Keep profiles **active** and updated

## Common Tasks

### Changing the Logo
1. Go to **Branding** tab
2. Update **"Logo URL"** field with new image path
3. Update **"Logo Alt Text"** if needed
4. Click **Save Changes**

### Updating Contact Email
1. Go to **Social** tab
2. Change **"Contact Email"** field
3. Click **Save Changes**

### Changing Site Colors
1. Go to **Branding** tab
2. Click the **color boxes** next to Primary/Secondary/Accent
3. Select new colors using the **color picker**
4. Or paste **hex codes** directly (e.g., #FF0000)
5. Click **Save Changes**

### Updating SEO Information
1. Go to **SEO** tab
2. Edit **title**, **description**, and **keywords**
3. Update **OG Image** for social sharing
4. Click **Save Changes**

## Troubleshooting

### Changes Not Appearing?
- **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)
- **Clear cache** in browser settings
- Check if you clicked **"Save Changes"**

### Image Not Displaying?
- Verify **file path** is correct
- Check image is in **public folder**
- Ensure **file extension** is included (.png, .jpg)
- Test image URL in browser address bar

### Colors Not Changing?
- Use **valid hex codes** (#RRGGBB format)
- Save changes and **refresh page**
- Check browser console for errors

### Lost Configuration?
- Changes are **saved to database**
- Contact developer if data is missing
- Check **database backup**

## Safety Features

✅ **Automatic Backups**: Changes are tracked with timestamps
✅ **User Attribution**: System records who made changes
✅ **Non-Destructive**: Original values can be restored
✅ **Validation**: System prevents invalid inputs

## Need Help?

- 📧 Email: contacto@hubmadridista.com
- 📱 Phone: +34 667976076
- 📖 Full Documentation: See `SITE_CONFIG.md`
- 🐛 Technical Issues: Contact your developer

## Advanced: Adding New Settings

Want to add more customizable settings? Ask your developer to:
1. Add the field to the admin interface
2. Use it in the frontend with `useSiteConfig()` hook
3. Document it for your team

See `SITE_CONFIG.md` for developer documentation.

---

**Remember**: Always save your changes before leaving the page! 💾
