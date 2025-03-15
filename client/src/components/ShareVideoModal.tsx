import { useState } from "react";
import { Copy, Mail, Check, Share2 } from "lucide-react";
import { FaTwitter, FaFacebook, FaWhatsapp, FaLinkedin, FaTelegram } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShareVideoModalProps {
  videoId: number;
  videoTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareVideoModal({ videoId, videoTitle, isOpen, onClose }: ShareVideoModalProps) {
  const [activeTab, setActiveTab] = useState("link");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  // URL base del sitio (en producción sería la URL real)
  const baseUrl = window.location.origin;
  
  // Generar el enlace para compartir
  const shareLink = `${baseUrl}/video/${videoId}`;

  // Función para copiar el enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles",
      });
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error al copiar el enlace:", error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  // Función para enviar el enlace por email
  const sendEmail = async () => {
    try {
      setSending(true);

      // Validar el formato del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          title: "Email inválido",
          description: "Por favor, introduce un email válido",
          variant: "destructive",
        });
        setSending(false);
        return;
      }

      // Enviar la solicitud al servidor
      const response = await apiRequest("/api/share/email", {
        method: "POST",
        body: JSON.stringify({
          videoId,
          videoTitle,
          email,
          message,
          shareLink,
        }),
      });

      if (response.success) {
        setEmailSent(true);
        setEmail("");
        setMessage("");
        
        toast({
          title: "Email enviado",
          description: "Se ha enviado el enlace por email correctamente",
        });
        
        // Resetear el estado después de 3 segundos
        setTimeout(() => {
          setEmailSent(false);
        }, 3000);
      } else {
        throw new Error("Error al enviar el email");
      }
    } catch (error) {
      console.error("Error al enviar el email:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Función para compartir en redes sociales
  const shareOnSocial = (platform: "twitter" | "facebook" | "whatsapp" | "linkedin" | "telegram") => {
    let shareUrl = "";
    
    const encodedTitle = encodeURIComponent(`¡Mira este video de Real Madrid! - ${videoTitle}`);
    const encodedUrl = encodeURIComponent(shareLink);
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }
    
    window.open(shareUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartir Video
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="link">Copiar Enlace</TabsTrigger>
            <TabsTrigger value="email">Enviar por Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="link">Enlace para compartir</Label>
              <div className="flex space-x-2">
                <Input
                  id="link"
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Compartir en redes sociales</h4>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocial("twitter")}
                  className="flex items-center justify-center gap-1"
                  title="Compartir en Twitter"
                >
                  <FaTwitter className="text-[#1DA1F2]" />
                  <span className="sr-only md:not-sr-only md:inline-block">Twitter</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocial("facebook")}
                  className="flex items-center justify-center gap-1"
                  title="Compartir en Facebook"
                >
                  <FaFacebook className="text-[#4267B2]" />
                  <span className="sr-only md:not-sr-only md:inline-block">Facebook</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocial("whatsapp")}
                  className="flex items-center justify-center gap-1"
                  title="Compartir en WhatsApp"
                >
                  <FaWhatsapp className="text-[#25D366]" />
                  <span className="sr-only md:not-sr-only md:inline-block">WhatsApp</span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocial("linkedin")}
                  className="flex items-center justify-center gap-1"
                  title="Compartir en LinkedIn"
                >
                  <FaLinkedin className="text-[#0077B5]" />
                  <span className="sr-only md:not-sr-only md:inline-block">LinkedIn</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => shareOnSocial("telegram")}
                  className="flex items-center justify-center gap-1"
                  title="Compartir en Telegram"
                >
                  <FaTelegram className="text-[#0088cc]" />
                  <span className="sr-only md:not-sr-only md:inline-block">Telegram</span>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del destinatario</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
              <Textarea
                id="message"
                placeholder="¡Hola! Te comparto este video que creo que te gustará..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={sendEmail}
              disabled={!email.trim() || sending || emailSent}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Enviando...
                </span>
              ) : emailSent ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Enviado
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar por Email
                </span>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}