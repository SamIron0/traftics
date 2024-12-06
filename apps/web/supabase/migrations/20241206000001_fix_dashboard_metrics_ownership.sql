-- Drop existing objects first
DROP TRIGGER IF EXISTS refresh_dashboard_metrics_trigger ON sessions;
DROP TRIGGER IF EXISTS refresh_dashboard_metrics_page_events_trigger ON page_events;
DROP FUNCTION IF EXISTS refresh_dashboard_metrics();
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics;

-- Recreate materialized view with proper ownership
CREATE MATERIALIZED VIEW dashboard_metrics AS
WITH page_visits AS (
  SELECT 
    site_id,
    href as page,
    COUNT(*) as visit_count
  FROM page_events
  GROUP BY site_id, href
),
session_metrics AS (
  SELECT
    s.site_id,
    COUNT(*) as total_sessions,
    AVG(duration) as avg_duration,
    COUNT(DISTINCT pe.href) as pages_per_session
  FROM sessions s
  LEFT JOIN page_events pe ON s.id = pe.session_id
  GROUP BY s.site_id
)
SELECT 
  sm.site_id,
  sm.total_sessions,
  sm.avg_duration,
  sm.pages_per_session,
  json_agg(json_build_object(
    'page', pv.page,
    'count', pv.visit_count
  )) as top_pages
FROM session_metrics sm
LEFT JOIN page_visits pv ON sm.site_id = pv.site_id
GROUP BY sm.site_id, sm.total_sessions, sm.avg_duration, sm.pages_per_session;

-- Set ownership to postgres
ALTER MATERIALIZED VIEW dashboard_metrics OWNER TO postgres;

-- Grant necessary permissions
GRANT SELECT ON dashboard_metrics TO authenticated;
GRANT SELECT ON dashboard_metrics TO service_role;

-- Create refresh function owned by postgres
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Set function ownership
ALTER FUNCTION refresh_dashboard_metrics() OWNER TO postgres;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO service_role;

-- Create triggers
CREATE TRIGGER refresh_dashboard_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON sessions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();

CREATE TRIGGER refresh_dashboard_metrics_page_events_trigger
AFTER INSERT OR UPDATE OR DELETE ON page_events
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics(); 