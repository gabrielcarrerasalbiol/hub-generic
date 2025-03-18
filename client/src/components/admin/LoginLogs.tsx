import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface LoginLog {
  id: number;
  userId: number;
  username: string;
  success: boolean;
  provider: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  createdAt: string;
  details: string | null;
}

interface LoginStats {
  totalCount: number;
  successCount: number;
  failureCount: number;
  byProvider: { provider: string; count: number }[];
  byDate: { date: string; count: number; success: number; failure: number }[];
}

export default function LoginLogs() {
  const [viewMode, setViewMode] = useState('all');
  const [timeRange, setTimeRange] = useState('7');

  // Obtener todos los logs de login
  const { data: allLogs, isLoading: isLoadingAll } = useQuery<LoginLog[]>({
    queryKey: ['/api/admin/login-logs'],
    // No definimos queryFn ya que usará el configurado globalmente en el queryClient
  });

  // Obtener logs fallidos
  const { data: failedLogs, isLoading: isLoadingFailed } = useQuery<LoginLog[]>({
    queryKey: ['/api/admin/login-logs/failed'],
    // No definimos queryFn ya que usará el configurado globalmente en el queryClient
  });

  // Obtener logs recientes (últimos 24h)
  const { data: recentLogs, isLoading: isLoadingRecent } = useQuery<LoginLog[]>({
    queryKey: ['/api/admin/login-logs/recent'],
    // No definimos queryFn ya que usará el configurado globalmente en el queryClient
  });

  // Función para calcular estadísticas
  const calculateStats = (logs: LoginLog[] = []): LoginStats => {
    // Filtrar por rango de tiempo seleccionado
    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    // Conteos básicos
    const totalCount = filteredLogs.length;
    const successCount = filteredLogs.filter(log => log.success).length;
    const failureCount = totalCount - successCount;

    // Por proveedor
    const providerCounts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const provider = log.provider || 'unknown';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });

    const byProvider = Object.entries(providerCounts).map(([provider, count]) => ({
      provider,
      count
    }));

    // Por fecha
    const dateCounts: Record<string, { count: number; success: number; failure: number }> = {};
    filteredLogs.forEach(log => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!dateCounts[date]) {
        dateCounts[date] = { count: 0, success: 0, failure: 0 };
      }
      dateCounts[date].count += 1;
      if (log.success) {
        dateCounts[date].success += 1;
      } else {
        dateCounts[date].failure += 1;
      }
    });

    // Convertir a array y ordenar por fecha
    const byDate = Object.entries(dateCounts)
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        success: stats.success,
        failure: stats.failure
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalCount,
      successCount,
      failureCount,
      byProvider,
      byDate
    };
  };

  // Determinar qué datos mostrar según el modo de vista
  const displayLogs = () => {
    if (viewMode === 'failed') return failedLogs || [];
    if (viewMode === 'recent') return recentLogs || [];
    return allLogs || [];
  };

  const logs = displayLogs();
  const stats = calculateStats(logs);

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const STATUS_COLORS = {
    success: '#10B981', // Verde
    failure: '#EF4444'  // Rojo
  };

  // Formatear fecha para mostrar en tabla
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Renderizar estado de carga
  if (isLoadingAll || isLoadingFailed || isLoadingRecent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando registros de acceso...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Accesos</CardTitle>
            <CardDescription>
              Historial de inicios de sesión en la plataforma
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rango de tiempo:</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Últimos 7 días" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último día</SelectItem>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="table" className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="table">Tabla</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="px-0">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-y dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={viewMode === 'all' ? 'default' : 'outline'} 
                onClick={() => setViewMode('all')}
                size="sm"
              >
                Todos
                {allLogs && (
                  <Badge variant="secondary" className="ml-2">
                    {allLogs.length}
                  </Badge>
                )}
              </Button>
              <Button 
                variant={viewMode === 'failed' ? 'default' : 'outline'} 
                onClick={() => setViewMode('failed')}
                size="sm"
              >
                Fallidos
                {failedLogs && (
                  <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                    {failedLogs.length}
                  </Badge>
                )}
              </Button>
              <Button 
                variant={viewMode === 'recent' ? 'default' : 'outline'} 
                onClick={() => setViewMode('recent')}
                size="sm"
              >
                Recientes
                {recentLogs && (
                  <Badge variant="secondary" className="ml-2">
                    {recentLogs.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  {viewMode === 'all' ? 'Todos los registros de acceso' : 
                   viewMode === 'failed' ? 'Intentos de acceso fallidos' : 
                   'Accesos en las últimas 24 horas'}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="hidden md:table-cell">Navegador</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron registros para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.slice(0, 100).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.id}</TableCell>
                        <TableCell>{log.username}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.success ? "default" : "destructive"}
                            className={log.success ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {log.success ? 'Exitoso' : 'Fallido'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.provider}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ipAddress || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell truncate max-w-[200px]">
                          <span className="text-xs text-gray-500">
                            {log.userAgent ? log.userAgent.substring(0, 50) + '...' : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {logs.length > 100 && (
            <CardFooter className="flex justify-center p-4">
              <p className="text-sm text-gray-500">
                Mostrando 100 de {logs.length} registros. Exporte los datos para ver todos.
              </p>
            </CardFooter>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total de accesos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.totalCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Accesos exitosos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-4xl font-bold text-green-600">{stats.successCount}</div>
                    <div className="text-sm text-gray-500">
                      ({stats.totalCount > 0 
                        ? ((stats.successCount / stats.totalCount) * 100).toFixed(1) + '%' 
                        : '0%'})
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Accesos fallidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-4xl font-bold text-red-600">{stats.failureCount}</div>
                    <div className="text-sm text-gray-500">
                      ({stats.totalCount > 0 
                        ? ((stats.failureCount / stats.totalCount) * 100).toFixed(1) + '%' 
                        : '0%'})
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Accesos por proveedor</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.byProvider.sort((a, b) => b.count - a.count).map((item) => (
                      <TableRow key={item.provider}>
                        <TableCell>
                          <Badge variant="outline">{item.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right">
                          {stats.totalCount > 0 
                            ? ((item.count / stats.totalCount) * 100).toFixed(1) + '%' 
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="charts">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por proveedor</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.byProvider}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="provider"
                      >
                        {stats.byProvider.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accesos por día</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.byDate}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="success" name="Exitosos" stackId="a" fill={STATUS_COLORS.success} />
                      <Bar dataKey="failure" name="Fallidos" stackId="a" fill={STATUS_COLORS.failure} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}