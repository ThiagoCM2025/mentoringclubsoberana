import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, History, MessageCircle, Inbox, Send } from "lucide-react";
import { StudentRecipientSelector } from "@/components/admin/messaging/StudentRecipientSelector";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import { TemplatesManager } from "@/components/admin/messaging/TemplatesManager";
import { EmailInbox } from "@/components/admin/messaging/EmailInbox";
import { EmailTrackingHistory } from "@/components/admin/messaging/EmailTrackingHistory";
import { WhatsAppInboxModal } from "@/components/admin/whatsapp/WhatsAppInboxModal";
import { Button } from "@/components/ui/button";
import { useUnreadWhatsAppCount } from "@/hooks/useUnreadWhatsAppCount";
import { Badge } from "@/components/ui/badge";

export default function AdminMessaging() {
  const [activeTab, setActiveTab] = useState("send");
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const unreadCount = useUnreadWhatsAppCount();

  return (
    <AdminLayout>
      <SEO
        title="Comunicação com Alunas | Admin Soberana"
        description="Envie mensagens para alunas matriculadas"
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground title-premium">
              Comunicação com Alunas
            </h1>
            <p className="text-muted-foreground mt-1">
              Envie emails e notificações para alunas matriculadas
            </p>
          </div>
          <Button
            onClick={() => setWhatsappOpen(true)}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 relative"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir WhatsApp
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-muted border border-border">
            <TabsTrigger value="send" className="flex items-center gap-1.5 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs sm:text-sm">
              <Send className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-1.5 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs sm:text-sm">
              <Inbox className="h-4 w-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="email-history" className="flex items-center gap-1.5 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs sm:text-sm">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground text-xs sm:text-sm">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <StudentRecipientSelector />
          </TabsContent>

          <TabsContent value="inbox" className="space-y-6">
            <EmailInbox />
          </TabsContent>

          <TabsContent value="email-history" className="space-y-6">
            <EmailTrackingHistory />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesManager />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MessageHistory />
          </TabsContent>
        </Tabs>
      </div>

      <WhatsAppInboxModal open={whatsappOpen} onOpenChange={setWhatsappOpen} />
    </AdminLayout>
  );
}
