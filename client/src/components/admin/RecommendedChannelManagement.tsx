import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Star, ArrowUpDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel } from "../../../../shared/schema";

interface RecommendedChannel {
  id: number;
  channelId: number;
  addedAt: string;
  notes: string | null;
  displayOrder: number;
  channelDetails?: Channel;
}

type EnrichedRecommendedChannel = RecommendedChannel & {
  channelDetails?: Channel;
};

export default function RecommendedChannelManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [channelUrl, setChannelUrl] = useState<string>("");
  const [isAddingByUrl, setIsAddingByUrl] = useState(false);

  // Fetch all channels for the dropdown
  const { data: channels } = useQuery({
    queryKey: ["/api/channels"],
    queryFn: async () => {
      const response = await apiRequest<Channel[]>("/api/channels", {
        method: "GET",
      });
      return response;
    },
  });

  // Fetch recommended channels
  const { 
    data: recommendedChannels, 
    isLoading,
    refetch: refetchRecommendedChannels
  } = useQuery({
    queryKey: ["/api/recommended-channels"],
    queryFn: async () => {
      const response = await apiRequest<EnrichedRecommendedChannel[]>("/api/recommended-channels", {
        method: "GET",
      });
      return response;
    },
  });

  // Add channel directly from URL
  const addChannelFromUrlMutation = useMutation({
    mutationFn: async (data: { url: string; description: string | null }) => {
      return apiRequest("/api/recommended-channels/add-by-url", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal recomendado añadido",
        description: "El canal ha sido agregado a la lista de canales recomendados",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommended-channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      // Reset form
      setChannelUrl("");
      setDisplayOrder("0");
      setNotes("");
      setIsAddingByUrl(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el canal recomendado",
        variant: "destructive",
      });
    },
  });

  // Add recommended channel
  const addRecommendedChannelMutation = useMutation({
    mutationFn: async (data: { channelId: string; notes: string | null; displayOrder: number }) => {
      return apiRequest("/api/recommended-channels", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal recomendado añadido",
        description: "El canal ha sido agregado a la lista de canales recomendados",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommended-channels"] });
      // Reset form
      setSelectedChannelId("");
      setDisplayOrder("0");
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el canal recomendado",
        variant: "destructive",
      });
    },
  });

  // Update recommended channel order
  const updateRecommendedChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: { displayOrder: number, notes?: string } }) => {
      return apiRequest(`/api/recommended-channels/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal recomendado actualizado",
        description: "El orden de visualización ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommended-channels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el canal recomendado",
        variant: "destructive",
      });
    },
  });

  // Remove recommended channel
  const removeRecommendedChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/recommended-channels/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal recomendado eliminado",
        description: "El canal ha sido eliminado de la lista de canales recomendados",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recommended-channels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el canal recomendado",
        variant: "destructive",
      });
    },
  });

  const handleAddRecommendedChannel = () => {
    if (!selectedChannelId) {
      toast({
        title: "Error",
        description: "Selecciona un canal para agregar",
        variant: "destructive",
      });
      return;
    }

    addRecommendedChannelMutation.mutate({
      channelId: selectedChannelId,
      displayOrder: parseInt(displayOrder),
      notes: notes || null,
    });
  };

  const handleAddChannelFromUrl = () => {
    if (!channelUrl) {
      toast({
        title: "Error",
        description: "Introduce la URL del canal",
        variant: "destructive",
      });
      return;
    }

    addChannelFromUrlMutation.mutate({
      url: channelUrl,
      description: notes || null,
    });
  };

  const handleRemoveRecommendedChannel = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este canal recomendado?")) {
      removeRecommendedChannelMutation.mutate(id);
    }
  };

  const handleUpdateOrder = (id: number, newOrder: string) => {
    const orderValue = parseInt(newOrder);
    if (isNaN(orderValue)) return;
    
    updateRecommendedChannelMutation.mutate({
      id,
      data: { displayOrder: orderValue }
    });
  };

  // Filter channels based on selected platform
  const filteredChannels = Array.isArray(channels)
    ? channels.filter((channel) => {
        // Filter by platform if not set to "all"
        if (selectedPlatform !== "all" && channel.platform !== selectedPlatform) {
          return false;
        }

        // Don't show channels that are already recommended
        const isRecommended = Array.isArray(recommendedChannels) 
          ? recommendedChannels.some(rc => rc.channelId === channel.id)
          : false;
        
        return !isRecommended;
      })
    : [];

  // Sort recommended channels by display order
  const sortedRecommendedChannels = Array.isArray(recommendedChannels)
    ? [...recommendedChannels].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList>
        <TabsTrigger value="list">Lista de Canales Recomendados</TabsTrigger>
        <TabsTrigger value="add">Añadir Nuevo Canal Recomendado</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Canales Recomendados</CardTitle>
            <CardDescription>
              Los canales recomendados son sugerencias para los usuarios que buscan contenido de calidad sobre el Real Madrid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">Cargando canales recomendados...</div>
            ) : !sortedRecommendedChannels?.length ? (
              <div className="py-8 text-center">No hay canales recomendados configurados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orden</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Añadido</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecommendedChannels.map((recommendedChannel) => (
                    <TableRow key={recommendedChannel.id} data-channel-id={recommendedChannel.channelId}>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          className="w-16"
                          value={recommendedChannel.displayOrder}
                          onChange={(e) => handleUpdateOrder(recommendedChannel.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {recommendedChannel.channelDetails?.thumbnailUrl && (
                            <img
                              src={recommendedChannel.channelDetails.thumbnailUrl}
                              alt={recommendedChannel.channelDetails.title}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div>{recommendedChannel.channelDetails?.title || `Canal #${recommendedChannel.channelId}`}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Suscriptores: {recommendedChannel.channelDetails?.subscriberCount?.toLocaleString() || "Desconocido"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {recommendedChannel.channelDetails?.platform || "Desconocido"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(recommendedChannel.addedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {recommendedChannel.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRecommendedChannel(recommendedChannel.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="add" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Añadir Canal Recomendado</CardTitle>
            <CardDescription>
              Añade un nuevo canal a la lista de canales recomendados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-2">
              <Button 
                variant={isAddingByUrl ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsAddingByUrl(true)}
              >
                Añadir por URL
              </Button>
              <Button 
                variant={!isAddingByUrl ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAddingByUrl(false)}
              >
                Seleccionar canal existente
              </Button>
            </div>

            {isAddingByUrl ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="channelUrl">URL del Canal:</Label>
                  <Input
                    id="channelUrl"
                    placeholder="https://www.youtube.com/@RealMadrid o https://twitch.tv/usuario"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Soporta URLs de YouTube, Twitch, Twitter, TikTok e Instagram
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Descripción (opcional):</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade notas sobre este canal recomendado"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Filtrar por plataforma:</Label>
                  <Select
                    value={selectedPlatform}
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las plataformas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las plataformas</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitch">Twitch</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="channelId">Canal:</Label>
                  <Select
                    value={selectedChannelId}
                    onValueChange={setSelectedChannelId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredChannels.length === 0 ? (
                        <SelectItem value="no-channels" disabled>
                          No hay canales disponibles
                        </SelectItem>
                      ) : (
                        filteredChannels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id.toString()}>
                            {channel.title} ({channel.platform})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="displayOrder">Orden de visualización:</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    className="w-full"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valores menores aparecerán primero en la lista
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional):</Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade notas sobre este canal recomendado"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setSelectedChannelId("");
              setChannelUrl("");
              setDisplayOrder("0");
              setNotes("");
            }}>
              Cancelar
            </Button>
            {isAddingByUrl ? (
              <Button
                onClick={handleAddChannelFromUrl}
                disabled={!channelUrl || addChannelFromUrlMutation.isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {addChannelFromUrlMutation.isPending ? "Añadiendo..." : "Añadir Canal por URL"}
              </Button>
            ) : (
              <Button
                onClick={handleAddRecommendedChannel}
                disabled={!selectedChannelId || addRecommendedChannelMutation.isPending}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {addRecommendedChannelMutation.isPending ? "Añadiendo..." : "Añadir Canal Recomendado"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}