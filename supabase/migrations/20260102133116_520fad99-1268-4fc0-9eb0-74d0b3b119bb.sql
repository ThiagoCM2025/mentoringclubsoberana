-- Índice para queries de heatmap por página
CREATE INDEX IF NOT EXISTS idx_lead_events_click_position 
ON lead_events ((event_data->>'page_url'), event_type) 
WHERE event_type = 'click_position';

-- Índice para queries de tempo por página
CREATE INDEX IF NOT EXISTS idx_lead_events_page_exit 
ON lead_events (page_url, event_type) 
WHERE event_type = 'page_exit';