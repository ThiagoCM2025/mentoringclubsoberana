-- Populate import_lists from existing import_logs (retroactive sync)
INSERT INTO import_lists (name, batch_id, source_filter, lead_count, created_at)
SELECT 
  COALESCE(filename, 'Lista ' || LEFT(batch_id::text, 8)),
  batch_id,
  'batch:' || batch_id::text,
  COALESCE(imported, 0) + COALESCE(updated, 0),
  created_at
FROM import_logs
WHERE batch_id IS NOT NULL
AND batch_id NOT IN (SELECT batch_id FROM import_lists)
ON CONFLICT (batch_id) DO NOTHING;