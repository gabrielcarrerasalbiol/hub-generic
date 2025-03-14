import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  // Obtener el token de la URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Verificar validez del token al cargar
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setIsTokenValidating(false);
        return;
      }

      try {
        const response = await apiRequest(`/api/auth/reset-password/${token}`);
        setIsValidToken(response.valid);
      } catch (error) {
        console.error('Error validando token:', error);
        setIsValidToken(false);
      } finally {
        setIsTokenValidating(false);
      }
    }

    verifyToken();
  }, [token]);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        })
      });

      setIsSuccess(true);
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada con éxito.'
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Hubo un problema al resetear tu contraseña.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Mostrar pantalla de carga mientras se valida el token
  if (isTokenValidating) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full flex items-center justify-center">
          <Card className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
            <CardContent className="flex justify-center items-center py-12">
              <p className="text-gray-600">Verificando token...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Si el token no es válido
  if (!token || !isValidToken) {
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
            <div>
              <h3 className="text-xl font-semibold mb-2">Soporte disponible</h3>
              <p className="text-gray-200">Estamos aquí para ayudarte si tienes problemas</p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-3/4 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Enlace inválido</CardTitle>
              <CardDescription className="text-center">
                El enlace de recuperación de contraseña es inválido o ha expirado.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <p className="text-center mb-6">
                Por favor, solicita un nuevo enlace de recuperación para continuar.
              </p>
              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/forgot-password">
                    Solicitar nuevo enlace
                  </Link>
                </Button>
              </div>
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
            <h3 className="text-xl font-semibold mb-2">Cambia tu contraseña</h3>
            <p className="text-gray-200">Establece una contraseña segura para tu cuenta</p>
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
            <CardTitle className="text-2xl font-bold text-center">Reestablece tu contraseña</CardTitle>
            <CardDescription className="text-center">
              Introduce tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirma tu contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-green-600 font-semibold text-lg">
                  ¡Tu contraseña ha sido actualizada con éxito!
                </p>
                <p>Serás redirigido a la página de inicio de sesión en unos segundos...</p>
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