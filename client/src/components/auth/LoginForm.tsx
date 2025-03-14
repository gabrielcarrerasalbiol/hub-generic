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
  const { login, error } = useAuth();
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Accede a tu cuenta en Hub Madridista
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduce tu usuario" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Introduce tu contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center w-full">
          <span className="text-sm text-gray-500">O inicia sesión con</span>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/google"}>
              Google
            </Button>
            <Button variant="outline" type="button" onClick={() => window.location.href = "/api/auth/apple"}>
              Apple
            </Button>
          </div>
        </div>
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