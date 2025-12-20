import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Target, Search, Mail, Phone, Loader2 } from "lucide-react";
import { MessageComposer } from "./MessageComposer";

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "student" | "lead";
}

interface Student {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email?: string;
}

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string | null;
  temperature: string | null;
}

export function RecipientSelector() {
  const [audienceType, setAudienceType] = useState<"student" | "lead">("student");
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (audienceType === "student") {
      fetchStudents();
    } else {
      fetchLeads();
    }
    setSelectedIds(new Set());
  }, [audienceType]);

  async function fetchStudents() {
    setLoading(true);
    try {
      // Get profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .order("full_name");

      if (error) throw error;

      // Get student roles
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      // Get admin roles to exclude them
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const studentUserIds = new Set(studentRoles?.map(r => r.user_id) || []);
      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);
      
      // Filter: must be student AND not admin
      const filteredProfiles = (profiles || [])
        .filter(p => studentUserIds.has(p.user_id) && !adminUserIds.has(p.user_id));

      // Get real emails from edge function
      const userIds = filteredProfiles.map(p => p.user_id);
      let emailMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          "get-user-emails",
          { body: { userIds } }
        );
        
        if (!emailError && emailData?.emails) {
          emailMap = emailData.emails;
        }
      }

      const studentProfiles = filteredProfiles.map(p => ({
        ...p,
        email: emailMap[p.user_id] || `user-${p.user_id.slice(0, 8)}@email.com`
      }));

      setStudents(studentProfiles);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeads() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentList = audienceType === "student" ? students : leads;
  
  const filteredList = currentList.filter((item) => {
    const name = audienceType === "student" 
      ? (item as Student).full_name 
      : (item as Lead).full_name;
    const email = audienceType === "student"
      ? (item as Student).email
      : (item as Lead).email;
    
    const search = searchTerm.toLowerCase();
    return (
      (name?.toLowerCase().includes(search) || false) ||
      (email?.toLowerCase().includes(search) || false)
    );
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = filteredList.map((item) => 
        audienceType === "student" ? (item as Student).user_id : (item as Lead).id
      );
      setSelectedIds(new Set(allIds));
    }
  };

  const getSelectedRecipients = (): Recipient[] => {
    return filteredList
      .filter((item) => {
        const id = audienceType === "student" 
          ? (item as Student).user_id 
          : (item as Lead).id;
        return selectedIds.has(id);
      })
      .map((item) => {
        if (audienceType === "student") {
          const s = item as Student;
          return {
            id: s.user_id,
            name: s.full_name || "Sem nome",
            email: s.email || "",
            phone: s.phone || undefined,
            type: "student" as const,
          };
        } else {
          const l = item as Lead;
          return {
            id: l.id,
            name: l.full_name,
            email: l.email,
            phone: l.phone || undefined,
            type: "lead" as const,
          };
        }
      });
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Audience Type Selection */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Selecione o Público</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => setAudienceType("student")}
              className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                audienceType === "student"
                  ? "border-secondary bg-secondary/10"
                  : "border-border hover:border-secondary/60 bg-card"
              }`}
            >
              <Users className="h-8 w-8 text-primary" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Alunos</div>
                <div className="text-sm text-muted-foreground">
                  {students.length} disponíveis
                </div>
              </div>
            </button>

            <button
              onClick={() => setAudienceType("lead")}
              className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                audienceType === "lead"
                  ? "border-secondary bg-secondary/10"
                  : "border-border hover:border-secondary/60 bg-card"
              }`}
            >
              <Target className="h-8 w-8 text-secondary" />
              <div className="text-left">
                <div className="font-semibold text-foreground">Leads</div>
                <div className="text-sm text-muted-foreground">
                  {leads.length} disponíveis
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Recipients List */}
        <Card className="admin-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">
                {audienceType === "student" ? "Alunos" : "Leads"}
              </CardTitle>
              <Badge variant="outline" className="border-border text-foreground">
                {selectedIds.size} selecionado(s)
              </Badge>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum {audienceType === "student" ? "aluno" : "lead"} encontrado
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <Checkbox
                    checked={selectedIds.size === filteredList.length && filteredList.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Selecionar todos ({filteredList.length})
                  </span>
                </div>

                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {filteredList.map((item) => {
                    const id = audienceType === "student" 
                      ? (item as Student).user_id 
                      : (item as Lead).id;
                    const name = audienceType === "student"
                      ? (item as Student).full_name
                      : (item as Lead).full_name;
                    const email = audienceType === "student"
                      ? (item as Student).email
                      : (item as Lead).email;
                    const phone = audienceType === "student"
                      ? (item as Student).phone
                      : (item as Lead).phone;

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 py-3 hover:bg-muted/50 px-2 rounded cursor-pointer"
                        onClick={() => toggleSelect(id)}
                      >
                        <Checkbox
                          checked={selectedIds.has(id)}
                          onCheckedChange={() => toggleSelect(id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-foreground">
                            {name || "Sem nome"}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3" />
                              {email}
                            </span>
                            {phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {audienceType === "lead" && (
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            {(item as Lead).temperature || "cold"}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="gold"
                onClick={() => setIsComposerOpen(true)}
                disabled={selectedIds.size === 0}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Compor Mensagem para {selectedIds.size} destinatário(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MessageComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        recipients={getSelectedRecipients()}
        audienceType={audienceType}
      />
    </>
  );
}
