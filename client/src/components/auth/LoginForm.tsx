import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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

const loginSchema = z.object({
  username: z.string().min(1, {
    message: 'Introduce tu nombre de usuario',
  }),
  password: z.string().min(1, {
    message: 'Introduce tu contraseña',
  }),
});

export default function LoginForm() {
  const login = useAuth((state) => state.login);
  const error = useAuth((state) => state.error);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          title: 'Inicio de sesión exitoso',
          description: 'Has iniciado sesión correctamente.',
        });
        // Usar navigate en lugar de window.location
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error en el inicio de sesión',
          description: error || 'Usuario o contraseña incorrectos.',
        });
      }
    } catch (err: any) {
      console.error('Error durante el inicio de sesión:', err);
      toast({
        variant: 'destructive',
        title: 'Error en el inicio de sesión',
        description: err.message || 'Usuario o contraseña incorrectos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Accede a Hub Madridista para disfrutar del contenido exclusivo
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
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Introduce tu usuario" 
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
                    <FormLabel>Contraseña</FormLabel>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Introduce tu contraseña" 
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
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 pb-4">
        {/* SSO buttons temporarily hidden */}
        <div className="text-center w-full">
          <p className="text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary underline">
              Regístrate
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}