import { Helmet } from 'react-helmet';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video';
  twitterCard?: 'summary' | 'summary_large_image';
  lang?: 'es' | 'en';
  noindex?: boolean;
  structuredData?: Record<string, any>;
  videoSource?: 'youtube' | 'tiktok' | 'twitter' | 'instagram' | 'twitch' | null;
  publishDate?: string;
  duration?: string;
}

/**
 * Componente SEO optimizado para motores de búsqueda y captación de tráfico de YouTube
 * 
 * Utiliza React Helmet para gestionar todas las metaetiquetas necesarias
 * para mejorar el SEO, la compartibilidad en redes sociales y optimización para YouTube
 * 
 * @example
 * <SEO 
 *   title="Hub Madridista - Videos de Real Madrid"
 *   description="Los mejores videos y contenido del Real Madrid"
 *   keywords="Real Madrid, fútbol, LaLiga, videos, youtube"
 *   videoSource="youtube"
 * />
 */
export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  lang = 'es',
  noindex = false,
  structuredData,
  videoSource = null,
  publishDate,
  duration,
}: SEOProps) {
  // Get site configuration
  const { 
    siteName, 
    seoTitle, 
    seoDescription, 
    seoKeywords, 
    seoOgImage 
  } = useSiteConfig();
  
  // Use provided values or fallback to site config
  const finalTitle = title || seoTitle;
  const finalDescription = description || seoDescription;
  const finalKeywords = keywords || seoKeywords;
  const finalOgImage = ogImage || seoOgImage;
  // Construir URL canónica si no se proporcionó
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonical = canonicalUrl || currentUrl;
  
  // Preparar etiquetas estructuradas de Schema.org como JSON-LD
  const structuredDataJson = structuredData ? JSON.stringify(structuredData) : '';
  
  // Keywords específicos por plataforma para mejorar SEO
  let enhancedKeywords = finalKeywords;
  if (videoSource === 'youtube') {
    enhancedKeywords = `${finalKeywords}, youtube real madrid, videos youtube real madrid, canal real madrid youtube, real madrid youtube oficial, ver videos real madrid`;
  } else if (videoSource === 'tiktok') {
    enhancedKeywords = `${finalKeywords}, tiktok real madrid, videos tiktok real madrid, real madrid tiktok oficial`;
  }

  return (
    <Helmet>
      {/* Metadatos básicos */}
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={enhancedKeywords} />
      
      {/* Controlar indexación */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* URL canónica */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph para Facebook, LinkedIn, etc */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={lang === 'es' ? 'es_ES' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      
      {/* Metadatos adicionales */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="theme-color" content="#ffffff" />
      
      {/* Metadatos específicos para videos */}
      {videoSource && (
        <>
          <meta property="og:video" content={canonical} />
          <meta property="video:tag" content="Real Madrid" />
          <meta property="video:tag" content="Fútbol" />
          <meta property="video:tag" content="LaLiga" />
          {videoSource === 'youtube' && (
            <>
              <meta property="video:tag" content="YouTube" />
              <meta property="video:tag" content="Videos Real Madrid" />
            </>
          )}
          {publishDate && <meta property="video:release_date" content={publishDate} />}
          {duration && <meta property="video:duration" content={duration} />}
        </>
      )}
      
      {/* Schema.org JSON-LD datos estructurados */}
      {structuredData && (
        <script type="application/ld+json">
          {structuredDataJson}
        </script>
      )}
    </Helmet>
  );
}