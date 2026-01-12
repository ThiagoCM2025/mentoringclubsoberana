import { useState } from "react";
import { Check, ChevronDown, Mail, Home, FileDown, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  sourceFilter: string | null;
  icon: React.ReactNode;
  color: string;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "default",
    name: "Sequência Padrão",
    sourceFilter: null,
    icon: <Mail className="h-3.5 w-3.5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: "jornada",
    name: "Jornada Imobiliária",
    sourceFilter: "jornada_imobiliaria_2026",
    icon: <Home className="h-3.5 w-3.5" />,
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: "convite",
    name: "Convite Jornada",
    sourceFilter: "importação_excel",
    icon: <FileDown className="h-3.5 w-3.5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
];

interface CampaignSelectorProps {
  leadId: string;
  currentSource: string | null;
  currentStep: number;
  onCampaignChange: () => void;
  variant?: "badge" | "select";
  disabled?: boolean;
}

function getCampaignFromSource(source: string | null): Campaign {
  if (source === "jornada_imobiliaria_2026") {
    return CAMPAIGNS.find(c => c.id === "jornada")!;
  }
  if (source === "importação_excel") {
    return CAMPAIGNS.find(c => c.id === "convite")!;
  }
  return CAMPAIGNS.find(c => c.id === "default")!;
}

export function CampaignSelector({
  leadId,
  currentSource,
  currentStep,
  onCampaignChange,
  variant = "badge",
  disabled = false,
}: CampaignSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    campaign: Campaign | null;
  }>({ open: false, campaign: null });
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCampaign = getCampaignFromSource(currentSource);

  const handleSelectCampaign = (campaign: Campaign) => {
    if (campaign.id === currentCampaign.id) {
      setOpen(false);
      return;
    }

    // Se o lead está na etapa 0, não precisa confirmar reset
    if (currentStep === 0) {
      updateCampaign(campaign, false);
    } else {
      setConfirmDialog({ open: true, campaign });
    }
    setOpen(false);
  };

  const updateCampaign = async (campaign: Campaign, resetStep: boolean) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, unknown> = {
        source: campaign.sourceFilter,
      };

      if (resetStep) {
        updateData.nurturing_step = 0;
      }

      const { error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Campanha alterada",
        description: `Lead movido para "${campaign.name}"${resetStep ? " e sequência reiniciada" : ""}`,
      });

      onCampaignChange();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Erro ao alterar campanha",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setConfirmDialog({ open: false, campaign: null });
    }
  };

  if (variant === "select") {
    return (
      <>
        <Select
          value={currentCampaign.id}
          onValueChange={(value) => {
            const campaign = CAMPAIGNS.find(c => c.id === value);
            if (campaign) handleSelectCampaign(campaign);
          }}
          disabled={disabled || isUpdating}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {currentCampaign.icon}
                <span>{currentCampaign.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGNS.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <div className="flex items-center gap-2">
                  {campaign.icon}
                  <span>{campaign.name}</span>
                  {campaign.id === currentCampaign.id && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alterar campanha de nurturing?</AlertDialogTitle>
              <AlertDialogDescription>
                Este lead está na etapa {currentStep} da sequência atual. Deseja reiniciar a sequência do zero na nova campanha?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                onClick={() => confirmDialog.campaign && updateCampaign(confirmDialog.campaign, false)}
              >
                Manter etapa atual
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => confirmDialog.campaign && updateCampaign(confirmDialog.campaign, true)}
              >
                Reiniciar do zero
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Badge variant (for cards and table)
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled || isUpdating}>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
              "hover:opacity-80 cursor-pointer",
              currentCampaign.color,
              isUpdating && "opacity-50 cursor-wait"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {currentCampaign.icon}
            <span className="truncate max-w-[120px]">{currentCampaign.name}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-1 bg-popover border shadow-lg" 
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            Selecionar Campanha
          </div>
          {CAMPAIGNS.map((campaign) => (
            <button
              key={campaign.id}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                "hover:bg-accent",
                campaign.id === currentCampaign.id && "bg-accent"
              )}
              onClick={() => handleSelectCampaign(campaign)}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 rounded",
                campaign.color
              )}>
                {campaign.icon}
              </span>
              <span className="flex-1 text-left">{campaign.name}</span>
              {campaign.id === currentCampaign.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar campanha de nurturing?</AlertDialogTitle>
            <AlertDialogDescription>
              Este lead está na etapa {currentStep} da sequência atual. Deseja reiniciar a sequência do zero na nova campanha?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={() => confirmDialog.campaign && updateCampaign(confirmDialog.campaign, false)}
            >
              Manter etapa atual
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => confirmDialog.campaign && updateCampaign(confirmDialog.campaign, true)}
            >
              Reiniciar do zero
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
