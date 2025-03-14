import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Nombre de usuario</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Introduce tu usuario" 
                    className="py-6" 
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
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700">Contraseña</FormLabel>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Introduce tu contraseña" 
                    className="py-6" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full py-6" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </Form>
      
      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O continúa con</span>
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button 
          variant="outline" 
          type="button" 
          className="flex-1 py-5" 
          onClick={() => window.location.href = "/api/auth/google"}
        >
          Google
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          className="flex-1 py-5" 
          onClick={() => window.location.href = "/api/auth/apple"}
        >
          Apple
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}