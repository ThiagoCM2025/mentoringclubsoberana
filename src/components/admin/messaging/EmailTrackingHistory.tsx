 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 import { Button } from "@/components/ui/button";
 import {
   Loader2,
   Mail,
   Eye,
   MousePointerClick,
   CheckCircle,
   XCircle,
   Clock,
   ExternalLink,
 } from "lucide-react";
 import { format } from "date-fns";
 import { ptBR } from "date-fns/locale";
 
 interface EmailHistoryItem {
   id: string;
   recipient_name: string | null;
   recipient_email: string | null;
   subject: string | null;
   message: string;
   status: string | null;
   sent_at: string | null;
   // Tracking data
   opened_at?: string | null;
   opened_count?: number;
   clicked_at?: string | null;
   clicked_count?: number;
   clicked_links?: { link: string; clicked_at: string }[];
 }
 
 export function EmailTrackingHistory() {
   const [history, setHistory] = useState<EmailHistoryItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState<string>("all");
   const [trackingFilter, setTrackingFilter] = useState<string>("all");
   const [selectedEmail, setSelectedEmail] = useState<EmailHistoryItem | null>(null);
 
   useEffect(() => {
     fetchHistory();
   }, [statusFilter]);
 
   async function fetchHistory() {
     setLoading(true);
     try {
       // First fetch communication history (emails only)
       let query = supabase
         .from("communication_history")
         .select("*")
         .eq("channel", "email")
         .order("sent_at", { ascending: false })
         .limit(100);
 
       if (statusFilter !== "all") {
         query = query.eq("status", statusFilter);
       }
 
       const { data: emails, error } = await query;
 
       if (error) throw error;
 
       // Fetch tracking data for these emails
       const emailIds = emails?.map((e) => e.id) || [];
       
       const { data: trackingData } = await supabase
         .from("email_tracking")
         .select("*")
         .in("communication_id", emailIds);
 
       // Merge tracking data with emails
       const emailsWithTracking = (emails || []).map((email) => {
         const tracking = trackingData?.find((t) => t.communication_id === email.id);
         return {
           ...email,
           opened_at: tracking?.opened_at,
           opened_count: tracking?.opened_count || 0,
           clicked_at: tracking?.clicked_at,
           clicked_count: tracking?.clicked_count || 0,
           clicked_links: tracking?.clicked_links as { link: string; clicked_at: string }[] || [],
         };
       });
 
       setHistory(emailsWithTracking);
     } catch (error) {
       console.error("Error fetching email history:", error);
     } finally {
       setLoading(false);
     }
   }
 
   const filteredHistory = history.filter((email) => {
     if (trackingFilter === "all") return true;
     if (trackingFilter === "opened") return email.opened_count && email.opened_count > 0;
     if (trackingFilter === "clicked") return email.clicked_count && email.clicked_count > 0;
     if (trackingFilter === "not_opened") return !email.opened_at;
     return true;
   });
 
   const getStatusBadge = (status: string | null) => {
     if (status === "sent") {
       return (
         <Badge variant="default" className="bg-green-600">
           <CheckCircle className="h-3 w-3 mr-1" />
           Enviado
         </Badge>
       );
     }
     if (status === "failed") {
       return (
         <Badge variant="destructive">
           <XCircle className="h-3 w-3 mr-1" />
           Falhou
         </Badge>
       );
     }
     return (
       <Badge variant="secondary">
         <Clock className="h-3 w-3 mr-1" />
         {status || "Pendente"}
       </Badge>
     );
   };
 
   const getTrackingIndicators = (email: EmailHistoryItem) => {
     return (
       <div className="flex items-center gap-2">
         <Tooltip>
           <TooltipTrigger asChild>
             <div
               className={`flex items-center gap-1 ${
                 email.opened_count && email.opened_count > 0
                   ? "text-green-600"
                   : "text-muted-foreground"
               }`}
             >
               <Eye className="h-4 w-4" />
               <span className="text-xs">{email.opened_count || 0}</span>
             </div>
           </TooltipTrigger>
           <TooltipContent>
             {email.opened_at
               ? `Aberto ${email.opened_count}x - Última: ${format(new Date(email.opened_at), "dd/MM HH:mm", { locale: ptBR })}`
               : "Não aberto ainda"}
           </TooltipContent>
         </Tooltip>
 
         <Tooltip>
           <TooltipTrigger asChild>
             <div
               className={`flex items-center gap-1 ${
                 email.clicked_count && email.clicked_count > 0
                   ? "text-blue-600"
                   : "text-muted-foreground"
               }`}
             >
               <MousePointerClick className="h-4 w-4" />
               <span className="text-xs">{email.clicked_count || 0}</span>
             </div>
           </TooltipTrigger>
           <TooltipContent>
             {email.clicked_at
               ? `Clicou ${email.clicked_count}x - Última: ${format(new Date(email.clicked_at), "dd/MM HH:mm", { locale: ptBR })}`
               : "Nenhum clique ainda"}
           </TooltipContent>
         </Tooltip>
       </div>
     );
   };
 
   return (
     <>
       <Card>
         <CardHeader>
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
             <CardTitle className="text-lg">Histórico de Emails Enviados</CardTitle>
             <div className="flex flex-wrap gap-2">
               <Select value={statusFilter} onValueChange={setStatusFilter}>
                 <SelectTrigger className="w-[130px]">
                   <SelectValue placeholder="Status" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todos status</SelectItem>
                   <SelectItem value="sent">Enviados</SelectItem>
                   <SelectItem value="failed">Falhos</SelectItem>
                 </SelectContent>
               </Select>
 
               <Select value={trackingFilter} onValueChange={setTrackingFilter}>
                 <SelectTrigger className="w-[140px]">
                   <SelectValue placeholder="Engajamento" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todo engajamento</SelectItem>
                   <SelectItem value="opened">Abertos</SelectItem>
                   <SelectItem value="clicked">Com cliques</SelectItem>
                   <SelectItem value="not_opened">Não abertos</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           {loading ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
           ) : filteredHistory.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p>Nenhum email encontrado</p>
             </div>
           ) : (
             <div className="border rounded-lg overflow-hidden">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Data</TableHead>
                     <TableHead>Destinatário</TableHead>
                     <TableHead>Assunto</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Engajamento</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredHistory.map((item) => (
                     <TableRow key={item.id}>
                       <TableCell className="text-sm">
                         {item.sent_at
                           ? format(new Date(item.sent_at), "dd/MM/yy HH:mm", { locale: ptBR })
                           : "-"}
                       </TableCell>
                       <TableCell>
                         <div className="font-medium text-sm">
                           {item.recipient_name || "Sem nome"}
                         </div>
                         <div className="text-xs text-muted-foreground">
                           {item.recipient_email}
                         </div>
                       </TableCell>
                       <TableCell className="max-w-[200px]">
                         <div className="truncate text-sm">
                           {item.subject || "(Sem assunto)"}
                         </div>
                       </TableCell>
                       <TableCell>{getStatusBadge(item.status)}</TableCell>
                       <TableCell>{getTrackingIndicators(item)}</TableCell>
                       <TableCell>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => setSelectedEmail(item)}
                         >
                           <ExternalLink className="h-4 w-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Email Detail Dialog */}
       <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Mail className="h-5 w-5" />
               Detalhes do Email
             </DialogTitle>
           </DialogHeader>
           {selectedEmail && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-muted-foreground">Destinatário:</span>
                   <p className="font-medium">{selectedEmail.recipient_name}</p>
                   <p className="text-muted-foreground">{selectedEmail.recipient_email}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Enviado em:</span>
                   <p className="font-medium">
                     {selectedEmail.sent_at
                       ? format(new Date(selectedEmail.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                       : "-"}
                   </p>
                 </div>
               </div>
 
               {selectedEmail.subject && (
                 <div>
                   <span className="text-sm text-muted-foreground">Assunto:</span>
                   <p className="font-medium">{selectedEmail.subject}</p>
                 </div>
               )}
 
               <div className="p-3 bg-muted rounded-lg space-y-2">
                 <div className="text-sm font-medium">Métricas de Engajamento</div>
                 <div className="grid grid-cols-2 gap-3 text-sm">
                   <div className="flex items-center gap-2">
                     <Eye className={selectedEmail.opened_count ? "text-green-600" : "text-muted-foreground"} />
                     <div>
                       <p className="font-medium">{selectedEmail.opened_count || 0} aberturas</p>
                       {selectedEmail.opened_at && (
                         <p className="text-xs text-muted-foreground">
                           Última: {format(new Date(selectedEmail.opened_at), "dd/MM HH:mm")}
                         </p>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <MousePointerClick className={selectedEmail.clicked_count ? "text-blue-600" : "text-muted-foreground"} />
                     <div>
                       <p className="font-medium">{selectedEmail.clicked_count || 0} cliques</p>
                       {selectedEmail.clicked_at && (
                         <p className="text-xs text-muted-foreground">
                           Último: {format(new Date(selectedEmail.clicked_at), "dd/MM HH:mm")}
                         </p>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
 
               {selectedEmail.clicked_links && selectedEmail.clicked_links.length > 0 && (
                 <div>
                   <span className="text-sm text-muted-foreground">Links clicados:</span>
                   <div className="mt-2 space-y-1">
                     {selectedEmail.clicked_links.map((link, index) => (
                       <div key={index} className="text-xs p-2 bg-muted/50 rounded flex justify-between">
                         <span className="truncate max-w-[250px]">{link.link}</span>
                         <span className="text-muted-foreground">
                           {format(new Date(link.clicked_at), "dd/MM HH:mm")}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
 
               <div>
                 <span className="text-sm text-muted-foreground">Mensagem:</span>
                 <div className="mt-2 p-3 bg-muted rounded-lg whitespace-pre-wrap text-sm max-h-[200px] overflow-auto">
                   {selectedEmail.message}
                 </div>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </>
   );
 }