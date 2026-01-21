-- Dropar a política incompleta
DROP POLICY IF EXISTS "Admins can manage entity tags" ON entity_tags;

-- Recriar com USING e WITH CHECK para permitir INSERT
CREATE POLICY "Admins can manage entity tags"
ON entity_tags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);