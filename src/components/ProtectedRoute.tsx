import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStudent?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireStudent = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin trying to access student area → redirect to admin
  if (requireStudent && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Student trying to access admin area → redirect to student
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};