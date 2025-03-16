import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
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

export default function LoginForm() {
  const login = useAuth((state) => state.login);
  const error = useAuth((state) => state.error);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  
  // Define validation schema with translations
  const loginSchema = z.object({
    username: z.string().min(1, {
      message: t('auth.username') + t('general.required'),
    }),
    password: z.string().min(1, {
      message: t('auth.password') + t('general.required'),
    }),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        toast({
          title: t('auth.loginPage.loginSuccess'),
          description: t('auth.loginPage.loginSuccessMessage'),
        });
        // Use navigate instead of window.location
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: t('auth.loginPage.loginError'),
          description: error || t('auth.loginPage.loginErrorMessage'),
        });
      }
    } catch (err: any) {
      console.error('Error during login:', err);
      toast({
        variant: 'destructive',
        title: t('auth.loginPage.loginError'),
        description: err.message || t('auth.loginPage.loginErrorMessage'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle>{t('auth.loginPage.title')}</CardTitle>
        <CardDescription>
          {t('auth.loginPage.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="compact-form-item">
                  <FormLabel>{t('auth.username')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`${t('auth.username')}...`} 
                      className="h-9" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="compact-form-item">
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={`${t('auth.password')}...`}
                      className="h-9" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? t('auth.loginPage.logging') : t('auth.login')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 pb-4">
        {/* SSO buttons temporarily hidden */}
        <div className="text-center w-full">
          <p className="text-sm">
            {t('auth.loginPage.noAccount')}{' '}
            <Link href="/register" className="text-primary underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}