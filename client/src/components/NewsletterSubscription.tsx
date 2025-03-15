import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

// Definir el esquema de validación con Zod
const subscribeSchema = z.object({
  email: z.string().email('Por favor, introduce un email válido'),
  name: z.string().optional(),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad'
  })
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export default function NewsletterSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Aquí iría la lógica para enviar los datos a Mailchimp
      // Cuando tenga los datos de tu cuenta de Mailchimp, actualizaré esta parte

      // Por ahora, simulamos una respuesta exitosa
      toast({
        title: "¡Suscripción exitosa!",
        description: "Gracias por suscribirte a nuestra newsletter.",
        variant: "default",
      });
      
      // Reset del formulario
      form.reset();
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast({
        title: "Error en la suscripción",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
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
        <h3 className="font-semibold text-lg">Suscríbete a nuestra newsletter</h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Recibe noticias y actualizaciones del Real Madrid en tu correo
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
                    placeholder="Tu nombre (opcional)"
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
                    placeholder="Tu email *"
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
                  Acepto la <a href="/privacidad" className="text-[#1E3A8A] dark:text-[#FDBE11] hover:underline">política de privacidad</a> y recibir comunicaciones.
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
            {isLoading ? 'Enviando...' : 'Suscribirme'}
          </Button>
        </form>
      </Form>
    </div>
  );
}