import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import './FormStyle.css';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterForm() {
  const { register, error } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  
  // Schema with translated validation messages
  const registerSchema = z.object({
    username: z.string().min(3, {
      message: t('validation.usernameMinLength'),
    }),
    password: z.string().min(6, {
      message: t('validation.passwordMinLength'),
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: t('validation.emailValid'),
    }).optional().or(z.literal('')),
    name: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsMatch'),
    path: ['confirmPassword'],
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsSubmitting(true);
    
    try {
      const success = await register(
        values.username, 
        values.password, 
        values.email || undefined, 
        values.name || undefined
      );
      
      if (success) {
        toast({
          title: t('registerPage.successTitle'),
          description: t('registerPage.successMessage'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('registerPage.errorTitle'),
          description: error || t('registerPage.errorMessage'),
        });
      }
    } catch (err: any) {
      console.error('Error durante el registro:', err);
      toast({
        variant: 'destructive',
        title: t('registerPage.errorTitle'),
        description: err.message || t('registerPage.errorMessage'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle>{t('registerPage.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="compact-form-item">
                    <FormLabel>{t('registerPage.usernameField')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('registerPage.usernamePlaceholder')} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="compact-form-item">
                    <FormLabel>{t('registerPage.emailField')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('registerPage.emailPlaceholder')} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="compact-form-item">
                    <FormLabel>{t('registerPage.nameField')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('registerPage.namePlaceholder')} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="compact-form-item">
                    <FormLabel>{t('registerPage.passwordField')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('registerPage.passwordPlaceholder')} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="compact-form-item">
                    <FormLabel>{t('registerPage.confirmPasswordField')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('registerPage.confirmPasswordPlaceholder')} {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? t('registerPage.submitting') : t('registerPage.submitButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 pb-4">
        {/* SSO buttons temporarily hidden */}
        <div className="text-center w-full">
          <p className="text-sm">
            {t('registerPage.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-primary underline">
              {t('registerPage.loginLink')}
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}