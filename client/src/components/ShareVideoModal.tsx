import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShareVideoModalProps {
  videoId: number;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareVideoModal({ videoId, videoTitle, isOpen, onClose }: ShareVideoModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("link");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Generar el enlace corto para compartir
  const shareLink = `${window.location.origin}/video/${videoId}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace se ha copiado al portapapeles.",
      });
    } catch (error) {
      console.error("Error al copiar al portapapeles:", error);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Intenta seleccionarlo manualmente.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor, introduce una dirección de email válida.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSending(true);
      // Enviar petición al backend para enviar el email
      await apiRequest('/api/share/email', {
        method: 'POST',
        body: JSON.stringify({
          videoId,
          videoTitle,
          email,
          message: message || `¡Mira este video de Real Madrid en Hub Madridista!: "${videoTitle}"`,
          shareLink
        })
      });
      
      toast({
        title: "Email enviado",
        description: "Se ha enviado el enlace por email correctamente.",
      });
      
      // Limpiar campos
      setEmail("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error al enviar email:", error);
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar el email. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#001C58]">Compartir video</DialogTitle>
          <DialogDescription>
            Comparte este video con amigos y otros madridistas
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Copiar enlace</TabsTrigger>
            <TabsTrigger value="email">Enviar por email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex space-x-2">
              <Input 
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} className="bg-[#001C58] text-white hover:bg-[#001C58]/90">
                Copiar
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email del destinatario
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="amigo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje personalizado (opcional)
                </label>
                <Textarea
                  id="message"
                  placeholder="¡Mira este video increíble del Real Madrid!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {activeTab === "email" ? (
            <Button 
              onClick={handleSendEmail} 
              className="bg-[#001C58] text-white hover:bg-[#001C58]/90"
              disabled={sending}
            >
              {sending ? "Enviando..." : "Enviar email"}
            </Button>
          ) : (
            <Button 
              onClick={handleCopyLink} 
              className="bg-[#001C58] text-white hover:bg-[#001C58]/90"
            >
              Copiar enlace
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}