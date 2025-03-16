import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Mail } from 'lucide-react';

export default function NewsletterSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Definimos el tipo primero (sin usar subscribeSchema)
  type SubscribeFormData = {
    email: string;
    name?: string;
    privacyPolicy: boolean;
  };

  // Definir el esquema de validación con Zod y usar textos traducibles
  const subscribeSchema = z.object({
    email: z.string().email(t('validation.emailValid')),
    name: z.string().optional(),
    privacyPolicy: z.boolean().refine(val => val === true, {
      message: t('newsletter.privacyConsent')
    })
  });

  // Inicializar el formulario con react-hook-form
  const form = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      name: '',
      privacyPolicy: false
    }
  });

  // Función para manejar el envío del formulario
  const onSubmit = async (data: SubscribeFormData) => {
    setIsLoading(true);
    
    try {
      // Enviar la solicitud al endpoint de newsletter
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name || undefined, // Si está vacío, enviamos undefined
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({
          title: t('newsletter.successTitle'),
          description: result.message || t('newsletter.successMessage'),
          variant: "default",
        });
        
        // Reset del formulario
        form.reset();
      } else {
        throw new Error(result.message || t('newsletter.errorMessage'));
      }
    } catch (error: any) {
      console.error('Error al suscribirse:', error);
      toast({
        title: t('newsletter.errorTitle'),
        description: error.message || t('newsletter.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-3">
        <Mail className="mr-2 h-5 w-5 text-[#FDBE11]" />
        <h3 className="font-semibold text-lg">{t('newsletter.title')}</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {t('newsletter.description')}
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t('newsletter.namePlaceholder')}
                    className="w-full bg-white dark:bg-gray-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t('newsletter.emailPlaceholder')}
                    type="email"
                    required
                    className="w-full bg-white dark:bg-gray-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="privacyPolicy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="text-sm leading-tight">
                  Acepto la <a href="/privacidad" className="text-[#1E3A8A] dark:text-[#FDBE11] hover:underline">{t('footer.privacy')}</a> y recibir comunicaciones.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/80 text-white"
            disabled={isLoading}
          >
            {isLoading ? t('newsletter.sending') : t('newsletter.subscribeButton')}
          </Button>
        </form>
      </Form>
    </div>
  );
}