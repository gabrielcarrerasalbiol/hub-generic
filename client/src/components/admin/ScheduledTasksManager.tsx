import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ScheduledTask {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  cronExpression: string;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ScheduledTasksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Estado para la tarea que está siendo editada
  const [editedTask, setEditedTask] = useState<Partial<ScheduledTask>>({});

  // Obtener las tareas programadas
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['/api/scheduled-tasks'],
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  // Mutación para actualizar una tarea
  const updateTaskMutation = useMutation({
    mutationFn: (task: Partial<ScheduledTask> & { id: number }) => 
      apiRequest(`/api/scheduled-tasks/${task.id}`, 'PUT', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({
        title: "Tarea actualizada",
        description: "La configuración de la tarea ha sido actualizada correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea programada",
        variant: "destructive",
      });
    },
  });

  // Mutación para ejecutar todas las tareas ahora
  const runTasksNowMutation = useMutation({
    mutationFn: () => apiRequest('/api/scheduled-tasks/run-now', 'POST'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-tasks'] });
      toast({
        title: "Tareas ejecutadas",
        description: "Las tareas programadas han sido ejecutadas manualmente con éxito",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron ejecutar las tareas programadas",
        variant: "destructive",
      });
    },
  });

  // Manejar cambio de estado (habilitado/deshabilitado)
  const handleToggleEnabled = (id: number, currentStatus: boolean) => {
    updateTaskMutation.mutate({
      id,
      enabled: !currentStatus,
    });
  };

  // Editar una tarea
  const handleEditTask = (task: ScheduledTask) => {
    setEditingTaskId(task.id);
    setEditedTask({
      id: task.id,
      cronExpression: task.cronExpression,
      enabled: task.enabled,
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask({});
  };

  // Guardar cambios en la tarea
  const handleSaveTask = () => {
    if (!editedTask.id) return;
    
    updateTaskMutation.mutate({
      id: editedTask.id,
      cronExpression: editedTask.cronExpression,
      enabled: editedTask.enabled,
    });
    
    setEditingTaskId(null);
    setEditedTask({});
  };

  // Formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No disponible";
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  // Ejecutar todas las tareas manualmente
  const handleRunTasksNow = () => {
    setIsConfirmDialogOpen(true);
  };

  const confirmRunTasks = () => {
    setIsConfirmDialogOpen(false);
    runTasksNowMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Administración de Tareas Programadas</CardTitle>
          <CardDescription>
            Configure las tareas programadas para la importación automática de videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <p>Cargando tareas programadas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
              Error al cargar las tareas programadas
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de tareas programadas</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Expresión Cron</TableHead>
                  <TableHead>Última ejecución</TableHead>
                  <TableHead>Próxima ejecución</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks?.map((task: ScheduledTask) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {editingTaskId === task.id ? (
                        <Switch 
                          checked={editedTask.enabled} 
                          onCheckedChange={(checked) => setEditedTask({...editedTask, enabled: checked})}
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${task.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          {task.enabled ? 'Activo' : 'Inactivo'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTaskId === task.id ? (
                        <Input
                          value={editedTask.cronExpression}
                          onChange={(e) => setEditedTask({...editedTask, cronExpression: e.target.value})}
                        />
                      ) : (
                        task.cronExpression
                      )}
                    </TableCell>
                    <TableCell>{formatDate(task.lastRun)}</TableCell>
                    <TableCell>{formatDate(task.nextRun)}</TableCell>
                    <TableCell>
                      {editingTaskId === task.id ? (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveTask}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditTask(task)}
                          >
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant={task.enabled ? 'destructive' : 'default'}
                            onClick={() => handleToggleEnabled(task.id, task.enabled)}
                          >
                            {task.enabled ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div></div>
          <Button 
            onClick={handleRunTasksNow}
            disabled={runTasksNowMutation.isPending}
          >
            {runTasksNowMutation.isPending 
              ? "Ejecutando..." 
              : "Ejecutar tareas ahora"}
          </Button>
        </CardFooter>
      </Card>

      {/* Información sobre expresiones cron */}
      <Card>
        <CardHeader>
          <CardTitle>Ayuda sobre expresiones Cron</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Las expresiones cron permiten programar tareas en momentos específicos.
              El formato es: <code className="bg-gray-100 p-1 rounded">* * * * *</code>
            </p>
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border-b">Campo</th>
                  <th className="p-2 border-b">Valores permitidos</th>
                  <th className="p-2 border-b">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">Minuto</td>
                  <td className="p-2 border-b">0-59</td>
                  <td className="p-2 border-b"><code>0</code> = en punto de la hora</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Hora</td>
                  <td className="p-2 border-b">0-23</td>
                  <td className="p-2 border-b"><code>0</code> = medianoche</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Día del mes</td>
                  <td className="p-2 border-b">1-31</td>
                  <td className="p-2 border-b"><code>1</code> = primer día del mes</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Mes</td>
                  <td className="p-2 border-b">1-12</td>
                  <td className="p-2 border-b"><code>*</code> = todos los meses</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Día de la semana</td>
                  <td className="p-2 border-b">0-6 (0 = domingo)</td>
                  <td className="p-2 border-b"><code>1-5</code> = lunes a viernes</td>
                </tr>
              </tbody>
            </table>
            <div className="text-sm text-gray-600">
              <h4 className="font-bold">Ejemplos comunes:</h4>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><code className="bg-gray-100 p-1 rounded">0 0 * * *</code> - Todos los días a medianoche</li>
                <li><code className="bg-gray-100 p-1 rounded">0 12 * * *</code> - Todos los días a las 12:00</li>
                <li><code className="bg-gray-100 p-1 rounded">0 0 * * 0</code> - Todos los domingos a medianoche</li>
                <li><code className="bg-gray-100 p-1 rounded">0 9-17 * * 1-5</code> - Cada hora de 9 a 17, de lunes a viernes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Ejecutar tareas programadas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto iniciará inmediatamente todas las tareas de importación y actualización de videos.
              Este proceso puede tardar varios minutos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRunTasks}>Ejecutar ahora</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}