import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, History } from "lucide-react";
import { StudentRecipientSelector } from "@/components/admin/messaging/StudentRecipientSelector";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import { TemplatesManager } from "@/components/admin/messaging/TemplatesManager";

export default function AdminMessaging() {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <AdminLayout>
      <SEO
        title="Comunicação com Alunas | Admin Soberana"
        description="Envie mensagens para alunas matriculadas"
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground title-premium">
            Comunicação com Alunas
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie emails e notificações para alunas matriculadas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted border border-border">
            <TabsTrigger value="send" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Mail className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <StudentRecipientSelector />
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
