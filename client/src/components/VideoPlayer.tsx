interface VideoPlayerProps {
  embedUrl: string;
  title: string;
}

export default function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
  // Make sure YouTube embeds have autoplay disabled and related videos disabled
  const formatEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/embed/')) {
      // Add parameters to YouTube embed URL
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}rel=0`;
    }
    return url;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={formatEmbedUrl(embedUrl)}
          title={title}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          style={{ maxHeight: '500px' }}
        ></iframe>
      </div>
    </div>
  );
}
