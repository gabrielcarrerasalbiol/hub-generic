import { Helmet } from 'react-helmet';
import { useLanguage } from '@/hooks/use-language';

export default function TermsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{t('footer.terms')} | {t('app.name')}</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-brand-primary border-b pb-4">{t('terms.title')}</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.ownerInfo.title')}</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>{t('terms.ownerInfo.owner')}</li>
            <li>{t('terms.ownerInfo.address')}</li>
            <li>{t('terms.ownerInfo.id')}</li>
            <li>{t('terms.ownerInfo.email')}</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.purpose.title')}</h2>
          <p className="mb-4">
            {t('terms.purpose.description')}
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>{t('terms.purpose.feature1')}</li>
            <li>{t('terms.purpose.feature2')}</li>
            <li>{t('terms.purpose.feature3')}</li>
            <li>{t('terms.purpose.feature4')}</li>
          </ul>
          <p className="mb-4">
            {t('terms.purpose.acceptance')}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.requirements.title')}</h2>
          <p className="mb-4">{t('terms.requirements.description')}</p>
          <ul className="list-disc ml-6 mb-4">
            <li>{t('terms.requirements.age')}</li>
            <li>{t('terms.requirements.acceptance')}</li>
            <li>{t('terms.requirements.truthful')}</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.embeddedContent.title')}</h2>
          <p className="mb-4">
            {t('terms.embeddedContent.description')}
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.subscriptions.title')}</h2>
          <p className="mb-4">{t('terms.subscriptions.description')}</p>
          <ul className="list-disc ml-6 mb-4">
            <li>{t('terms.subscriptions.payment')}</li>
            <li>{t('terms.subscriptions.usage')}</li>
            <li>{t('terms.subscriptions.cancellation')}</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-brand-primary">{t('terms.liability.title')}</h2>
          <p className="mb-4">
            {t('terms.liability.description')}
          </p>
        </div>
      </div>
    </div>
  );
}