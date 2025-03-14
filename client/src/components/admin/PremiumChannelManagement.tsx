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
import { PlusCircle, Trash2, RefreshCw, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel } from "../../../../shared/schema";

interface PremiumChannel {
  id: number;
  channelId: number;
  priority: number;
  notes: string | null;
  lastSyncAt: string | null;
  channelDetails?: Channel;
}

type EnrichedPremiumChannel = PremiumChannel & {
  channelDetails?: Channel;
};

export default function PremiumChannelManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [priority, setPriority] = useState<string>("5");
  const [notes, setNotes] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isImporting, setIsImporting] = useState(false);
  const [maxVideosPerChannel, setMaxVideosPerChannel] = useState<string>("20");

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

  // Fetch premium channels
  const { 
    data: premiumChannels, 
    isLoading,
    refetch: refetchPremiumChannels
  } = useQuery({
    queryKey: ["/api/premium-channels"],
    queryFn: async () => {
      const response = await apiRequest<EnrichedPremiumChannel[]>("/api/premium-channels", {
        method: "GET",
      });
      return response;
    },
  });

  // Add premium channel
  const addPremiumChannelMutation = useMutation({
    mutationFn: async (data: { channelId: string; priority: number; notes: string | null }) => {
      return apiRequest("/api/premium-channels", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal premium añadido",
        description: "El canal ha sido agregado a la lista de canales premium",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-channels"] });
      // Reset form
      setSelectedChannelId("");
      setPriority("5");
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el canal premium",
        variant: "destructive",
      });
    },
  });

  // Remove premium channel
  const removePremiumChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/premium-channels/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Canal premium eliminado",
        description: "El canal ha sido eliminado de la lista de canales premium",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/premium-channels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el canal premium",
        variant: "destructive",
      });
    },
  });

  // Import videos from premium channels
  const importPremiumVideos = async () => {
    try {
      setIsImporting(true);
      const response = await apiRequest("/api/premium-channels/import-videos", {
        method: "POST",
        body: JSON.stringify({ maxPerChannel: parseInt(maxVideosPerChannel) }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Importación completada",
        description: response.message || `Se han importado videos de los canales premium`,
      });

      // Refresh premium channels to update lastSyncAt
      refetchPremiumChannels();
    } catch (error: any) {
      toast({
        title: "Error en la importación",
        description: error.message || "Ha ocurrido un error al importar los videos",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Import videos from a specific channel
  const importChannelVideos = async (channelId: number) => {
    try {
      const response = await apiRequest(`/api/channels/${channelId}/import-videos`, {
        method: "POST",
        body: JSON.stringify({ maxResults: parseInt(maxVideosPerChannel) }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "Importación completada",
        description: response.message || `Se han importado videos del canal`,
      });

      // Refresh premium channels to update lastSyncAt
      refetchPremiumChannels();
    } catch (error: any) {
      toast({
        title: "Error en la importación",
        description: error.message || "Ha ocurrido un error al importar los videos",
        variant: "destructive",
      });
    }
  };

  const handleAddPremiumChannel = () => {
    if (!selectedChannelId) {
      toast({
        title: "Error",
        description: "Selecciona un canal para agregar",
        variant: "destructive",
      });
      return;
    }

    addPremiumChannelMutation.mutate({
      channelId: selectedChannelId,
      priority: parseInt(priority),
      notes: notes || null,
    });
  };

  const handleRemovePremiumChannel = (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este canal premium?")) {
      removePremiumChannelMutation.mutate(id);
    }
  };

  // Filter channels based on selected platform
  const filteredChannels = Array.isArray(channels)
    ? channels.filter((channel) => {
        // Filter by platform if not set to "all"
        if (selectedPlatform !== "all" && channel.platform !== selectedPlatform) {
          return false;
        }

        // Don't show channels that are already premium
        const isPremium = Array.isArray(premiumChannels) 
          ? premiumChannels.some(pc => pc.channelId === channel.id)
          : false;
        
        return !isPremium;
      })
    : [];

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList>
        <TabsTrigger value="list">Lista de Canales Premium</TabsTrigger>
        <TabsTrigger value="add">Añadir Nuevo Canal Premium</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Canales Premium</CardTitle>
            <CardDescription>
              Los canales premium son fuentes de contenido verificadas y de alta calidad que son importadas automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Label htmlFor="maxVideos">Máx. videos por canal:</Label>
                <Input
                  id="maxVideos"
                  type="number"
                  min="5"
                  max="50"
                  className="w-20"
                  value={maxVideosPerChannel}
                  onChange={(e) => setMaxVideosPerChannel(e.target.value)}
                />
              </div>
              <Button 
                onClick={importPremiumVideos} 
                disabled={isImporting || !premiumChannels?.length}
                className="gap-2"
              >
                <RefreshCw className={isImporting ? "animate-spin" : ""} size={16} />
                {isImporting ? "Importando..." : "Importar todos los canales"}
              </Button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">Cargando canales premium...</div>
            ) : !premiumChannels?.length ? (
              <div className="py-8 text-center">No hay canales premium configurados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Última Sincronización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {premiumChannels.map((premiumChannel) => (
                    <TableRow key={premiumChannel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {premiumChannel.channelDetails?.thumbnailUrl && (
                            <img
                              src={premiumChannel.channelDetails.thumbnailUrl}
                              alt={premiumChannel.channelDetails.title}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div>{premiumChannel.channelDetails?.title || "Canal #" + premiumChannel.channelId}</div>
                            {premiumChannel.notes && (
                              <div className="text-xs text-muted-foreground">{premiumChannel.notes}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {premiumChannel.channelDetails?.platform?.toUpperCase() || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(premiumChannel.priority)].map((_, i) => (
                            <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {premiumChannel.lastSyncAt 
                          ? new Date(premiumChannel.lastSyncAt).toLocaleString() 
                          : "Nunca"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => importChannelVideos(premiumChannel.channelId)}
                          >
                            <RefreshCw size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePremiumChannel(premiumChannel.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
            <CardTitle>Añadir Canal Premium</CardTitle>
            <CardDescription>
              Selecciona un canal para agregarlo a la lista de canales premium. Estos canales serán escaneados regularmente
              para incorporar su nuevo contenido a la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform-filter">Filtrar por plataforma:</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={setSelectedPlatform}
                >
                  <SelectTrigger id="platform-filter">
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las plataformas</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="channel-select">Canal:</Label>
                <Select
                  value={selectedChannelId}
                  onValueChange={setSelectedChannelId}
                >
                  <SelectTrigger id="channel-select">
                    <SelectValue placeholder="Seleccionar canal" />
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
                <Label htmlFor="priority-select">Prioridad:</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority-select">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ Muy baja</SelectItem>
                    <SelectItem value="2">⭐⭐ Baja</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Media baja</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Media</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Media alta</SelectItem>
                    <SelectItem value="6">⭐⭐⭐⭐⭐⭐ Alta</SelectItem>
                    <SelectItem value="7">⭐⭐⭐⭐⭐⭐⭐ Muy alta</SelectItem>
                    <SelectItem value="8">⭐⭐⭐⭐⭐⭐⭐⭐ Extrema</SelectItem>
                    <SelectItem value="9">⭐⭐⭐⭐⭐⭐⭐⭐⭐ Crítica</SelectItem>
                    <SelectItem value="10">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ Máxima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional):</Label>
                <Textarea
                  id="notes"
                  placeholder="Añade notas sobre este canal premium"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setSelectedChannelId("");
              setPriority("5");
              setNotes("");
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddPremiumChannel}
              disabled={!selectedChannelId || addPremiumChannelMutation.isPending}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {addPremiumChannelMutation.isPending ? "Añadiendo..." : "Añadir Canal Premium"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}