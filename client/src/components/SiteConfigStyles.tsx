import { useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';

/**
 * Component that applies site configuration colors as CSS custom properties
 * This allows the entire site to use dynamic colors from the database
 */
export default function SiteConfigStyles() {
  const { primaryColor, secondaryColor, accentColor, isLoading } = useSiteConfig();

  useEffect(() => {
    if (!isLoading && primaryColor && secondaryColor && accentColor) {
      // Set CSS custom properties on the root element
      const root = document.documentElement;
      
      root.style.setProperty('--color-primary', primaryColor);
      root.style.setProperty('--color-secondary', secondaryColor);
      root.style.setProperty('--color-accent', accentColor);
      
      // Also set common color variations
      root.style.setProperty('--color-brand-primary', primaryColor);
      root.style.setProperty('--color-brand-secondary', secondaryColor);
      root.style.setProperty('--color-brand-accent', accentColor);
      
      console.log('🎨 Site colors applied:', { primaryColor, secondaryColor, accentColor });
    }
  }, [primaryColor, secondaryColor, accentColor, isLoading]);

  // This component doesn't render anything
  return null;
}
