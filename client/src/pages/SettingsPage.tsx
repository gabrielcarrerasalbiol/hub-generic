import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Moon, Sun, Globe, Lock, Volume2, Mail, Play, LayoutGrid, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Configuraciones de la aplicación (podrían guardarse en el perfil del usuario o localStorage)
  const [settings, setSettings] = useState({
    darkMode: theme === 'dark',
    notifications: true,
    emailNotifications: true,
    language: currentLanguage,
    autoplayVideos: true,
    showTrending: true,
    privacyMode: false,
    soundEffects: true
  });

  // Actualizar el estado cuando cambia el tema o idioma externo
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: theme === 'dark',
      language: currentLanguage
    }));
  }, [theme, currentLanguage]);

  const handleToggle = (setting: keyof typeof settings) => {
    const newValue = !settings[setting];
    setSettings({
      ...settings,
      [setting]: newValue
    });
    
    // Si es el modo oscuro, actualiza el tema global
    if (setting === 'darkMode') {
      setTheme(newValue ? 'dark' : 'light');
    }
    
    toast({
      title: t('toast.settingsUpdated'),
      description: t('toast.settingsSaved'),
    });
    
    // Aquí se podría implementar la lógica para guardar en backend o localStorage
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 h-5 w-5 text-yellow-500" />
              <span>{t('settings.theme')}</span>
            </CardTitle>
            <CardDescription>{t('settings.theme')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4 text-slate-500" />
                <span>{t('settings.darkMode')}</span>
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
              <span>{t('settings.notifications')}</span>
            </CardTitle>
            <CardDescription>{t('settings.notifications')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-slate-500" />
                <span>{t('settings.appNotifications')}</span>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={() => handleToggle('notifications')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{t('settings.emailNotifications')}</span>
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
              <span>{t('settings.language')}</span>
            </CardTitle>
            <CardDescription>{t('settings.language')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={settings.language === 'es' ? "default" : "outline"}
                onClick={() => {
                  changeLanguage('es');
                  setSettings({...settings, language: 'es'});
                  toast({
                    title: t('toast.languageUpdated'),
                    description: t('toast.languageChanged'),
                  });
                }}
                className="w-full"
              >
                Español
              </Button>
              <Button 
                variant={settings.language === 'en' ? "default" : "outline"}
                onClick={() => {
                  changeLanguage('en');
                  setSettings({...settings, language: 'en'});
                  toast({
                    title: t('toast.languageUpdated'),
                    description: t('toast.languageChangedEn'),
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
              <span>{t('settings.playback')}</span>
            </CardTitle>
            <CardDescription>{t('settings.playback')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-slate-500" />
                <span>{t('settings.autoplay')}</span>
              </div>
              <Switch 
                checked={settings.autoplayVideos} 
                onCheckedChange={() => handleToggle('autoplayVideos')} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-slate-500" />
                <span>{t('settings.soundEffects')}</span>
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
              <span>{t('settings.privacy')}</span>
            </CardTitle>
            <CardDescription>{t('settings.privacy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <span>{t('settings.privacyMode')}</span>
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
                  title: t('toast.historyCleared'),
                  description: t('toast.historyDeleted'),
                });
              }}
            >
              {t('settings.clearHistory')}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Contenido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LayoutGrid className="mr-2 h-5 w-5 text-orange-500" />
              <span>{t('settings.content')}</span>
            </CardTitle>
            <CardDescription>{t('settings.content')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <span>{t('settings.showTrending')}</span>
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
              title: t('toast.settingsUpdated'),
              description: t('toast.settingsSaved'),
            });
          }}
        >
          {t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}