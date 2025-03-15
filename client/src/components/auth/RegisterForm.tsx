import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';
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

const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  }),
  password: z.string().min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  }),
  confirmPassword: z.string(),
  email: z.string().email({
    message: 'Introduce un correo electrónico válido',
  }).optional().or(z.literal('')),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export default function RegisterForm() {
  const { register, error } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          title: 'Registro exitoso',
          description: 'Tu cuenta ha sido creada correctamente.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error en el registro',
          description: error || 'No se pudo crear la cuenta. Intenta nuevamente.',
        });
      }
    } catch (err: any) {
      console.error('Error durante el registro:', err);
      toast({
        variant: 'destructive',
        title: 'Error en el registro',
        description: err.message || 'No se pudo crear la cuenta. Intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Regístrate para acceder a Hub Madridista
        </CardDescription>
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
                    <FormLabel>Nombre de usuario*</FormLabel>
                    <FormControl>
                      <Input placeholder="madridista123" {...field} className="h-9" />
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
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} className="h-9" />
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
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} className="h-9" />
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
                    <FormLabel>Contraseña*</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Contraseña" {...field} className="h-9" />
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
                    <FormLabel>Confirmar contraseña*</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirma contraseña" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col pt-2 pb-4">
        {/* SSO buttons temporarily hidden */}
        <div className="text-center w-full">
          <p className="text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}