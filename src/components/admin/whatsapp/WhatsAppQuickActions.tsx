import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Send, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WhatsAppInboxModal } from "./WhatsAppInboxModal";
import { WhatsAppTemplatesModal } from "./WhatsAppTemplatesModal";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function WhatsAppQuickActions() {
  const navigate = useNavigate();
  const [inboxOpen, setInboxOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const actions = [
    {
      label: "Abrir Inbox",
      description: "Chat em tempo real",
      icon: MessageCircle,
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: () => setInboxOpen(true),
    },
    {
      label: "Templates",
      description: "Modelos de mensagem",
      icon: FileText,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => setTemplatesOpen(true),
    },
    {
      label: "Nova Campanha",
      description: "Envio em massa",
      icon: Send,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => navigate("/admin/messaging"),
    },
    {
      label: "Histórico",
      description: "Ver mensagens enviadas",
      icon: History,
      color: "bg-amber-500 hover:bg-amber-600",
      onClick: () => setHistoryOpen(true),
    },
  ];

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => (
              <Button
                key={action.label}
                onClick={action.onClick}
                className={`${action.color} text-white h-auto py-4 flex flex-col items-center gap-2`}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-center">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <WhatsAppInboxModal open={inboxOpen} onOpenChange={setInboxOpen} />
      <WhatsAppTemplatesModal open={templatesOpen} onOpenChange={setTemplatesOpen} />
      
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Mensagens</DialogTitle>
          </DialogHeader>
          <MessageHistory />
        </DialogContent>
      </Dialog>
    </>
  );
}
