import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Info, MessageSquare, MousePointerClick, Star, Trophy, Users } from 'lucide-react';

interface ContentTabsManagerProps {
  configData: any;
  handleInputChange: (key: string, value: any) => void;
}

export default function ContentTabsManager({ configData, handleInputChange }: ContentTabsManagerProps) {
  const [contentSubTab, setContentSubTab] = useState('home');

  return (
    <Tabs value={contentSubTab} onValueChange={setContentSubTab}>
      <TabsList className="grid w-full grid-cols-6 mb-4">
        <TabsTrigger value="home" className="gap-2">
          <Home className="h-4 w-4" />
          Home
        </TabsTrigger>
        <TabsTrigger value="about" className="gap-2">
          <Info className="h-4 w-4" />
          About
        </TabsTrigger>
        <TabsTrigger value="about-page" className="gap-2">
          <Star className="h-4 w-4" />
          Landing
        </TabsTrigger>
        <TabsTrigger value="premium" className="gap-2">
          <Trophy className="h-4 w-4" />
          Premium
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

      {/* Landing Page Content (AboutPage.tsx) */}
      <TabsContent value="about-page">
        <Card>
          <CardHeader>
            <CardTitle>Página de Aterrizaje (Landing)</CardTitle>
            <CardDescription>
              Configura el contenido del carrusel hero y secciones de la página de inicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hero Slides */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Carrusel Hero - Slides Adicionales
              </h3>

              {/* Slide 2 - Passion */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Slide 2 - La Pasión</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.hero.passion.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.passion.title.es', e.target.value)}
                      placeholder="La Pasión Blanca"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.hero.passion.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.passion.title.en', e.target.value)}
                      placeholder="The White Passion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo (ES)</Label>
                    <Input
                      value={configData['content.hero.passion.subtitle.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.passion.subtitle.es', e.target.value)}
                      placeholder="Vive cada momento con la misma intensidad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (EN)</Label>
                    <Input
                      value={configData['content.hero.passion.subtitle.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.passion.subtitle.en', e.target.value)}
                      placeholder="Experience every moment with the same intensity"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 3 - Feeling */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Slide 3 - El Sentimiento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.hero.feeling.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.feeling.title.es', e.target.value)}
                      placeholder="El Sentimiento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.hero.feeling.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.feeling.title.en', e.target.value)}
                      placeholder="The Feeling"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo (ES)</Label>
                    <Input
                      value={configData['content.hero.feeling.subtitle.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.feeling.subtitle.es', e.target.value)}
                      placeholder="Unidos por los colores que nos representan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (EN)</Label>
                    <Input
                      value={configData['content.hero.feeling.subtitle.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.feeling.subtitle.en', e.target.value)}
                      placeholder="United by the colors that represent us"
                    />
                  </div>
                </div>
              </div>

              {/* Slide 4 - Fans */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Slide 4 - La Afición</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.hero.fans.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.fans.title.es', e.target.value)}
                      placeholder="La Afición Madridista"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.hero.fans.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.fans.title.en', e.target.value)}
                      placeholder="The Madridista Fanbase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo (ES)</Label>
                    <Input
                      value={configData['content.hero.fans.subtitle.es'] || ''}
                      onChange={(e) => handleInputChange('content.hero.fans.subtitle.es', e.target.value)}
                      placeholder="El corazón que late en cada estadio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (EN)</Label>
                    <Input
                      value={configData['content.hero.fans.subtitle.en'] || ''}
                      onChange={(e) => handleInputChange('content.hero.fans.subtitle.en', e.target.value)}
                      placeholder="The heart that beats in every stadium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* What is Hub Section */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Sección "¿Qué es Madridista Hub?"</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Título (ES)</Label>
                  <Input
                    value={configData['content.about.title.es'] || ''}
                    onChange={(e) => handleInputChange('content.about.title.es', e.target.value)}
                    placeholder="¿Qué es Madridista Hub?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (EN)</Label>
                  <Input
                    value={configData['content.about.title.en'] || ''}
                    onChange={(e) => handleInputChange('content.about.title.en', e.target.value)}
                    placeholder="What is Madridista Hub?"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Descripción (ES)</Label>
                  <Textarea
                    value={configData['content.about.description.es'] || ''}
                    onChange={(e) => handleInputChange('content.about.description.es', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={configData['content.about.description.en'] || ''}
                    onChange={(e) => handleInputChange('content.about.description.en', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Características (3 cards)</h3>

              {/* Feature 1 - Curated Content */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">1. Contenido Curado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.about.features.curated.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.curated.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.about.features.curated.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.curated.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.about.features.curated.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.curated.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.about.features.curated.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.curated.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Feature 2 - Multiplatform */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">2. Multiplataforma</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.about.features.multiplatform.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.multiplatform.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.about.features.multiplatform.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.multiplatform.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.about.features.multiplatform.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.multiplatform.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.about.features.multiplatform.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.multiplatform.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Feature 3 - Notifications */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">3. Notificaciones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.about.features.notifications.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.notifications.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.about.features.notifications.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.notifications.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.about.features.notifications.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.notifications.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.about.features.notifications.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.about.features.notifications.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Testimonios</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Título de Sección (ES)</Label>
                  <Input
                    value={configData['content.testimonials.title.es'] || ''}
                    onChange={(e) => handleInputChange('content.testimonials.title.es', e.target.value)}
                    placeholder="Lo que dicen nuestros usuarios"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Title (EN)</Label>
                  <Input
                    value={configData['content.testimonials.title.en'] || ''}
                    onChange={(e) => handleInputChange('content.testimonials.title.en', e.target.value)}
                    placeholder="What our users say"
                  />
                </div>
              </div>

              {/* Testimonial 1 */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Usuario 1 - Carlos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user1.name.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.name.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user1.name.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.name.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user1.role.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.role.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user1.role.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.role.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Testimonio (ES)</Label>
                    <Textarea
                      value={configData['content.testimonials.user1.quote.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.quote.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Quote (EN)</Label>
                    <Textarea
                      value={configData['content.testimonials.user1.quote.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user1.quote.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Usuario 2 - Laura</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user2.name.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.name.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user2.name.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.name.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user2.role.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.role.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user2.role.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.role.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Testimonio (ES)</Label>
                    <Textarea
                      value={configData['content.testimonials.user2.quote.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.quote.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Quote (EN)</Label>
                    <Textarea
                      value={configData['content.testimonials.user2.quote.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user2.quote.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">Usuario 3 - Miguel</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user3.name.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.name.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user3.name.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.name.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol (ES)</Label>
                    <Input
                      value={configData['content.testimonials.user3.role.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.role.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role (EN)</Label>
                    <Input
                      value={configData['content.testimonials.user3.role.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.role.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Testimonio (ES)</Label>
                    <Textarea
                      value={configData['content.testimonials.user3.quote.es'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.quote.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Quote (EN)</Label>
                    <Textarea
                      value={configData['content.testimonials.user3.quote.en'] || ''}
                      onChange={(e) => handleInputChange('content.testimonials.user3.quote.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div>
              <h3 className="font-semibold mb-4">Sección CTA (Call to Action)</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Título (ES)</Label>
                  <Input
                    value={configData['content.cta.title.es'] || ''}
                    onChange={(e) => handleInputChange('content.cta.title.es', e.target.value)}
                    placeholder="Únete a la comunidad madridista"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (EN)</Label>
                  <Input
                    value={configData['content.cta.title.en'] || ''}
                    onChange={(e) => handleInputChange('content.cta.title.en', e.target.value)}
                    placeholder="Join the madridista community"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Descripción (ES)</Label>
                  <Textarea
                    value={configData['content.cta.description.es'] || ''}
                    onChange={(e) => handleInputChange('content.cta.description.es', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={configData['content.cta.description.en'] || ''}
                    onChange={(e) => handleInputChange('content.cta.description.en', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Botón "Ver Videos" (ES)</Label>
                  <Input
                    value={configData['content.cta.button.es'] || ''}
                    onChange={(e) => handleInputChange('content.cta.button.es', e.target.value)}
                    placeholder="Ver todos los videos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>"View Videos" Button (EN)</Label>
                  <Input
                    value={configData['content.cta.button.en'] || ''}
                    onChange={(e) => handleInputChange('content.cta.button.en', e.target.value)}
                    placeholder="View all videos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Botón "Registrar" (ES)</Label>
                  <Input
                    value={configData['content.cta.registerNow.es'] || ''}
                    onChange={(e) => handleInputChange('content.cta.registerNow.es', e.target.value)}
                    placeholder="Registrarse Ahora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>"Register" Button (EN)</Label>
                  <Input
                    value={configData['content.cta.registerNow.en'] || ''}
                    onChange={(e) => handleInputChange('content.cta.registerNow.en', e.target.value)}
                    placeholder="Register Now"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Botón "Login" (ES)</Label>
                  <Input
                    value={configData['content.cta.login.es'] || ''}
                    onChange={(e) => handleInputChange('content.cta.login.es', e.target.value)}
                    placeholder="Iniciar Sesión"
                  />
                </div>
                <div className="space-y-2">
                  <Label>"Login" Button (EN)</Label>
                  <Input
                    value={configData['content.cta.login.en'] || ''}
                    onChange={(e) => handleInputChange('content.cta.login.en', e.target.value)}
                    placeholder="Login"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Premium Benefits Content */}
      <TabsContent value="premium">
        <Card>
          <CardHeader>
            <CardTitle>Sección Premium</CardTitle>
            <CardDescription>
              Configura los beneficios y textos de la sección premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Premium Header */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Encabezado Premium</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Título (ES)</Label>
                  <Input
                    value={configData['content.premium.title.es'] || ''}
                    onChange={(e) => handleInputChange('content.premium.title.es', e.target.value)}
                    placeholder="Beneficios Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (EN)</Label>
                  <Input
                    value={configData['content.premium.title.en'] || ''}
                    onChange={(e) => handleInputChange('content.premium.title.en', e.target.value)}
                    placeholder="Premium Benefits"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Descripción (ES)</Label>
                  <Textarea
                    value={configData['content.premium.description.es'] || ''}
                    onChange={(e) => handleInputChange('content.premium.description.es', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Textarea
                    value={configData['content.premium.description.en'] || ''}
                    onChange={(e) => handleInputChange('content.premium.description.en', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Premium Benefits Cards */}
            <div className="border-b pb-6">
              <h3 className="font-semibold mb-4">Beneficios Premium (4 cards)</h3>

              {/* Benefit 1 - Exclusive Channels */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">1. Canales Exclusivos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.premium.benefits.exclusive.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.exclusive.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.premium.benefits.exclusive.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.exclusive.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.exclusive.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.exclusive.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.exclusive.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.exclusive.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Benefit 2 - No Ads */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">2. Sin Publicidad</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.premium.benefits.noAds.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.noAds.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.premium.benefits.noAds.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.noAds.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.noAds.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.noAds.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.noAds.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.noAds.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Benefit 3 - Historical Archive */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">3. Archivo Histórico</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.premium.benefits.history.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.history.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.premium.benefits.history.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.history.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.history.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.history.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.history.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.history.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Benefit 4 - Advanced Analysis */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3">4. Análisis Avanzado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título (ES)</Label>
                    <Input
                      value={configData['content.premium.benefits.analysis.title.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.analysis.title.es', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Title (EN)</Label>
                    <Input
                      value={configData['content.premium.benefits.analysis.title.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.analysis.title.en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción (ES)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.analysis.description.es'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.analysis.description.es', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={configData['content.premium.benefits.analysis.description.en'] || ''}
                      onChange={(e) => handleInputChange('content.premium.benefits.analysis.description.en', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Buttons */}
            <div>
              <h3 className="font-semibold mb-4">Botones Premium</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Botón "Hazte Premium" (ES)</Label>
                  <Input
                    value={configData['content.premium.upgrade.es'] || ''}
                    onChange={(e) => handleInputChange('content.premium.upgrade.es', e.target.value)}
                    placeholder="Hazte Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>"Go Premium" Button (EN)</Label>
                  <Input
                    value={configData['content.premium.upgrade.en'] || ''}
                    onChange={(e) => handleInputChange('content.premium.upgrade.en', e.target.value)}
                    placeholder="Upgrade to Premium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto "Ya eres Premium" (ES)</Label>
                  <Input
                    value={configData['content.premium.alreadyPremium.es'] || ''}
                    onChange={(e) => handleInputChange('content.premium.alreadyPremium.es', e.target.value)}
                    placeholder="Ya eres usuario Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>"Already Premium" Text (EN)</Label>
                  <Input
                    value={configData['content.premium.alreadyPremium.en'] || ''}
                    onChange={(e) => handleInputChange('content.premium.alreadyPremium.en', e.target.value)}
                    placeholder="Already a Premium User"
                  />
                </div>
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
