import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Mail, Send } from "lucide-react";
import { MessageComposer } from "./MessageComposer";

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: "student";
}

interface Student {
  user_id: string;
  full_name: string | null;
  profiles?: {
    full_name: string | null;
  };
}

export function StudentRecipientSelector() {
  const [students, setStudents] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStudents();

    // Realtime subscription for new students
    const channel = supabase
      .channel('student-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: 'role=eq.student'
        },
        () => {
          console.log('Student role changed, refreshing...');
          fetchStudents(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStudents = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      // Fetch students with their emails from auth
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (rolesError) throw rolesError;

      const userIds = userRoles?.map(r => r.user_id) || [];
      
      if (userIds.length === 0) {
        setStudents([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch profiles for these users (including phone)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Get emails via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke("get-user-emails", {
        body: { userIds }
      });

      const emailMap = new Map<string, string>();
      if (!emailError && emailData?.emails) {
        // emails is an object { user_id: email }, not an array
        Object.entries(emailData.emails).forEach(([userId, email]) => {
          emailMap.set(userId, email as string);
        });
      }

      const studentList: Recipient[] = (profiles || []).map(p => ({
        id: p.user_id,
        name: p.full_name || "Sem nome",
        email: emailMap.get(p.user_id) || "email@desconhecido.com",
        phone: p.phone || null,
        type: "student" as const
      }));

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredList = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(s => s.id));
    }
  };

  const getSelectedRecipients = (): Recipient[] => {
    return students.filter(s => selectedIds.includes(s.id));
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-secondary" />
            Selecionar Alunas
            <span className="text-sm font-normal text-muted-foreground">
              ({students.length} disponíveis)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between px-2 py-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-foreground">Selecionar todas</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selecionadas
            </span>
          </div>

          {/* List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma aluna encontrada</p>
                </div>
              ) : (
                filteredList.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleSelect(student.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(student.id)}
                      onCheckedChange={() => toggleSelect(student.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Action Button */}
          <Button
            onClick={() => setIsComposerOpen(true)}
            disabled={selectedIds.length === 0}
            className="w-full"
            variant="gold"
          >
            <Send className="h-4 w-4 mr-2" />
            Compor Mensagem ({selectedIds.length})
          </Button>
        </CardContent>
      </Card>

      {/* Message Composer */}
      <MessageComposer
        isOpen={isComposerOpen}
        recipients={getSelectedRecipients()}
        audienceType="student"
        onClose={() => {
          setIsComposerOpen(false);
          setSelectedIds([]);
        }}
      />
    </>
  );
}
