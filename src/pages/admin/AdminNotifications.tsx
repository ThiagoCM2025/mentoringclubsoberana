import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Info, AlertTriangle, CheckCircle2, AlertCircle, Eye, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationWithStudent {
  id: string;
  title: string;
  message: string;
  type: string | null;
  read: boolean | null;
  created_at: string | null;
  user_id: string;
  student_name?: string;
}

interface Course {
  id: string;
  title: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<NotificationWithStudent | null>(null);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchCourses();
    fetchNotifications();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .order("title");
    
    if (data) {
      setCourses(data);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);

    // Fetch notifications with profile data
    const { data: notificationsData, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
      return;
    }

    if (notificationsData) {
      // Fetch profile names for each notification
      const userIds = [...new Set(notificationsData.map(n => n.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      const notificationsWithNames = notificationsData.map(n => ({
        ...n,
        student_name: profileMap.get(n.user_id) || "Aluno"
      }));

      setNotifications(notificationsWithNames);
    }

    setLoading(false);
  };

  const getIcon = (type: string | null) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Sucesso</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Aviso</Badge>;
      case 'alert':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Alerta</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Info</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    // Type filter
    if (selectedType !== "all" && notification.type !== selectedType) {
      return false;
    }

    // Date from filter
    if (dateFrom && notification.created_at) {
      const notificationDate = new Date(notification.created_at);
      const fromDate = new Date(dateFrom);
      if (notificationDate < fromDate) return false;
    }

    // Date to filter
    if (dateTo && notification.created_at) {
      const notificationDate = new Date(notification.created_at);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (notificationDate > toDate) return false;
    }

    // Search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(search);
      const matchesMessage = notification.message.toLowerCase().includes(search);
      const matchesStudent = notification.student_name?.toLowerCase().includes(search);
      if (!matchesTitle && !matchesMessage && !matchesStudent) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedCourse("all");
    setSelectedType("all");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 admin-area">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-secondary" />
            <div>
              <h1 className="text-2xl font-bold text-cream">Histórico de Notificações</h1>
              <p className="text-cream/60">
                Visualize todas as notificações enviadas para os alunos
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg text-cream">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-cream">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/40" />
                  <Input
                    placeholder="Título, mensagem ou aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-zinc-900 border-secondary/30 text-cream placeholder:text-cream/40"
                  />
                </div>
              </div>

              {/* Type filter */}
              <div className="space-y-2">
                <Label className="text-cream">Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-zinc-900 border-secondary/30 text-cream">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date from */}
              <div className="space-y-2">
                <Label className="text-cream">Data inicial</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-zinc-900 border-secondary/30 text-cream"
                />
              </div>

              {/* Date to */}
              <div className="space-y-2">
                <Label className="text-cream">Data final</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-zinc-900 border-secondary/30 text-cream"
                />
              </div>

              {/* Clear filters */}
              <div className="space-y-2">
                <Label className="invisible">Ação</Label>
                <Button onClick={clearFilters} className="w-full bg-zinc-800 border border-secondary/40 text-cream hover:bg-secondary/20 hover:border-secondary">
                  Limpar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between text-cream">
              <span>Notificações Enviadas</span>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">{filteredNotifications.length} resultados</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-cream/60">
                Carregando notificações...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-secondary/20 hover:bg-zinc-800/50">
                      <TableHead className="w-[180px] text-cream/80">Data</TableHead>
                      <TableHead className="text-cream/80">Título</TableHead>
                      <TableHead className="text-cream/80">Aluno</TableHead>
                      <TableHead className="w-[100px] text-cream/80">Tipo</TableHead>
                      <TableHead className="w-[100px] text-cream/80">Status</TableHead>
                      <TableHead className="w-[80px]">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id} className="border-secondary/10">
                        <TableCell className="text-sm text-cream/70">
                          {formatDate(notification.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIcon(notification.type)}
                            <span className="font-medium truncate max-w-[200px] text-cream">
                              {notification.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-cream/80">{notification.student_name}</TableCell>
                        <TableCell>{getTypeBadge(notification.type)}</TableCell>
                        <TableCell>
                          {notification.read ? (
                            <Badge variant="outline" className="bg-zinc-800 text-cream/60 border-secondary/30">Lida</Badge>
                          ) : (
                            <Badge variant="default" className="bg-primary">Não lida</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedNotification(notification)}
                            className="text-cream/70 hover:text-cream hover:bg-zinc-800"
                          >
                            <Eye className="h-4 w-4" />
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
      </div>

      {/* Dialog para ver mensagem completa */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && getIcon(selectedNotification.type)}
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Enviada em:</span>
                <p className="font-medium">{formatDate(selectedNotification?.created_at || null)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Destinatário:</span>
                <p className="font-medium">{selectedNotification?.student_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <div className="mt-1">{selectedNotification && getTypeBadge(selectedNotification.type)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  {selectedNotification?.read ? (
                    <Badge variant="outline" className="bg-muted">Lida</Badge>
                  ) : (
                    <Badge variant="default" className="bg-primary">Não lida</Badge>
                  )}
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Mensagem:</span>
              <p className="mt-2 text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 leading-relaxed">
                {selectedNotification?.message}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
