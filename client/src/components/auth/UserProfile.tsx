import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({
    message: 'Introduce un correo electrónico válido',
  }).optional().or(z.literal('')),
  profilePicture: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, {
    message: 'Introduce tu contraseña actual',
  }),
  newPassword: z.string().min(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  }),
  confirmPassword: z.string().min(1, {
    message: 'Confirma tu nueva contraseña',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export default function UserProfile() {
  const { user, updateProfile, changePassword, logout, error } = useAuth();
  const { toast } = useToast();
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Obtener las iniciales del nombre del usuario
  const getInitials = () => {
    if (!user?.name) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Formulario de perfil
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      profilePicture: user?.profilePicture || '',
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setIsProfileSubmitting(true);
    
    try {
      const success = await updateProfile({
        name: values.name,
        email: values.email || undefined,
        profilePicture: values.profilePicture || undefined,
      });
      
      if (success) {
        toast({
          title: 'Perfil actualizado',
          description: 'Tu perfil ha sido actualizado correctamente.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: error || 'No se pudo actualizar tu perfil.',
        });
      }
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  // Formulario de cambio de contraseña
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setIsPasswordSubmitting(true);
    
    try {
      const success = await changePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        toast({
          title: 'Contraseña actualizada',
          description: 'Tu contraseña ha sido actualizada correctamente.',
        });
        passwordForm.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: error || 'No se pudo actualizar tu contraseña.',
        });
      }
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Perfil de usuario</CardTitle>
          <CardDescription>
            No has iniciado sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={user.profilePicture || undefined} alt={user.name || user.username} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.name || user.username}</CardTitle>
        <CardDescription>
          {user.email && <span className="block">{user.email}</span>}
          <span className="block">@{user.username}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">Contraseña</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="pt-4">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de foto de perfil</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isProfileSubmitting}>
                  {isProfileSubmitting ? 'Actualizando...' : 'Actualizar perfil'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="password" className="pt-4">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña actual</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Contraseña actual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Nueva contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nueva contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirma nueva contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isPasswordSubmitting}>
                  {isPasswordSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </CardFooter>
    </Card>
  );
}