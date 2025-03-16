import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Plus, CheckCircle, Edit, EyeOff, Eye } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PollResults } from '@/components/polls/PollResults';

// Esquema para validación del formulario de encuesta
const pollFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres' }),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  showInSidebar: z.boolean().default(false),
  options: z.array(
    z.object({
      id: z.number().optional(),
      text: z.string().min(1, { message: 'La opción no puede estar vacía' }),
      order: z.number().default(0)
    })
  ).min(2, { message: 'Debe haber al menos 2 opciones' })
});

type PollFormValues = z.infer<typeof pollFormSchema>;

interface Poll {
  id: number;
  title: string;
  description: string | null;
  status: 'draft' | 'published';
  showInSidebar: boolean;
  createdAt: string;
  updatedAt: string;
  options: {
    id: number;
    text: string;
    order: number;
    pollId: number;
  }[];
}

export default function PollManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [viewingResults, setViewingResults] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta para obtener todas las encuestas
  const { data: polls, isLoading } = useQuery({
    queryKey: ['/api/polls'],
    queryFn: () => apiRequest('/api/polls')
  });

  // Consulta para obtener resultados de una encuesta específica
  const { data: pollResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['/api/polls', viewingResults, 'results'],
    queryFn: () => apiRequest(`/api/polls/${viewingResults}/results`),
    enabled: viewingResults !== null
  });

  // Formulario para crear/editar encuestas
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      showInSidebar: false,
      options: [
        { text: '', order: 0 },
        { text: '', order: 1 }
      ]
    }
  });

  // Hook para gestionar el array de opciones
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options'
  });

  // Cargar datos de encuesta cuando se está editando
  useEffect(() => {
    if (editingPoll) {
      form.reset({
        title: editingPoll.title,
        description: editingPoll.description || '',
        status: editingPoll.status,
        showInSidebar: editingPoll.showInSidebar,
        options: editingPoll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          order: opt.order
        }))
      });
    }
  }, [editingPoll, form]);

  // Mutación para crear encuesta
  const createPoll = useMutation({
    mutationFn: (data: PollFormValues) => apiRequest('/api/polls', {
      method: 'POST',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: 'Encuesta creada',
        description: 'La encuesta se ha creado correctamente'
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al crear la encuesta',
        variant: 'destructive'
      });
      console.error('Error creando encuesta:', error);
    }
  });

  // Mutación para actualizar encuesta
  const updatePoll = useMutation({
    mutationFn: ({ id, data }: { id: number, data: PollFormValues }) => apiRequest(`/api/polls/${id}`, {
      method: 'PUT',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: 'Encuesta actualizada',
        description: 'La encuesta se ha actualizado correctamente'
      });
      setIsDialogOpen(false);
      setEditingPoll(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al actualizar la encuesta',
        variant: 'destructive'
      });
      console.error('Error actualizando encuesta:', error);
    }
  });

  // Mutación para eliminar encuesta
  const deletePoll = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/polls/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: 'Encuesta eliminada',
        description: 'La encuesta se ha eliminado correctamente'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al eliminar la encuesta',
        variant: 'destructive'
      });
      console.error('Error eliminando encuesta:', error);
    }
  });

  // Mutación para publicar encuesta
  const publishPoll = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/polls/${id}/publish`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: 'Encuesta publicada',
        description: 'La encuesta se ha publicado correctamente'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al publicar la encuesta',
        variant: 'destructive'
      });
      console.error('Error publicando encuesta:', error);
    }
  });

  // Mutación para convertir encuesta a borrador
  const unpublishPoll = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/polls/${id}/unpublish`, {
      method: 'POST'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls'] });
      toast({
        title: 'Encuesta despublicada',
        description: 'La encuesta se ha movido a borradores correctamente'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al despublicar la encuesta',
        variant: 'destructive'
      });
      console.error('Error despublicando encuesta:', error);
    }
  });

  // Manejar envío del formulario
  const onSubmit = (data: PollFormValues) => {
    if (editingPoll) {
      updatePoll.mutate({ id: editingPoll.id, data });
    } else {
      createPoll.mutate(data);
    }
  };

  // Agregar una nueva opción de respuesta
  const handleAddOption = () => {
    append({ text: '', order: fields.length });
  };

  // Abrir dialog para crear nueva encuesta
  const handleCreateNew = () => {
    form.reset({
      title: '',
      description: '',
      status: 'draft',
      showInSidebar: false,
      options: [
        { text: '', order: 0 },
        { text: '', order: 1 }
      ]
    });
    setEditingPoll(null);
    setIsDialogOpen(true);
  };

  // Abrir dialog para editar encuesta
  const handleEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setIsDialogOpen(true);
  };

  // Ver resultados de una encuesta
  const handleViewResults = (pollId: number) => {
    setViewingResults(pollId);
  };

  // Cerrar visualización de resultados
  const handleCloseResults = () => {
    setViewingResults(null);
  };

  // Confirmar eliminación de encuesta
  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta encuesta? Esta acción no se puede deshacer.')) {
      deletePoll.mutate(id);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Encuestas</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Encuesta
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando encuestas...</div>
      ) : polls && polls.length > 0 ? (
        <div className="bg-card rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>En Sidebar</TableHead>
                <TableHead>Opciones</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {polls.map((poll: Poll) => (
                <TableRow key={poll.id}>
                  <TableCell className="font-medium">{poll.title}</TableCell>
                  <TableCell>
                    {poll.status === 'published' ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Publicada
                      </span>
                    ) : (
                      <span className="text-orange-500">Borrador</span>
                    )}
                  </TableCell>
                  <TableCell>{poll.showInSidebar ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{poll.options.length}</TableCell>
                  <TableCell>{new Date(poll.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(poll)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewResults(poll.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {poll.status === 'draft' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => publishPoll.mutate(poll.id)}
                      >
                        Publicar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unpublishPoll.mutate(poll.id)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(poll.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No hay encuestas disponibles. Crea una nueva encuesta para comenzar.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar encuesta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingPoll ? 'Editar Encuesta' : 'Nueva Encuesta'}</DialogTitle>
            <DialogDescription>
              {editingPoll
                ? 'Modifica los detalles de la encuesta y sus opciones de respuesta'
                : 'Crea una nueva encuesta con opciones de respuesta'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la encuesta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción adicional de la encuesta"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showInSidebar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mostrar en Sidebar</FormLabel>
                      <FormDescription>
                        Muestra esta encuesta en el sidebar como encuesta destacada
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Opciones de respuesta</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir opción
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Opción ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {form.formState.errors.options?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.options.root.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPoll.isPending || updatePoll.isPending}>
                  {createPoll.isPending || updatePoll.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver resultados */}
      <Dialog open={viewingResults !== null} onOpenChange={(open) => !open && handleCloseResults()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Resultados de la Encuesta</DialogTitle>
          </DialogHeader>
          {isLoadingResults ? (
            <div className="text-center py-8">Cargando resultados...</div>
          ) : pollResults ? (
            <PollResults pollData={pollResults} />
          ) : (
            <p>No hay datos disponibles</p>
          )}
          <DialogFooter>
            <Button onClick={handleCloseResults}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}