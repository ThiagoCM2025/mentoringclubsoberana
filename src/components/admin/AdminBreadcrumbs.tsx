import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  admin: "Admin",
  courses: "Cursos",
  students: "Alunos",
  leads: "Leads",
  enrollments: "Matrículas",
  blog: "Blog",
  ebooks: "E-books",
  "mission-reviews": "Revisar Missões",
  messaging: "Comunicação",
  engagement: "Engajamento",
  notifications: "Notificações",
  community: "Comunidade",
  reports: "Relatórios",
  settings: "Configurações",
  new: "Novo",
  edit: "Editar",
};

export const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on the main dashboard
  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    
    // Check if it's a UUID (for dynamic routes)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    const label = isUuid 
      ? "Detalhes" 
      : routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin" className="flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.slice(1).map((crumb, index) => (
          <Fragment key={crumb.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
