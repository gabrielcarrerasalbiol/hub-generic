import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import FanMoodWidget from '@/components/FanMood/FanMoodWidget';
import MoodStats from '@/components/FanMood/MoodStats';
import RecentMoods from '@/components/FanMood/RecentMoods';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  BarChart4,
  History,
  LineChart,
  Users,
  ThumbsUp,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';

const FanMoodPage = () => {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('current');
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.token);

  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirectTo=/fan-mood');
    }
  }, [isAuthenticated, navigate]);

  // Si el usuario no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-center text-yellow-700 dark:text-yellow-400">
              <ShieldAlert className="h-8 w-8 inline-block mr-2" />
              {t('auth.restricted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{t('fanMood.authRequired')}</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                onClick={() => navigate('/login?redirectTo=/fan-mood')}
              >
                {t('nav.login')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/register?redirectTo=/fan-mood')}
              >
                {t('nav.register')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{t('fanMood.title')} | Hub Madridista</title>
        <meta name="description" content={t('fanMood.description')} />
      </Helmet>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Columna izquierda - Widget de estado de ánimo y tabs */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <ThumbsUp className="h-6 w-6 mr-2 text-primary" />
                {t('fanMood.title')}
              </CardTitle>
              <CardDescription>
                {t('fanMood.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FanMoodWidget />
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="current" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>{t('fanMood.tabs.current')}</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                <span>{t('fanMood.tabs.stats')}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                <span>{t('fanMood.tabs.history')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    {t('fanMood.currentMood')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodStats showTrend={false} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-green-500" />
                    {t('fanMood.moodStats')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodStats showTrend={true} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-500" />
                    {t('fanMood.moodHistory')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('fanMood.historyExplanation')}
                  </p>
                  {user && <RecentMoods userId={user.id} limit={10} />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Columna derecha - Estadísticas generales */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-500" />
                {t('fanMood.communityMood')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('fanMood.communityExplanation')}
              </p>
              <RecentMoods limit={5} showAvatar={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-orange-500" />
                {t('fanMood.howItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">{t('fanMood.howItWorks1Title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('fanMood.howItWorks1Text')}
                </p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">{t('fanMood.howItWorks2Title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('fanMood.howItWorks2Text')}
                </p>
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">{t('fanMood.howItWorks3Title')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('fanMood.howItWorks3Text')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FanMoodPage;