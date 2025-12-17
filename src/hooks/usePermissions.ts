import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface AdminPermissions {
  can_manage_courses: boolean;
  can_manage_students: boolean;
  can_manage_enrollments: boolean;
  can_manage_leads: boolean;
  can_view_reports: boolean;
  can_send_notifications: boolean;
  can_manage_admins: boolean;
}

const defaultPermissions: AdminPermissions = {
  can_manage_courses: false,
  can_manage_students: false,
  can_manage_enrollments: false,
  can_manage_leads: false,
  can_view_reports: false,
  can_send_notifications: false,
  can_manage_admins: false,
};

export function usePermissions() {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    async function fetchPermissions() {
      if (!user || !isAdmin) {
        setPermissions(defaultPermissions);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_permissions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching permissions:", error);
        // If no permissions found, assume super admin (first admin)
        setPermissions({
          can_manage_courses: true,
          can_manage_students: true,
          can_manage_enrollments: true,
          can_manage_leads: true,
          can_view_reports: true,
          can_send_notifications: true,
          can_manage_admins: true,
        });
        setIsSuperAdmin(true);
      } else if (data) {
        setPermissions({
          can_manage_courses: data.can_manage_courses,
          can_manage_students: data.can_manage_students,
          can_manage_enrollments: data.can_manage_enrollments,
          can_manage_leads: data.can_manage_leads,
          can_view_reports: data.can_view_reports,
          can_send_notifications: data.can_send_notifications,
          can_manage_admins: data.can_manage_admins,
        });
        setIsSuperAdmin(data.can_manage_admins);
      } else {
        // No permissions record - assume super admin (legacy admin)
        setPermissions({
          can_manage_courses: true,
          can_manage_students: true,
          can_manage_enrollments: true,
          can_manage_leads: true,
          can_view_reports: true,
          can_send_notifications: true,
          can_manage_admins: true,
        });
        setIsSuperAdmin(true);
      }

      setLoading(false);
    }

    fetchPermissions();
  }, [user, isAdmin]);

  return {
    permissions,
    loading,
    isSuperAdmin,
    canManageCourses: permissions.can_manage_courses,
    canManageStudents: permissions.can_manage_students,
    canManageEnrollments: permissions.can_manage_enrollments,
    canManageLeads: permissions.can_manage_leads,
    canViewReports: permissions.can_view_reports,
    canSendNotifications: permissions.can_send_notifications,
    canManageAdmins: permissions.can_manage_admins,
  };
}
