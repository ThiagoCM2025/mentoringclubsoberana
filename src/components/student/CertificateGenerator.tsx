import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  Share2, 
  Linkedin,
  QrCode,
  Award,
  Calendar,
  CheckCircle2,
  Loader2,
  Twitter,
  MessageCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface CertificateData {
  id: string;
  certificate_number: string;
  student_name: string;
  course_title: string;
  completion_date: string;
  issued_at: string;
}

interface CertificateGeneratorProps {
  certificate: CertificateData;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificateGenerator({ certificate, isOpen, onClose }: CertificateGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const downloadAsPNG = async () => {
    setIsGenerating(true);
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: null,
          useCORS: true
        });
        
        const link = document.createElement('a');
        link.download = `certificado-${certificate.certificate_number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "Certificado baixado!",
          description: "Seu certificado foi salvo como imagem."
        });
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Erro ao gerar certificado",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnLinkedIn = () => {
    const text = `Acabei de concluir o curso "${certificate.course_title}" na Soberana Mentoring Club! 🎉\n\nCertificado: ${certificate.certificate_number}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareOnTwitter = () => {
    const text = `🎉 Acabei de concluir o curso "${certificate.course_title}" na @SoberanaMentoring! Certificado: ${certificate.certificate_number}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verificationUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = `🎉 Acabei de concluir o curso "${certificate.course_title}" na Soberana Mentoring Club!\n\nCertificado: ${certificate.certificate_number}\nVerificar: ${verificationUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificate_number}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-secondary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cream">
            <Award className="w-5 h-5 text-secondary" />
            Certificado de Conclusão
          </DialogTitle>
        </DialogHeader>

        {/* Certificate Preview */}
        <div 
          ref={certificateRef}
          className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-2xl p-8 border-2 border-secondary/50 overflow-hidden"
          style={{ aspectRatio: '1.414/1' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>

          {/* Border Decoration */}
          <div className="absolute inset-4 border border-secondary/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-6 border border-secondary/20 rounded-lg pointer-events-none" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-between text-center py-8">
            {/* Header */}
            <div className="flex flex-col items-center">
              <motion.img 
                src={isotipoGold} 
                alt="Soberana" 
                className="w-20 h-20 mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
              <h1 className="text-3xl font-serif font-bold text-secondary mb-1">
                SOBERANA MENTORING CLUB
              </h1>
              <p className="text-cream/60 text-sm tracking-widest uppercase">
                Certificado de Conclusão
              </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl py-8">
              <p className="text-cream/70 mb-4">Certificamos que</p>
              <h2 className="text-4xl font-serif font-bold text-cream mb-4">
                {certificate.student_name}
              </h2>
              <p className="text-cream/70 mb-4">concluiu com êxito o curso</p>
              <h3 className="text-2xl font-semibold text-secondary mb-6">
                {certificate.course_title}
              </h3>
              <div className="flex items-center gap-2 text-cream/60">
                <Calendar className="w-4 h-4" />
                <p>Concluído em {formatDate(certificate.completion_date)}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <p className="text-xs text-cream/50">Código de Verificação</p>
                <p className="text-sm font-mono text-secondary">{certificate.certificate_number}</p>
              </div>
              
              {/* QR Code Placeholder */}
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-zinc-900" />
              </div>

              <div className="text-right">
                <p className="text-xs text-cream/50">Emitido em</p>
                <p className="text-sm text-cream/70">{formatDate(certificate.issued_at)}</p>
              </div>
            </div>
          </div>

          {/* Gold Corner Accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-secondary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-secondary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-secondary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-secondary rounded-br-2xl" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <Button
            onClick={downloadAsPNG}
            disabled={isGenerating}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar PNG
          </Button>

          <Button
            onClick={shareOnLinkedIn}
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>

          <Button
            onClick={shareOnTwitter}
            variant="outline"
            className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
          >
            <Twitter className="w-4 h-4 mr-2" />
            X / Twitter
          </Button>

          <Button
            onClick={shareOnWhatsApp}
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(verificationUrl);
              toast({ title: "Link copiado!", description: "Compartilhe o link de verificação." });
            }}
            variant="outline"
            className="border-secondary/30 text-cream hover:bg-secondary/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
        </div>

        <p className="text-xs text-center text-cream/50 mt-2">
          Verifique a autenticidade em: {verificationUrl}
        </p>
      </DialogContent>
    </Dialog>
  );
}
