/**
 * Biblioteca de funciones para generar datos estructurados Schema.org
 * para mejorar el SEO y permitir Rich Snippets en los resultados de búsqueda
 */

import { Video, Channel } from '@shared/schema';

// Datos de la organización (Real Madrid)
const realmadridOrg = {
  "@type": "SportsOrganization",
  "name": "Real Madrid Club de Fútbol",
  "url": "https://www.realmadrid.com/",
  "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
  "sameAs": [
    "https://www.facebook.com/RealMadrid/",
    "https://twitter.com/realmadrid",
    "https://www.instagram.com/realmadrid/",
    "https://www.youtube.com/realmadrid"
  ]
};

// Estructura del sitio web
export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Hub Madridista",
  "url": "https://hubmadridista.com/",
  "description": "Plataforma que reúne los mejores videos y contenido del Real Madrid de todas las fuentes en un solo lugar",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://hubmadridista.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "inLanguage": ["es", "en"]
});

// Esquema para la página de inicio
export const homePageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Hub Madridista - Videos y Contenido del Real Madrid",
  "description": "La mejor colección de videos y contenido del Real Madrid de YouTube, Twitter, Instagram y otras plataformas en un solo lugar",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Hub Madridista"
  },
  "about": realmadridOrg
});

// Esquema para un video individual
export const videoSchema = (video: Video, channel?: Channel) => {
  // Convertir duración a formato ISO 8601 (PT1H2M3S)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (secs > 0 || (hours === 0 && minutes === 0)) duration += `${secs}S`;
    
    return duration;
  };

  // Construir URLs seguros
  const videoUrl = video.externalId 
    ? `https://www.youtube.com/watch?v=${video.externalId}`
    : video.videoUrl;
    
  const thumbnailUrl = video.thumbnailUrl || 
    `https://img.youtube.com/vi/${video.externalId}/hqdefault.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || video.title,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": video.publishedAt,
    "duration": formatDuration(typeof video.duration === 'number' ? video.duration : 0),
    "embedUrl": `https://www.youtube.com/embed/${video.externalId}`,
    "contentUrl": videoUrl,
    "author": {
      "@type": "Person",
      "name": channel?.title || video.channelTitle
    },
    "publisher": channel ? {
      "@type": "Organization",
      "name": channel.title,
      "logo": {
        "@type": "ImageObject",
        "url": channel.thumbnailUrl
      }
    } : realmadridOrg,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WatchAction",
      "userInteractionCount": video.viewCount || 0
    },
    "keywords": "Real Madrid, fútbol, LaLiga, videos, Champions League"
  };
};

// Esquema para un canal
export const channelSchema = (channel: Channel) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": channel.title,
  "description": channel.description,
  "url": channel.url,
  "logo": {
    "@type": "ImageObject",
    "url": channel.thumbnailUrl
  },
  "sameAs": [
    channel.url
  ]
});

// Esquema para una categoría
export const categorySchema = (categoryName: string, description: string, videoCount: number) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": `${categoryName} - Hub Madridista`,
  "description": description,
  "numberOfItems": videoCount,
  "about": realmadridOrg
});

// Esquema para la página de encuestas
export const pollPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Encuestas sobre el Real Madrid - Hub Madridista",
  "description": "Participa en encuestas sobre el Real Madrid, sus jugadores, partidos y más",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Hub Madridista"
  },
  "about": realmadridOrg
});

// Esquema para artículo/publicación (se puede usar para resúmenes o análisis)
export const articleSchema = (title: string, description: string, publishedAt: string, authorName: string, imageUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "image": imageUrl,
  "datePublished": publishedAt,
  "author": {
    "@type": "Person",
    "name": authorName
  },
  "publisher": {
    "@type": "Organization",
    "name": "Hub Madridista",
    "logo": {
      "@type": "ImageObject",
      "url": "https://hubmadridista.com/logo.png"
    }
  },
  "about": realmadridOrg
});