import { useState } from "react";
import { format, isSameDay, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, ListTodo, Clock, AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, TaskStatus, AdminTask } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { TaskCalendar } from "@/components/admin/tasks/TaskCalendar";
import { TaskCard } from "@/components/admin/tasks/TaskCard";
import { TaskDialog } from "@/components/admin/tasks/TaskDialog";
import { TaskViewDialog } from "@/components/admin/tasks/TaskViewDialog";
import { useNavigate } from "react-router-dom";
import { getBrazilNow } from "@/lib/dateUtils";

export default function AdminTasks() {
  const { tasks, admins, loading, myTasks, pendingTasks, todayTasks, overdueTasks, createTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(getBrazilNow());
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [viewingTask, setViewingTask] = useState<AdminTask | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "mine">("mine");
  const [statusFilter, setStatusFilter] = useState<"active" | "completed" | "all">("active");

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // View filter
    if (viewFilter === "mine" && task.assigned_to !== user?.id) return false;
    
    // Status filter
    if (statusFilter === "active" && (task.status === "completed" || task.status === "cancelled")) return false;
    if (statusFilter === "completed" && task.status !== "completed") return false;
    
    return true;
  });

  // Tasks for selected date
  const tasksForSelectedDate = selectedDate
    ? filteredTasks.filter((task) => isSameDay(new Date(task.due_date), selectedDate))
    : [];

  // Group tasks by date for list view
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const date = format(new Date(task.due_date), "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {} as Record<string, typeof tasks>);

  const sortedDates = Object.keys(groupedTasks).sort();

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const handleView = (task: AdminTask) => {
    setViewingTask(task);
  };

  const handleEdit = (task: AdminTask) => {
    setEditingTask(task);
  };

  const handleUpdate = async (id: string, updates: Partial<AdminTask>) => {
    await updateTask(id, updates);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      deleteTask(id);
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    if (isPast(date)) return `${format(date, "dd 'de' MMMM", { locale: ptBR })} (atrasada)`;
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tarefas</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas e lembretes</p>
          </div>
          <Button onClick={() => setNewTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <ListTodo className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Para hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Atrasadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => t.status === "completed").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={viewFilter} onValueChange={(v) => setViewFilter(v as "all" | "mine")}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mine">Minhas tarefas</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "active" | "completed" | "all")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
              <SelectItem value="all">Todas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <ListTodo className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-1">
                <TaskCalendar
                  tasks={filteredTasks}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              {/* Tasks for selected date */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedDate && (
                        isToday(selectedDate)
                          ? "Tarefas de Hoje"
                          : isTomorrow(selectedDate)
                          ? "Tarefas de Amanhã"
                          : `Tarefas de ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : tasksForSelectedDate.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma tarefa para esta data</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setNewTaskOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar tarefa
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasksForSelectedDate.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            currentUserId={user?.id}
                            onStatusChange={handleStatusChange}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewLead={(leadId) => navigate(`/admin/leads?lead=${leadId}`)}
                            onViewStudent={(studentId) => navigate(`/admin/alunos/${studentId}`)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : sortedDates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma tarefa encontrada</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setNewTaskOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira tarefa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateStr) => (
                  <div key={dateStr}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                      {formatDateHeader(dateStr)}
                    </h3>
                    <div className="space-y-2">
                      {groupedTasks[dateStr].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={user?.id}
                          onStatusChange={handleStatusChange}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onViewLead={(leadId) => navigate(`/admin/leads?lead=${leadId}`)}
                          onViewStudent={(studentId) => navigate(`/admin/alunos/${studentId}`)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Task Dialog */}
      <TaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        admins={admins}
        currentUserId={user?.id}
        onSubmit={createTask}
      />

      {/* Edit Task Dialog */}
      <TaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        admins={admins}
        currentUserId={user?.id}
        onSubmit={createTask}
        onUpdate={handleUpdate}
        mode="edit"
        task={editingTask || undefined}
      />

      {/* View Task Dialog */}
      <TaskViewDialog
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
        task={viewingTask}
        currentUserId={user?.id}
        onEdit={handleEdit}
        onViewLead={(leadId) => navigate(`/admin/leads?lead=${leadId}`)}
        onViewStudent={(studentId) => navigate(`/admin/alunos/${studentId}`)}
      />
    </AdminLayout>
  );
}
