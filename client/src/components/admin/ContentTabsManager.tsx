import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Info, MessageSquare, MousePointerClick } from 'lucide-react';

interface ContentTabsManagerProps {
  configData: any;
  handleInputChange: (key: string, value: any) => void;
}

export default function ContentTabsManager({ configData, handleInputChange }: ContentTabsManagerProps) {
  const [contentSubTab, setContentSubTab] = useState('home');

  return (
    <Tabs value={contentSubTab} onValueChange={setContentSubTab}>
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="home" className="gap-2">
          <Home className="h-4 w-4" />
          Home
        </TabsTrigger>
        <TabsTrigger value="about" className="gap-2">
          <Info className="h-4 w-4" />
          About
        </TabsTrigger>
        <TabsTrigger value="footer" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Footer
        </TabsTrigger>
        <TabsTrigger value="cta" className="gap-2">
          <MousePointerClick className="h-4 w-4" />
          CTAs
        </TabsTrigger>
      </TabsList>

      {/* Home Page Content */}
      <TabsContent value="home">
        <Card>
          <CardHeader>
            <CardTitle>Contenido de la Página de Inicio</CardTitle>
            <CardDescription>
              Configura los textos de la página principal en Español e Inglés
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
          </CardContent>
        </Card>
      </TabsContent>

      {/* About Page Content */}
      <TabsContent value="about">
        <Card>
          <CardHeader>
            <CardTitle>Contenido de la Página "Acerca de"</CardTitle>
            <CardDescription>
              Configura misión, visión y valores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="about-mission-es">Misión (Español)</Label>
                <Textarea
                  id="about-mission-es"
                  value={configData['about.mission.es'] || ''}
                  onChange={(e) => handleInputChange('about.mission.es', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-mission-en">Mission (English)</Label>
                <Textarea
                  id="about-mission-en"
                  value={configData['about.mission.en'] || ''}
                  onChange={(e) => handleInputChange('about.mission.en', e.target.value)}
                  rows={3}
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
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-vision-en">Vision (English)</Label>
                <Textarea
                  id="about-vision-en"
                  value={configData['about.vision.en'] || ''}
                  onChange={(e) => handleInputChange('about.vision.en', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="about-values-es">Valores (Español)</Label>
                <Input
                  id="about-values-es"
                  value={configData['about.values.es'] || ''}
                  onChange={(e) => handleInputChange('about.values.es', e.target.value)}
                  placeholder="Pasión, Calidad, Comunidad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about-values-en">Values (English)</Label>
                <Input
                  id="about-values-en"
                  value={configData['about.values.en'] || ''}
                  onChange={(e) => handleInputChange('about.values.en', e.target.value)}
                  placeholder="Passion, Quality, Community"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Footer Content */}
      <TabsContent value="footer">
        <Card>
          <CardHeader>
            <CardTitle>Contenido del Footer</CardTitle>
            <CardDescription>
              Configura los textos que aparecen en el pie de página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </TabsContent>

      {/* CTAs Content */}
      <TabsContent value="cta">
        <Card>
          <CardHeader>
            <CardTitle>Botones Call-to-Action</CardTitle>
            <CardDescription>
              Configura el texto de los botones de acción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta-explore-es">Botón Explorar (Español)</Label>
                <Input
                  id="cta-explore-es"
                  value={configData['cta.explore.text.es'] || ''}
                  onChange={(e) => handleInputChange('cta.explore.text.es', e.target.value)}
                  placeholder="Explorar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta-explore-en">Explore Button (English)</Label>
                <Input
                  id="cta-explore-en"
                  value={configData['cta.explore.text.en'] || ''}
                  onChange={(e) => handleInputChange('cta.explore.text.en', e.target.value)}
                  placeholder="Explore"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
