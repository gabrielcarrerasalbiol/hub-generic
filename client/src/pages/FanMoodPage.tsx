import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import FanMoodWidget from '@/components/FanMood/FanMoodWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FanMoodPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>{t('fanMood.pageTitle')} | Hub Madridista</title>
        <meta name="description" content={t('fanMood.pageDescription')} />
      </Helmet>
      
      <div className="container mx-auto py-8 space-y-8">
        <div className="max-w-5xl mx-auto">
          {/* Introducción */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('fanMood.pageHeading')}</CardTitle>
              <CardDescription>{t('fanMood.pageSubheading')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('fanMood.pageIntro')}</p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>{t('fanMood.feature1')}</li>
                <li>{t('fanMood.feature2')}</li>
                <li>{t('fanMood.feature3')}</li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Widget de Fan Mood */}
          <FanMoodWidget />
        </div>
      </div>
    </>
  );
}