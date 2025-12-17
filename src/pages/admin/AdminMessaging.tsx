import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, History } from "lucide-react";
import { RecipientSelector } from "@/components/admin/messaging/RecipientSelector";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import { TemplatesManager } from "@/components/admin/messaging/TemplatesManager";

export default function AdminMessaging() {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <AdminLayout>
      <SEO
        title="Central de Comunicação | Admin Soberana"
        description="Envie mensagens para alunos e leads"
      />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Central de Comunicação
          </h1>
          <p className="text-muted-foreground">
            Envie emails, WhatsApp e notificações para alunos e leads
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <RecipientSelector />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesManager />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <MessageHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
