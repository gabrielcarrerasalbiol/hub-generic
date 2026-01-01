import { useQuery } from '@tanstack/react-query';

interface SiteConfig {
  [key: string]: any;
}

export function useSiteConfig() {
  const { data: config, isLoading, error } = useQuery<SiteConfig>({
    queryKey: ['site-config'],
    queryFn: async () => {
      const response = await fetch('/api/site-config');
      if (!response.ok) throw new Error('Failed to fetch site config');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    config: config || {},
    isLoading,
    error,
    // Helper functions
    get: (key: string, defaultValue?: any) => {
      return config?.[key] ?? defaultValue;
    },
    siteName: config?.['site.name'] || 'Hub Madridista',
    tagline: config?.['site.tagline'] || 'La plataforma definitiva para los fans del Real Madrid',
    logoUrl: config?.['site.logo.url'] || '/images/logo-hubmadridista.png',
    logoAlt: config?.['site.logo.alt'] || 'Hub Madridista Logo',
    faviconUrl: config?.['site.favicon.url'] || '/hubmadridista.png',
    primaryColor: config?.['site.colors.primary'] || '#001C58',
    secondaryColor: config?.['site.colors.secondary'] || '#FDBE11',
    accentColor: config?.['site.colors.accent'] || '#FFFFFF',
    contactEmail: config?.['contact.email'] || 'contacto@hubmadridista.com',
    contactPhone: config?.['contact.phone'] || '+34 667976076',
    socialTwitter: config?.['social.twitter.url'] || 'https://x.com/HubMadridistax',
    socialFacebook: config?.['social.facebook.url'] || 'https://www.facebook.com/hubmadridista',
    socialInstagram: config?.['social.instagram.url'] || 'https://www.instagram.com/hubmadridista',
    socialYoutube: config?.['social.youtube.url'] || 'https://www.youtube.com/hubmadridista',
    seoTitle: config?.['seo.default.title'] || 'Hub Madridista | Agregador de contenido Real Madrid',
    seoDescription: config?.['seo.default.description'] || 'Hub Madridista - La plataforma definitiva con los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    seoKeywords: config?.['seo.default.keywords'] || 'Real Madrid, fútbol, LaLiga, Champions League, videos, noticias, jugadores, análisis',
    seoOgImage: config?.['seo.og.image'] || 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
  };
}
