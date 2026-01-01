import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Upload, Palette, FileText, Globe, Mail, Loader2, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SiteConfigItem {
  id: number;
  key: string;
  value: string | null;
  type: 'text' | 'json' | 'image' | 'boolean' | 'number';
  category: string;
  description: string | null;
  updatedAt: Date;
  updatedById: number | null;
}

interface ConfigFormData {
  [key: string]: any;
}

export default function SiteConfigManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('branding');
  const [configData, setConfigData] = useState<ConfigFormData>({
    // Branding
    'site.name': 'Hub Madridista',
    'site.tagline': 'La plataforma definitiva para los fans del Real Madrid',
    'site.logo.url': '/images/logo-hubmadridista.png',
    'site.logo.alt': 'Hub Madridista Logo',
    'site.favicon.url': '/hubmadridista.png',
    'site.colors.primary': '#001C58',
    'site.colors.secondary': '#FDBE11',
    'site.colors.accent': '#FFFFFF',
    
    // Content - Spanish
    'home.hero.title.es': 'Hub Madridista',
    'home.hero.title.en': 'Hub Madridista',
    'home.hero.subtitle.es': 'Tu portal definitivo de contenido del Real Madrid',
    'home.hero.subtitle.en': 'Your ultimate Real Madrid content portal',
    'home.hero.description.es': 'Descubre los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    'home.hero.description.en': 'Discover the best Real Madrid videos and content from all platforms in one place',
    
    // Banners
    'banner.announcement.enabled': 'false',
    'banner.announcement.text.es': '',
    'banner.announcement.text.en': '',
    'banner.announcement.link': '',
    'banner.announcement.color': '#FDBE11',
    
    'banner.promotion.enabled': 'false',
    'banner.promotion.title.es': '',
    'banner.promotion.title.en': '',
    'banner.promotion.description.es': '',
    'banner.promotion.description.en': '',
    'banner.promotion.image': '',
    'banner.promotion.cta.text.es': 'Más información',
    'banner.promotion.cta.text.en': 'Learn more',
    'banner.promotion.cta.link': '',
    
    // Footer Content
    'footer.about.text.es': 'Hub Madridista es la plataforma líder para aficionados del Real Madrid, ofreciendo contenido multimedia de calidad.',
    'footer.about.text.en': 'Hub Madridista is the leading platform for Real Madrid fans, offering quality multimedia content.',
    'footer.copyright.es': '© 2025 Hub Madridista. Todos los derechos reservados.',
    'footer.copyright.en': '© 2025 Hub Madridista. All rights reserved.',
    
    // About Page
    'about.mission.es': 'Conectar a los madridistas de todo el mundo con el mejor contenido del club',
    'about.mission.en': 'Connecting madridistas worldwide with the best club content',
    'about.vision.es': 'Ser la plataforma de referencia para fans del Real Madrid',
    'about.vision.en': 'To be the reference platform for Real Madrid fans',
    'about.values.es': 'Pasión, Calidad, Comunidad',
    'about.values.en': 'Passion, Quality, Community',
    
    // Call to Actions
    'cta.register.text.es': 'Únete Ahora',
    'cta.register.text.en': 'Join Now',
    'cta.premium.text.es': 'Hazte Premium',
    'cta.premium.text.en': 'Go Premium',
    'cta.explore.text.es': 'Explorar',
    'cta.explore.text.en': 'Explore',
    
    // Contact & Social
    'contact.email': 'contacto@hubmadridista.com',
    'contact.phone': '+34 667976076',
    'social.twitter.url': 'https://x.com/HubMadridistax',
    'social.facebook.url': 'https://www.facebook.com/hubmadridista',
    'social.instagram.url': 'https://www.instagram.com/hubmadridista',
    'social.youtube.url': 'https://www.youtube.com/hubmadridista',
    
    // SEO
    'seo.default.title': 'Hub Madridista | Agregador de contenido Real Madrid',
    'seo.default.description': 'Hub Madridista - La plataforma definitiva con los mejores videos y contenido del Real Madrid de todas las plataformas en un solo lugar',
    'seo.default.keywords': 'Real Madrid, fútbol, LaLiga, Champions League, videos, noticias, jugadores, análisis',
    'seo.og.image': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
  });

  // Fetch existing configs
  const { data: existingConfigs, isLoading } = useQuery<SiteConfigItem[]>({
    queryKey: ['admin', 'site-config'],
    queryFn: async () => {
      const response = await fetch('/api/admin/site-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hubmadridista_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch configs');
      return response.json();
    },
  });

  // Load existing configs into form
  useEffect(() => {
    if (existingConfigs && existingConfigs.length > 0) {
      const loadedData: ConfigFormData = { ...configData };
      existingConfigs.forEach(config => {
        loadedData[config.key] = config.value;
      });
      setConfigData(loadedData);
    }
  }, [existingConfigs]);

  // Bulk save mutation
  const saveMutation = useMutation({
    mutationFn: async (configs: ConfigFormData) => {
      const configArray = Object.entries(configs).map(([key, value]) => {
        // Determine type and category from key
        let type: SiteConfigItem['type'] = 'text';
        let category = 'general';
        
        if (key.includes('.colors.') || key.includes('.url')) {
          type = 'text';
        }
        if (key.startsWith('site.')) {
          if (key.includes('.colors.')) category = 'branding';
          else if (key.includes('.logo.') || key.includes('.favicon.')) category = 'branding';
          else category = 'branding';
        } else if (key.startsWith('home.') || key.startsWith('about.') || key.startsWith('footer.')) {
          category = 'content';
        } else if (key.startsWith('contact.') || key.startsWith('social.')) {
          category = 'social';
        } else if (key.startsWith('seo.')) {
          category = 'seo';
        }
        
        return {
          key,
          value,
          type,
          category,
          description: key,
        };
      });

      const response = await fetch('/api/admin/site-config/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hubmadridista_token')}`
        },
        body: JSON.stringify({ configs: configArray }),
      });
      
      if (!response.ok) throw new Error('Failed to save configurations');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-config'] });
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
      console.error('Error saving config:', error);
    },
  });

  const handleInputChange = (key: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(configData);
  };

  const handleImageUpload = async (key: string, file: File) => {
    // TODO: Implement actual file upload to server
    // For now, we'll use a placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(key, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración del Sitio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personaliza logos, textos, colores y contenido del sitio
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Mail className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identidad de Marca</CardTitle>
              <CardDescription>
                Configura el nombre, logo y colores del sitio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Nombre del Sitio</Label>
                  <Input
                    id="site-name"
                    value={configData['site.name'] || ''}
                    onChange={(e) => handleInputChange('site.name', e.target.value)}
                    placeholder="Hub Madridista"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-tagline">Eslogan</Label>
                  <Input
                    id="site-tagline"
                    value={configData['site.tagline'] || ''}
                    onChange={(e) => handleInputChange('site.tagline', e.target.value)}
                    placeholder="La plataforma definitiva para los fans del Real Madrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-url">URL del Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-url"
                      value={configData['site.logo.url'] || ''}
                      onChange={(e) => handleInputChange('site.logo.url', e.target.value)}
                      placeholder="/images/logo-hubmadridista.png"
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {configData['site.logo.url'] && (
                    <div className="mt-2">
                      <img 
                        src={configData['site.logo.url']} 
                        alt="Logo preview" 
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-alt">Texto alternativo del Logo</Label>
                  <Input
                    id="logo-alt"
                    value={configData['site.logo.alt'] || ''}
                    onChange={(e) => handleInputChange('site.logo.alt', e.target.value)}
                    placeholder="Hub Madridista Logo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon-url">URL del Favicon</Label>
                  <Input
                    id="favicon-url"
                    value={configData['site.favicon.url'] || ''}
                    onChange={(e) => handleInputChange('site.favicon.url', e.target.value)}
                    placeholder="/hubmadridista.png"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-primary">Color Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color-primary"
                        type="color"
                        value={configData['site.colors.primary'] || '#001C58'}
                        onChange={(e) => handleInputChange('site.colors.primary', e.target.value)}
                        className="h-10 w-20"
                      />
                      <Input
                        value={configData['site.colors.primary'] || '#001C58'}
                        onChange={(e) => handleInputChange('site.colors.primary', e.target.value)}
                        placeholder="#001C58"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-secondary">Color Secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color-secondary"
                        type="color"
                        value={configData['site.colors.secondary'] || '#FDBE11'}
                        onChange={(e) => handleInputChange('site.colors.secondary', e.target.value)}
                        className="h-10 w-20"
                      />
                      <Input
                        value={configData['site.colors.secondary'] || '#FDBE11'}
                        onChange={(e) => handleInputChange('site.colors.secondary', e.target.value)}
                        placeholder="#FDBE11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-accent">Color de Acento</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color-accent"
                        type="color"
                        value={configData['site.colors.accent'] || '#FFFFFF'}
                        onChange={(e) => handleInputChange('site.colors.accent', e.target.value)}
                        className="h-10 w-20"
                      />
                      <Input
                        value={configData['site.colors.accent'] || '#FFFFFF'}
                        onChange={(e) => handleInputChange('site.colors.accent', e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Sitio (Multi-idioma)</CardTitle>
              <CardDescription>
                Configura los textos en Español e Inglés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Section */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-4">Sección Hero</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title-es">Título (Español)</Label>
                      <Input
                        id="hero-title-es"
                        value={configData['home.hero.title.es'] || ''}
                        onChange={(e) => handleInputChange('home.hero.title.es', e.target.value)}
                        placeholder="Hub Madridista"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-title-en">Title (English)</Label>
                      <Input
                        id="hero-title-en"
                        value={configData['home.hero.title.en'] || ''}
                        onChange={(e) => handleInputChange('home.hero.title.en', e.target.value)}
                        placeholder="Hub Madridista"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle-es">Subtítulo (Español)</Label>
                      <Input
                        id="hero-subtitle-es"
                        value={configData['home.hero.subtitle.es'] || ''}
                        onChange={(e) => handleInputChange('home.hero.subtitle.es', e.target.value)}
                        placeholder="Tu portal definitivo..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle-en">Subtitle (English)</Label>
                      <Input
                        id="hero-subtitle-en"
                        value={configData['home.hero.subtitle.en'] || ''}
                        onChange={(e) => handleInputChange('home.hero.subtitle.en', e.target.value)}
                        placeholder="Your ultimate portal..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-description-es">Descripción (Español)</Label>
                      <Textarea
                        id="hero-description-es"
                        value={configData['home.hero.description.es'] || ''}
                        onChange={(e) => handleInputChange('home.hero.description.es', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-description-en">Description (English)</Label>
                      <Textarea
                        id="hero-description-en"
                        value={configData['home.hero.description.en'] || ''}
                        onChange={(e) => handleInputChange('home.hero.description.en', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Content */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-4">Footer</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-about-es">Texto Acerca de (Español)</Label>
                      <Textarea
                        id="footer-about-es"
                        value={configData['footer.about.text.es'] || ''}
                        onChange={(e) => handleInputChange('footer.about.text.es', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-about-en">About Text (English)</Label>
                      <Textarea
                        id="footer-about-en"
                        value={configData['footer.about.text.en'] || ''}
                        onChange={(e) => handleInputChange('footer.about.text.en', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-copyright-es">Copyright (Español)</Label>
                      <Input
                        id="footer-copyright-es"
                        value={configData['footer.copyright.es'] || ''}
                        onChange={(e) => handleInputChange('footer.copyright.es', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-copyright-en">Copyright (English)</Label>
                      <Input
                        id="footer-copyright-en"
                        value={configData['footer.copyright.en'] || ''}
                        onChange={(e) => handleInputChange('footer.copyright.en', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-4">Botones Call-to-Action</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-register-es">Botón Registro (Español)</Label>
                      <Input
                        id="cta-register-es"
                        value={configData['cta.register.text.es'] || ''}
                        onChange={(e) => handleInputChange('cta.register.text.es', e.target.value)}
                        placeholder="Únete Ahora"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-register-en">Register Button (English)</Label>
                      <Input
                        id="cta-register-en"
                        value={configData['cta.register.text.en'] || ''}
                        onChange={(e) => handleInputChange('cta.register.text.en', e.target.value)}
                        placeholder="Join Now"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-premium-es">Botón Premium (Español)</Label>
                      <Input
                        id="cta-premium-es"
                        value={configData['cta.premium.text.es'] || ''}
                        onChange={(e) => handleInputChange('cta.premium.text.es', e.target.value)}
                        placeholder="Hazte Premium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-premium-en">Premium Button (English)</Label>
                      <Input
                        id="cta-premium-en"
                        value={configData['cta.premium.text.en'] || ''}
                        onChange={(e) => handleInputChange('cta.premium.text.en', e.target.value)}
                        placeholder="Go Premium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* About Page */}
              <div>
                <h3 className="font-semibold mb-4">Página Acerca de</h3>
                
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="about-mission-es">Misión (Español)</Label>
                      <Textarea
                        id="about-mission-es"
                        value={configData['about.mission.es'] || ''}
                        onChange={(e) => handleInputChange('about.mission.es', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about-mission-en">Mission (English)</Label>
                      <Textarea
                        id="about-mission-en"
                        value={configData['about.mission.en'] || ''}
                        onChange={(e) => handleInputChange('about.mission.en', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="about-vision-es">Visión (Español)</Label>
                      <Textarea
                        id="about-vision-es"
                        value={configData['about.vision.es'] || ''}
                        onChange={(e) => handleInputChange('about.vision.es', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about-vision-en">Vision (English)</Label>
                      <Textarea
                        id="about-vision-en"
                        value={configData['about.vision.en'] || ''}
                        onChange={(e) => handleInputChange('about.vision.en', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banner de Anuncio</CardTitle>
              <CardDescription>
                Banner superior para anuncios importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="announcement-enabled"
                  checked={configData['banner.announcement.enabled'] === 'true'}
                  onCheckedChange={(checked) => handleInputChange('banner.announcement.enabled', String(checked))}
                />
                <Label htmlFor="announcement-enabled">Activar Banner de Anuncio</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-text-es">Texto del Anuncio (Español)</Label>
                  <Input
                    id="announcement-text-es"
                    value={configData['banner.announcement.text.es'] || ''}
                    onChange={(e) => handleInputChange('banner.announcement.text.es', e.target.value)}
                    placeholder="¡Nuevo contenido disponible!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-text-en">Announcement Text (English)</Label>
                  <Input
                    id="announcement-text-en"
                    value={configData['banner.announcement.text.en'] || ''}
                    onChange={(e) => handleInputChange('banner.announcement.text.en', e.target.value)}
                    placeholder="New content available!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-link">Enlace del Banner</Label>
                  <Input
                    id="announcement-link"
                    value={configData['banner.announcement.link'] || ''}
                    onChange={(e) => handleInputChange('banner.announcement.link', e.target.value)}
                    placeholder="/premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-color">Color de Fondo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={configData['banner.announcement.color'] || '#FDBE11'}
                      onChange={(e) => handleInputChange('banner.announcement.color', e.target.value)}
                      className="h-10 w-20"
                    />
                    <Input
                      value={configData['banner.announcement.color'] || '#FDBE11'}
                      onChange={(e) => handleInputChange('banner.announcement.color', e.target.value)}
                      placeholder="#FDBE11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Promocional</CardTitle>
              <CardDescription>
                Banner grande para promociones especiales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="promotion-enabled"
                  checked={configData['banner.promotion.enabled'] === 'true'}
                  onCheckedChange={(checked) => handleInputChange('banner.promotion.enabled', String(checked))}
                />
                <Label htmlFor="promotion-enabled">Activar Banner Promocional</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion-title-es">Título (Español)</Label>
                  <Input
                    id="promotion-title-es"
                    value={configData['banner.promotion.title.es'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.title.es', e.target.value)}
                    placeholder="¡Oferta Especial!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotion-title-en">Title (English)</Label>
                  <Input
                    id="promotion-title-en"
                    value={configData['banner.promotion.title.en'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.title.en', e.target.value)}
                    placeholder="Special Offer!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion-description-es">Descripción (Español)</Label>
                  <Textarea
                    id="promotion-description-es"
                    value={configData['banner.promotion.description.es'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.description.es', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotion-description-en">Description (English)</Label>
                  <Textarea
                    id="promotion-description-en"
                    value={configData['banner.promotion.description.en'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.description.en', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion-image">URL de Imagen</Label>
                <Input
                  id="promotion-image"
                  value={configData['banner.promotion.image'] || ''}
                  onChange={(e) => handleInputChange('banner.promotion.image', e.target.value)}
                  placeholder="/images/promo-banner.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="promotion-cta-es">Texto del Botón (Español)</Label>
                  <Input
                    id="promotion-cta-es"
                    value={configData['banner.promotion.cta.text.es'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.cta.text.es', e.target.value)}
                    placeholder="Más información"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promotion-cta-en">Button Text (English)</Label>
                  <Input
                    id="promotion-cta-en"
                    value={configData['banner.promotion.cta.text.en'] || ''}
                    onChange={(e) => handleInputChange('banner.promotion.cta.text.en', e.target.value)}
                    placeholder="Learn more"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promotion-cta-link">Enlace del Botón</Label>
                <Input
                  id="promotion-cta-link"
                  value={configData['banner.promotion.cta.link'] || ''}
                  onChange={(e) => handleInputChange('banner.promotion.cta.link', e.target.value)}
                  placeholder="/premium"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacto y Redes Sociales</CardTitle>
              <CardDescription>
                Configura la información de contacto y enlaces sociales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contacto</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={configData['contact.email'] || ''}
                  onChange={(e) => handleInputChange('contact.email', e.target.value)}
                  placeholder="contacto@hubmadridista.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Teléfono de Contacto</Label>
                <Input
                  id="contact-phone"
                  value={configData['contact.phone'] || ''}
                  onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                  placeholder="+34 667976076"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter-url">Twitter/X URL</Label>
                <Input
                  id="twitter-url"
                  value={configData['social.twitter.url'] || ''}
                  onChange={(e) => handleInputChange('social.twitter.url', e.target.value)}
                  placeholder="https://x.com/HubMadridistax"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook URL</Label>
                <Input
                  id="facebook-url"
                  value={configData['social.facebook.url'] || ''}
                  onChange={(e) => handleInputChange('social.facebook.url', e.target.value)}
                  placeholder="https://www.facebook.com/hubmadridista"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input
                  id="instagram-url"
                  value={configData['social.instagram.url'] || ''}
                  onChange={(e) => handleInputChange('social.instagram.url', e.target.value)}
                  placeholder="https://www.instagram.com/hubmadridista"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input
                  id="youtube-url"
                  value={configData['social.youtube.url'] || ''}
                  onChange={(e) => handleInputChange('social.youtube.url', e.target.value)}
                  placeholder="https://www.youtube.com/hubmadridista"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO y Metadatos</CardTitle>
              <CardDescription>
                Configura los metadatos para optimización de motores de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Título por Defecto</Label>
                <Input
                  id="seo-title"
                  value={configData['seo.default.title'] || ''}
                  onChange={(e) => handleInputChange('seo.default.title', e.target.value)}
                  placeholder="Hub Madridista | Agregador de contenido Real Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Descripción por Defecto</Label>
                <Textarea
                  id="seo-description"
                  value={configData['seo.default.description'] || ''}
                  onChange={(e) => handleInputChange('seo.default.description', e.target.value)}
                  placeholder="Hub Madridista - La plataforma definitiva con los mejores videos y contenido del Real Madrid"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Palabras Clave</Label>
                <Textarea
                  id="seo-keywords"
                  value={configData['seo.default.keywords'] || ''}
                  onChange={(e) => handleInputChange('seo.default.keywords', e.target.value)}
                  placeholder="Real Madrid, fútbol, LaLiga, Champions League, videos, noticias"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-og-image">Imagen Open Graph (URL)</Label>
                <Input
                  id="seo-og-image"
                  value={configData['seo.og.image'] || ''}
                  onChange={(e) => handleInputChange('seo.og.image', e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
                {configData['seo.og.image'] && (
                  <div className="mt-2">
                    <img 
                      src={configData['seo.og.image']} 
                      alt="OG Image preview" 
                      className="h-32 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          size="lg"
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Toda la Configuración
        </Button>
      </div>
    </div>
  );
}
