import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/student/StudentDashboard";
import CourseDetail from "./pages/student/CourseDetail";
import LessonPlayer from "./pages/student/LessonPlayer";
import StudentAchievements from "./pages/student/StudentAchievements";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentFavorites from "./pages/student/StudentFavorites";
import StudentCommunity from "./pages/student/StudentCommunity";
import StudentProfile from "./pages/student/StudentProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import CourseEditor from "./pages/admin/CourseEditor";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentProfile from "./pages/admin/AdminStudentProfile";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminEbooks from "./pages/admin/AdminEbooks";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminReports from "./pages/admin/AdminReports";
import AdminEngagement from "./pages/admin/AdminEngagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requireStudent>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/course/:courseId"
              element={
                <ProtectedRoute requireStudent>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/lesson/:lessonId"
              element={
                <ProtectedRoute requireStudent>
                  <LessonPlayer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/achievements"
              element={
                <ProtectedRoute requireStudent>
                  <StudentAchievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificates"
              element={
                <ProtectedRoute requireStudent>
                  <StudentCertificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/favorites"
              element={
                <ProtectedRoute requireStudent>
                  <StudentFavorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/community"
              element={
                <ProtectedRoute requireStudent>
                  <StudentCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute requireStudent>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/:courseId"
              element={
                <ProtectedRoute requireAdmin>
                  <CourseEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:userId"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminStudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminEnrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ebooks"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminEbooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/community"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messaging"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminMessaging />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/engagement"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminEngagement />
                </ProtectedRoute>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;