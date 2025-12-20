import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, History, Zap, Clock } from "lucide-react";
import { RecipientSelector } from "@/components/admin/messaging/RecipientSelector";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import { TemplatesManager } from "@/components/admin/messaging/TemplatesManager";
import { NurturingManager } from "@/components/admin/messaging/NurturingManager";
import { FollowUpRulesManager } from "@/components/admin/leads/FollowUpRulesManager";

export default function AdminMessaging() {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <AdminLayout>
      <SEO
        title="Central de Comunicação | Admin Soberana"
        description="Envie mensagens para alunos e leads"
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground title-premium">
            Central de Comunicação
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie emails, WhatsApp e notificações para alunos e leads
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-muted border border-border">
            <TabsTrigger value="send" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Mail className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="nurturing" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="followup" className="flex items-center gap-2 text-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Clock className="h-4 w-4" />
              Follow-up
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
            <RecipientSelector />
          </TabsContent>

          <TabsContent value="nurturing" className="space-y-6">
            <NurturingManager />
          </TabsContent>

          <TabsContent value="followup" className="space-y-6">
            <FollowUpRulesManager />
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
