import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun, Globe, Lock, Volume2, Mail, Play, LayoutGrid, TrendingUp } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Configuraciones de la aplicación (podrían guardarse en el perfil del usuario o localStorage)
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailNotifications: true,
    language: 'es',
    autoplayVideos: true,
    showTrending: true,
    privacyMode: false,
    soundEffects: true
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
    
    toast({
      title: "Configuración actualizada",
      description: `La configuración ha sido guardada correctamente`,
    });
    
    // Aquí se podría implementar la lógica para guardar en backend o localStorage
  };

  return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="mr-2 h-5 w-5 text-yellow-500" />
                <span>Tema y Apariencia</span>
              </CardTitle>
              <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-slate-500" />
                  <span>Modo oscuro</span>
                </div>
                <Switch 
                  checked={settings.darkMode} 
                  onCheckedChange={() => handleToggle('darkMode')} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-blue-500" />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>Configura cómo y cuándo recibes notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-slate-500" />
                  <span>Notificaciones en la aplicación</span>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={() => handleToggle('notifications')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Notificaciones por email</span>
                </div>
                <Switch 
                  checked={settings.emailNotifications} 
                  onCheckedChange={() => handleToggle('emailNotifications')} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Idioma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-green-500" />
                <span>Idioma y Región</span>
              </CardTitle>
              <CardDescription>Configura tus preferencias de idioma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={settings.language === 'es' ? "default" : "outline"}
                  onClick={() => {
                    setSettings({...settings, language: 'es'});
                    toast({
                      title: "Idioma actualizado",
                      description: "El idioma se ha cambiado a Español",
                    });
                  }}
                  className="w-full"
                >
                  Español
                </Button>
                <Button 
                  variant={settings.language === 'en' ? "default" : "outline"}
                  onClick={() => {
                    setSettings({...settings, language: 'en'});
                    toast({
                      title: "Idioma actualizado",
                      description: "El idioma se ha cambiado a Inglés",
                    });
                  }}
                  className="w-full"
                >
                  English
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Reproducción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5 text-red-500" />
                <span>Reproducción</span>
              </CardTitle>
              <CardDescription>Configura cómo se reproducen los videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-slate-500" />
                  <span>Reproducción automática</span>
                </div>
                <Switch 
                  checked={settings.autoplayVideos} 
                  onCheckedChange={() => handleToggle('autoplayVideos')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-slate-500" />
                  <span>Efectos de sonido</span>
                </div>
                <Switch 
                  checked={settings.soundEffects} 
                  onCheckedChange={() => handleToggle('soundEffects')} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Privacidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-purple-500" />
                <span>Privacidad</span>
              </CardTitle>
              <CardDescription>Configura tus opciones de privacidad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Modo privado</span>
                </div>
                <Switch 
                  checked={settings.privacyMode} 
                  onCheckedChange={() => handleToggle('privacyMode')} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Historial eliminado",
                    description: "Tu historial de visualización ha sido eliminado",
                  });
                }}
              >
                Eliminar historial de visualización
              </Button>
            </CardFooter>
          </Card>
          
          {/* Contenido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutGrid className="mr-2 h-5 w-5 text-orange-500" />
                <span>Contenido</span>
              </CardTitle>
              <CardDescription>Personaliza el contenido que ves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span>Mostrar tendencias</span>
                </div>
                <Switch 
                  checked={settings.showTrending} 
                  onCheckedChange={() => handleToggle('showTrending')} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={() => {
              toast({
                title: "Configuración guardada",
                description: "Tus preferencias han sido guardadas correctamente",
              });
            }}
          >
            Guardar toda la configuración
          </Button>
        </div>
      </div>
  );
}