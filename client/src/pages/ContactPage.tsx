import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// Esquema de validación para el formulario
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.string().email({ message: 'Por favor introduce un email válido' }),
  subject: z.string().min(5, { message: 'El asunto debe tener al menos 5 caracteres' }),
  message: z.string().min(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Inicializar el formulario con react-hook-form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  // Manejar el envío del formulario
  async function onSubmit(data: z.infer<typeof contactFormSchema>) {
    setIsSubmitting(true);
    
    try {
      // Aquí iría la lógica real para enviar el formulario
      // Por ahora simulamos un envío exitoso tras una pequeña demora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactar con nosotros. Te responderemos lo antes posible.",
        variant: "default"
      });
      
      // Resetear el formulario
      form.reset();
      
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
      
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Contacto | Hub Madridista</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-brand-primary border-b pb-4">Contacto</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="prose prose-lg max-w-none mb-6">
                <p>
                  Estamos encantados de atender tus consultas, sugerencias o reportes. Completa el siguiente formulario
                  y nos pondremos en contacto contigo lo antes posible.
                </p>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-primary mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  <span>contacto@hubmadridista.com</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-primary mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>C/ Sant Rafael 104, 07701, Palma de Mallorca</span>
                </div>
              </div>
            </div>
            
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto de tu consulta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe tu mensaje aquí" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-primary hover:bg-brand-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}