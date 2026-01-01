import { Helmet } from 'react-helmet';
import { useLanguage } from '@/hooks/use-language';

export default function CookiesPage() {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{t('footer.cookies')} | {t('app.name')}</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-brand-primary border-b pb-4">{t('cookies.title')}</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            {t('cookies.introduction')}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.definition.title')}</h2>
          <p className="mb-4">
            {t('cookies.definition.description')}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.types.title')}</h2>
          <ul className="mb-4">
            <li className="mb-2">
              <strong>{t('cookies.types.own.title')}</strong>: {t('cookies.types.own.description')}
            </li>
            <li className="mb-2">
              <strong>{t('cookies.types.third.title')}</strong>:
              <ul className="list-disc ml-6 mb-2">
                <li>{t('cookies.types.third.analytics')}</li>
                <li>{t('cookies.types.third.advertising')}</li>
                <li>{t('cookies.types.third.social')}</li>
              </ul>
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.purpose.title')}</h2>
          <p className="mb-4">{t('cookies.purpose.description')}</p>
          <ul className="list-disc ml-6 mb-4">
            <li>{t('cookies.purpose.usage1')}</li>
            <li>{t('cookies.purpose.usage2')}</li>
            <li>{t('cookies.purpose.usage3')}</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.consent.title')}</h2>
          <p className="mb-4">
            {t('cookies.consent.description')}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.disable.title')}</h2>
          <p className="mb-4">
            {t('cookies.disable.description')}
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('cookies.jurisdiction.title')}</h2>
          <p className="mb-4">
            {t('cookies.jurisdiction.description')}
          </p>
        </div>
      </div>
    </div>
  );
}