import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Play, Clock, Check, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Tipo para la configuración de tareas programadas
interface ScheduledTaskConfig {
  id: number;
  taskName: string;
  cronExpression: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  description: string | null;
  maxItemsToProcess: number | null;
}

// Tipo para los resultados de una ejecución manual
interface ManualExecutionResult {
  premiumVideos: { total: number, added: number };
  newVideos: { total: number, added: number };
}

export default function ScheduledTasksManager() {
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedHour, setSelectedHour] = useState('00');
  const [selectedMinute, setSelectedMinute] = useState('00');

  // Cargar configuraciones de tareas programadas
  const { data: tasks, isLoading, error } = useQuery<ScheduledTaskConfig[]>({
    queryKey: ['/api/admin/scheduled-tasks'],
    retry: 1,
  });

  // Mutación para actualizar una tarea programada
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<ScheduledTaskConfig> & { id: number }) => {
      return apiRequest(`/api/admin/scheduled-tasks/${taskData.id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Tarea actualizada',
        description: 'La configuración de la tarea programada se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scheduled-tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar la tarea: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para ejecutar manualmente una tarea
  const executeManuallyMutation = useMutation({
    mutationFn: async () => {
      setIsExecuting(true);
      return apiRequest('/api/admin/scheduled-tasks/execute-manual', {
        method: 'POST',
      }) as Promise<ManualExecutionResult>;
    },
    onSuccess: (data) => {
      toast({
        title: 'Importación completada',
        description: `Se importaron ${data.premiumVideos.added} videos de canales premium y ${data.newVideos.added} videos nuevos.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scheduled-tasks'] });
      setIsExecuting(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo ejecutar la tarea: ${error.message}`,
        variant: 'destructive',
      });
      setIsExecuting(false);
    },
  });

  // Mutación para actualizar el horario de la tarea diaria
  const updateDailyScheduleMutation = useMutation({
    mutationFn: async ({ hour, minute }: { hour: string, minute: string }) => {
      const cronExpression = `0 ${minute} ${hour} * * *`;
      // Buscar la tarea de importación diaria y actualizarla
      const dailyTask = tasks?.find(task => task.taskName === 'daily_import');
      if (!dailyTask) {
        throw new Error('No se encontró la tarea de importación diaria');
      }
      
      return apiRequest(`/api/admin/scheduled-tasks/${dailyTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({ cronExpression }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Horario actualizado',
        description: 'El horario de importación diaria se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scheduled-tasks'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar el horario: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Extraer hora y minuto de la expresión cron cuando se cargan las tareas
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const dailyTask = tasks.find(task => task.taskName === 'daily_import');
      if (dailyTask && dailyTask.cronExpression) {
        // Formato de cronExpression: "0 MM HH * * *"
        const parts = dailyTask.cronExpression.split(' ');
        if (parts.length >= 3) {
          setSelectedMinute(parts[1]);
          setSelectedHour(parts[2]);
        }
      }
    }
  }, [tasks]);

  // Manejar cambio en el estado de activación de una tarea
  const handleToggleTask = (taskId: number, enabled: boolean) => {
    updateTaskMutation.mutate({ id: taskId, enabled });
  };

  // Manejar la actualización del horario de la tarea diaria
  const handleUpdateSchedule = () => {
    updateDailyScheduleMutation.mutate({ 
      hour: selectedHour, 
      minute: selectedMinute 
    });
  };

  // Ejecutar importación manual
  const handleExecuteManually = () => {
    executeManuallyMutation.mutate();
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generar opciones para horas y minutos
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudieron cargar las tareas programadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {(error as Error).message || 'Error desconocido'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Tareas Programadas</CardTitle>
          <CardDescription>
            Configure la hora de ejecución de las importaciones automáticas de videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Importación Diaria de Videos</h3>
            <p className="text-sm text-muted-foreground">
              Establezca la hora a la que se ejecutará la importación automática de videos cada día.
            </p>
            
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="hour">Hora</Label>
                <Select 
                  value={selectedHour}
                  onValueChange={setSelectedHour}
                >
                  <SelectTrigger id="hour" className="w-[100px]">
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minute">Minuto</Label>
                <Select 
                  value={selectedMinute}
                  onValueChange={setSelectedMinute}
                >
                  <SelectTrigger id="minute" className="w-[100px]">
                    <SelectValue placeholder="Minuto" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleUpdateSchedule}
                disabled={updateDailyScheduleMutation.isPending}
                className="ml-2"
              >
                {updateDailyScheduleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="mr-2 h-4 w-4" />
                )}
                Actualizar Horario
              </Button>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estado de Tareas Programadas</h3>
            
            {tasks && tasks.length > 0 ? (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{task.description || task.taskName}</h4>
                      <div className="text-sm text-muted-foreground">
                        <p>Próxima ejecución: {formatDate(task.nextRun)}</p>
                        <p>Última ejecución: {formatDate(task.lastRun)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Label 
                        htmlFor={`task-${task.id}`}
                        className="mr-2 cursor-pointer"
                      >
                        {task.enabled ? 'Activada' : 'Desactivada'}
                      </Label>
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.enabled}
                        onCheckedChange={(checked) => 
                          handleToggleTask(task.id, checked === true)
                        }
                        disabled={updateTaskMutation.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay tareas programadas configuradas.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handleExecuteManually}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Ejecutar Importación Ahora
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}