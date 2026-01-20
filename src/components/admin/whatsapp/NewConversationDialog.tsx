import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Phone as PhoneIcon, Users, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  type: "lead" | "student";
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (phone: string, name: string, type: "lead" | "student", id: string) => void;
}

type ContactTypeFilter = "all" | "lead" | "student";

export function NewConversationDialog({
  open,
  onOpenChange,
  onSelectContact,
}: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualPhone, setManualPhone] = useState("");
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactTypeFilter>("all");

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Fetch leads with phone
      const { data: leads } = await supabase
        .from("leads")
        .select("id, full_name, phone")
        .not("phone", "is", null)
        .neq("phone", "")
        .order("full_name");

      // Fetch students with phone
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .not("phone", "is", null)
        .neq("phone", "")
        .order("full_name");

      const allContacts: Contact[] = [
        ...(leads || []).map((l) => ({
          id: l.id,
          name: l.full_name || "Sem nome",
          phone: l.phone!,
          type: "lead" as const,
        })),
        ...(profiles || []).map((p) => ({
          id: p.id,
          name: p.full_name || "Sem nome",
          phone: p.phone!,
          type: "student" as const,
        })),
      ];

      setContacts(allContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(searchLower) || c.phone.includes(search);
    const matchesType = contactTypeFilter === "all" || c.type === contactTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact.phone, contact.name, contact.type, contact.id);
    onOpenChange(false);
    setSearch("");
    setManualPhone("");
  };

  const handleManualPhone = () => {
    if (!manualPhone.trim()) return;
    
    let phone = manualPhone.replace(/\D/g, "");
    if (!phone.startsWith("55") && phone.length <= 11) {
      phone = "55" + phone;
    }
    
    onSelectContact(phone, "", "lead", "");
    onOpenChange(false);
    setSearch("");
    setManualPhone("");
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Nova Conversa
          </DialogTitle>
          <DialogDescription>
            Selecione um contato ou digite um número de telefone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Manual phone input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Novo número</Label>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="(11) 99999-9999"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleManualPhone} disabled={!manualPhone.trim()} className="w-full sm:w-auto sm:min-w-[100px] shrink-0">
                Iniciar
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou selecione</span>
            </div>
          </div>

          {/* Search contacts */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Contact type filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setContactTypeFilter("all")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                  contactTypeFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Todos
              </button>
              <button
                onClick={() => setContactTypeFilter("lead")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                  contactTypeFilter === "lead"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                Leads
              </button>
              <button
                onClick={() => setContactTypeFilter("student")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors",
                  contactTypeFilter === "student"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Alunas
              </button>
            </div>
          </div>

          {/* Contacts list */}
          <ScrollArea className="h-80 rounded-md border border-border">
            {loading ? (
              <div className="p-2 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                <p className="text-sm">
                  {search ? "Nenhum contato encontrado" : "Nenhum contato com telefone"}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={`${contact.type}-${contact.id}`}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 max-w-full">
                        <span className="font-medium text-sm text-foreground truncate max-w-[180px] sm:max-w-[300px]">
                          {contact.name}
                        </span>
                        <Badge
                          variant={contact.type === "student" ? "secondary" : "outline"}
                          className="text-[10px] shrink-0"
                        >
                          {contact.type === "student" ? "Aluna" : "Lead"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatPhone(contact.phone)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
