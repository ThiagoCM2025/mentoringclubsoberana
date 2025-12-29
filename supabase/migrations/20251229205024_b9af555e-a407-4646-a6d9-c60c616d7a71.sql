-- Atualizar função handle_new_user para não adicionar role 'student' para admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Só adiciona role 'student' se NÃO for criação de admin
  -- Admins são criados via edge function que adiciona o role manualmente
  IF NEW.raw_user_meta_data ->> 'is_admin' IS NULL OR NEW.raw_user_meta_data ->> 'is_admin' != 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar função para notificar novos administradores
CREATE OR REPLACE FUNCTION public.notify_new_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_name TEXT;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT full_name INTO v_admin_name 
    FROM public.profiles 
    WHERE user_id = NEW.user_id;
    
    PERFORM create_admin_notification(
      'new_admin',
      'Novo Administrador',
      format('Novo administrador cadastrado: %s', COALESCE(v_admin_name, 'Admin')),
      jsonb_build_object('user_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger para notificar novos admins
DROP TRIGGER IF EXISTS on_new_admin_created ON public.user_roles;
CREATE TRIGGER on_new_admin_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_admin();