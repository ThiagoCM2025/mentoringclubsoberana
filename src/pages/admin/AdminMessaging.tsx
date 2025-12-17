import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, FileText, History, Zap } from "lucide-react";
import { RecipientSelector } from "@/components/admin/messaging/RecipientSelector";
import { MessageHistory } from "@/components/admin/messaging/MessageHistory";
import { TemplatesManager } from "@/components/admin/messaging/TemplatesManager";
import { NurturingManager } from "@/components/admin/messaging/NurturingManager";

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
          <h1 className="text-3xl font-serif font-bold text-cream title-premium">
            Central de Comunicação
          </h1>
          <p className="text-cream/80 mt-1">
            Envie emails, WhatsApp e notificações para alunos e leads
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4 bg-zinc-900 border border-secondary/20">
            <TabsTrigger value="send" className="flex items-center gap-2 text-cream/80 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <Mail className="h-4 w-4" />
              Enviar
            </TabsTrigger>
            <TabsTrigger value="nurturing" className="flex items-center gap-2 text-cream/80 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 text-cream/80 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 text-cream/80 data-[state=active]:bg-secondary data-[state=active]:text-black">
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
