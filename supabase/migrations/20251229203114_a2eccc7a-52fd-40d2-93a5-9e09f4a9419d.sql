-- 1. Criar função SECURITY DEFINER para verificar super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_permissions
    WHERE user_id = _user_id
      AND can_manage_admins = true
  )
$$;

-- 2. Remover políticas problemáticas que causam recursão infinita
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Admins can view permissions" ON public.admin_permissions;

-- 3. Criar novas políticas usando funções SECURITY DEFINER
-- Política para admins visualizarem permissões
CREATE POLICY "Admins can view all permissions"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política para super admins inserirem permissões
CREATE POLICY "Super admins can insert permissions"
ON public.admin_permissions
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Política para super admins atualizarem permissões
CREATE POLICY "Super admins can update permissions"
ON public.admin_permissions
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Política para super admins deletarem permissões
CREATE POLICY "Super admins can delete permissions"
ON public.admin_permissions
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 4. Garantir que o admin existente (Thiago) tenha registro com todas as permissões
INSERT INTO public.admin_permissions (
  user_id,
  can_manage_courses,
  can_manage_students,
  can_manage_enrollments,
  can_manage_leads,
  can_view_reports,
  can_send_notifications,
  can_manage_admins
) VALUES (
  '620b310f-d7c7-4aba-b3bb-0289e7ffdc75',
  true, true, true, true, true, true, true
)
ON CONFLICT (user_id) DO UPDATE SET
  can_manage_admins = true;