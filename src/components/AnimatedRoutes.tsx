import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PageTransition from "@/components/PageTransition";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ProgramDetail from "@/pages/ProgramDetail";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import StudentDashboard from "@/pages/student/StudentDashboard";
import CourseDetail from "@/pages/student/CourseDetail";
import LessonPlayer from "@/pages/student/LessonPlayer";
import StudentAchievements from "@/pages/student/StudentAchievements";
import StudentCertificates from "@/pages/student/StudentCertificates";
import StudentFavorites from "@/pages/student/StudentFavorites";
import StudentCommunity from "@/pages/student/StudentCommunity";
import StudentProfile from "@/pages/student/StudentProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCourses from "@/pages/admin/AdminCourses";
import CourseEditor from "@/pages/admin/CourseEditor";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminStudentProfile from "@/pages/admin/AdminStudentProfile";
import AdminEnrollments from "@/pages/admin/AdminEnrollments";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminEbooks from "@/pages/admin/AdminEbooks";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminCommunity from "@/pages/admin/AdminCommunity";
import AdminMessaging from "@/pages/admin/AdminMessaging";
import AdminReports from "@/pages/admin/AdminReports";
import AdminEngagement from "@/pages/admin/AdminEngagement";
import AdminBlog from "@/pages/admin/AdminBlog";
import BlogEditor from "@/pages/admin/BlogEditor";
import ExperienceStartLanding from "@/pages/ExperienceStartLanding";
import NotFound from "@/pages/NotFound";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/programa/:slug" element={<PageTransition><ProgramDetail /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/experience-start" element={<PageTransition><ExperienceStartLanding /></PageTransition>} />
        
        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><CourseDetail /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/lesson/:lessonId"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><LessonPlayer /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/achievements"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentAchievements /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentCertificates /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/favorites"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentFavorites /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/community"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentCommunity /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute requireStudent>
              <PageTransition><StudentProfile /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminCourses /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><CourseEditor /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminStudents /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:userId"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminStudentProfile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminEnrollments /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminLeads /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ebooks"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminEbooks /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminSettings /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminNotifications /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/community"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminCommunity /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messaging"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminMessaging /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminReports /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/engagement"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminEngagement /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><AdminBlog /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/:id"
          element={
            <ProtectedRoute requireAdmin>
              <PageTransition><BlogEditor /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
