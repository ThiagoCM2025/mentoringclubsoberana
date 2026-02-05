 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   Loader2,
   Mail,
   MailOpen,
   Star,
   StarOff,
   Archive,
   Trash2,
   Search,
   RefreshCw,
   User,
   Calendar,
 } from "lucide-react";
 import { format } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import { cn } from "@/lib/utils";
 
 interface InboundEmail {
   id: string;
   from_email: string;
   from_name: string | null;
   to_email: string;
   subject: string | null;
   body_text: string | null;
   body_html: string | null;
   is_read: boolean;
   is_starred: boolean;
   is_archived: boolean;
   lead_id: string | null;
   received_at: string;
 }
 
 export function EmailInbox() {
   const [emails, setEmails] = useState<InboundEmail[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
   const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
 
   useEffect(() => {
     fetchEmails();
     
     // Realtime subscription
     const channel = supabase
       .channel("inbound-emails-channel")
       .on(
         "postgres_changes",
         {
           event: "INSERT",
           schema: "public",
           table: "inbound_emails",
         },
         (payload) => {
           setEmails((prev) => [payload.new as InboundEmail, ...prev]);
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, []);
 
   async function fetchEmails() {
     setLoading(true);
     try {
       const { data, error } = await supabase
         .from("inbound_emails")
         .select("*")
         .eq("is_archived", false)
         .order("received_at", { ascending: false })
         .limit(100);
 
       if (error) throw error;
       setEmails(data || []);
     } catch (error) {
       console.error("Error fetching emails:", error);
     } finally {
       setLoading(false);
     }
   }
 
   const markAsRead = async (email: InboundEmail) => {
     if (email.is_read) return;
     
     const { error } = await supabase
       .from("inbound_emails")
       .update({ is_read: true })
       .eq("id", email.id);
 
     if (!error) {
       setEmails((prev) =>
         prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e))
       );
       if (selectedEmail?.id === email.id) {
         setSelectedEmail({ ...email, is_read: true });
       }
     }
   };
 
   const toggleStar = async (email: InboundEmail, e: React.MouseEvent) => {
     e.stopPropagation();
     const { error } = await supabase
       .from("inbound_emails")
       .update({ is_starred: !email.is_starred })
       .eq("id", email.id);
 
     if (!error) {
       setEmails((prev) =>
         prev.map((em) =>
           em.id === email.id ? { ...em, is_starred: !em.is_starred } : em
         )
       );
     }
   };
 
   const archiveEmail = async (email: InboundEmail) => {
     const { error } = await supabase
       .from("inbound_emails")
       .update({ is_archived: true })
       .eq("id", email.id);
 
     if (!error) {
       setEmails((prev) => prev.filter((e) => e.id !== email.id));
       setSelectedEmail(null);
     }
   };
 
   const deleteEmail = async (email: InboundEmail) => {
     const { error } = await supabase
       .from("inbound_emails")
       .delete()
       .eq("id", email.id);
 
     if (!error) {
       setEmails((prev) => prev.filter((e) => e.id !== email.id));
       setSelectedEmail(null);
     }
   };
 
   const handleEmailClick = (email: InboundEmail) => {
     setSelectedEmail(email);
     markAsRead(email);
   };
 
   const filteredEmails = emails.filter((email) => {
     const matchesSearch =
       !searchTerm ||
       email.from_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       email.from_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       email.subject?.toLowerCase().includes(searchTerm.toLowerCase());
 
     const matchesFilter =
       filter === "all" ||
       (filter === "unread" && !email.is_read) ||
       (filter === "starred" && email.is_starred);
 
     return matchesSearch && matchesFilter;
   });
 
   const unreadCount = emails.filter((e) => !e.is_read).length;
 
   return (
     <>
       <Card>
         <CardHeader>
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <div className="flex items-center gap-2">
               <CardTitle className="text-lg">Caixa de Entrada</CardTitle>
               {unreadCount > 0 && (
                 <Badge variant="destructive" className="rounded-full">
                   {unreadCount}
                 </Badge>
               )}
             </div>
             <div className="flex flex-wrap gap-2">
               <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Buscar emails..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-9 w-[200px]"
                 />
               </div>
               <div className="flex gap-1">
                 <Button
                   variant={filter === "all" ? "default" : "outline"}
                   size="sm"
                   onClick={() => setFilter("all")}
                 >
                   Todos
                 </Button>
                 <Button
                   variant={filter === "unread" ? "default" : "outline"}
                   size="sm"
                   onClick={() => setFilter("unread")}
                 >
                   Não lidos
                 </Button>
                 <Button
                   variant={filter === "starred" ? "default" : "outline"}
                   size="sm"
                   onClick={() => setFilter("starred")}
                 >
                   <Star className="h-4 w-4" />
                 </Button>
               </div>
               <Button variant="outline" size="icon" onClick={fetchEmails}>
                 <RefreshCw className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {loading ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
           ) : filteredEmails.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p>Nenhum email encontrado</p>
               <p className="text-sm mt-1">
                 Configure o webhook do Resend para receber emails
               </p>
             </div>
           ) : (
             <ScrollArea className="h-[500px]">
               <div className="space-y-1">
                 {filteredEmails.map((email) => (
                   <div
                     key={email.id}
                     onClick={() => handleEmailClick(email)}
                     className={cn(
                       "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                       "hover:bg-muted/50",
                       !email.is_read && "bg-primary/5 font-medium"
                     )}
                   >
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-8 w-8 shrink-0"
                       onClick={(e) => toggleStar(email, e)}
                     >
                       {email.is_starred ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                       ) : (
                         <StarOff className="h-4 w-4 text-muted-foreground" />
                       )}
                     </Button>
                     
                     <div className="shrink-0">
                       {email.is_read ? (
                         <MailOpen className="h-5 w-5 text-muted-foreground" />
                       ) : (
                         <Mail className="h-5 w-5 text-primary" />
                       )}
                     </div>
 
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <span className={cn("truncate", !email.is_read && "font-semibold")}>
                           {email.from_name || email.from_email}
                         </span>
                         {email.lead_id && (
                           <Badge variant="outline" className="shrink-0 text-xs">
                             Lead
                           </Badge>
                         )}
                       </div>
                       <p className={cn("text-sm truncate", email.is_read ? "text-muted-foreground" : "text-foreground")}>
                         {email.subject || "(Sem assunto)"}
                       </p>
                     </div>
 
                     <span className="text-xs text-muted-foreground shrink-0">
                       {format(new Date(email.received_at), "dd/MM HH:mm", { locale: ptBR })}
                     </span>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           )}
         </CardContent>
       </Card>
 
       {/* Email Detail Dialog */}
       <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
         <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Mail className="h-5 w-5" />
               {selectedEmail?.subject || "(Sem assunto)"}
             </DialogTitle>
           </DialogHeader>
           {selectedEmail && (
             <div className="flex-1 overflow-auto space-y-4">
               <div className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                 <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <User className="h-4 w-4 text-muted-foreground" />
                     <span className="font-medium">
                       {selectedEmail.from_name || selectedEmail.from_email}
                     </span>
                     <span className="text-muted-foreground text-sm">
                       &lt;{selectedEmail.from_email}&gt;
                     </span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Calendar className="h-4 w-4" />
                     {format(new Date(selectedEmail.received_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                   </div>
                 </div>
                 <div className="flex gap-1">
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => toggleStar(selectedEmail, e)}
                   >
                     {selectedEmail.is_starred ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                     ) : (
                       <StarOff className="h-4 w-4" />
                     )}
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => archiveEmail(selectedEmail)}
                   >
                     <Archive className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="text-destructive hover:text-destructive"
                     onClick={() => deleteEmail(selectedEmail)}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
 
               <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg">
                 {selectedEmail.body_html ? (
                   <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                 ) : (
                   <pre className="whitespace-pre-wrap font-sans">
                     {selectedEmail.body_text || "Sem conteúdo"}
                   </pre>
                 )}
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </>
   );
 }