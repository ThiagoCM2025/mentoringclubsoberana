import { AdminLayout } from "@/components/admin/AdminLayout";
import SEO from "@/components/SEO";
import { WhatsAppHealthStatus } from "@/components/admin/whatsapp/WhatsAppHealthStatus";
import { WhatsAppDashboardStats } from "@/components/admin/whatsapp/WhatsAppDashboardStats";
import { WhatsAppVolumeChart } from "@/components/admin/whatsapp/WhatsAppVolumeChart";
import { WhatsAppQuickActions } from "@/components/admin/whatsapp/WhatsAppQuickActions";
import { WhatsAppRecentActivity } from "@/components/admin/whatsapp/WhatsAppRecentActivity";
import { MessageCircle } from "lucide-react";

export default function AdminWhatsApp() {
  return (
    <AdminLayout>
      <SEO
        title="WhatsApp Dashboard | Admin Soberana"
        description="Central de gerenciamento do WhatsApp"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <MessageCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              WhatsApp Dashboard
            </h1>
            <p className="text-muted-foreground">
              Central de gerenciamento de mensagens e conversas
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <WhatsAppHealthStatus />

        {/* Stats Cards */}
        <WhatsAppDashboardStats />

        {/* Chart and Quick Actions Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WhatsAppVolumeChart />
          <WhatsAppQuickActions />
        </div>

        {/* Recent Activity */}
        <WhatsAppRecentActivity />
      </div>
    </AdminLayout>
  );
}
