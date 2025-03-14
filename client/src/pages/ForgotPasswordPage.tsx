import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'wouter';

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'El correo electrónico es obligatorio' })
    .email({ message: 'El formato del correo electrónico no es válido' })
});

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsSubmitting(true);
    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email })
      });
      
      // Siempre mostramos mensaje de éxito incluso si el correo no existe (por seguridad)
      setIsSuccess(true);
      toast({
        title: 'Solicitud enviada',
        description: 'Si el correo existe en nuestra base de datos, recibirás instrucciones para restablecer tu contraseña.'
      });
    } catch (error) {
      console.error('Error al solicitar reseteo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al procesar tu solicitud. Inténtalo de nuevo más tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-1/4 bg-blue-900 text-white p-8 hidden lg:flex lg:flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Hub Madridista</h2>
          <p className="text-gray-200">La plataforma definitiva para los fans del Real Madrid</p>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Seguridad primero</h3>
            <p className="text-gray-200">Recupera el acceso a tu cuenta de forma segura</p>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Proceso sencillo</h3>
            <p className="text-gray-200">Sigue los pasos para recuperar tu contraseña</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Soporte disponible</h3>
            <p className="text-gray-200">Estamos aquí para ayudarte si tienes problemas</p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/4 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Recuperar contraseña</CardTitle>
            <CardDescription className="text-center">
              Introduce tu correo electrónico para recibir un enlace de recuperación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-green-600">
                  ¡Solicitud enviada! Revisa tu correo electrónico para las instrucciones.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}