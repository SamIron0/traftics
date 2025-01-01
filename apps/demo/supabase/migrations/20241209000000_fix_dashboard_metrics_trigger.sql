-- Drop existing triggers and function
DROP TRIGGER IF EXISTS refresh_dashboard_metrics_trigger ON sessions;
DROP TRIGGER IF EXISTS refresh_dashboard_metrics_page_events_trigger ON page_events;
DROP FUNCTION IF EXISTS refresh_dashboard_metrics();

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Set function ownership to postgres (superuser)
ALTER FUNCTION refresh_dashboard_metrics() OWNER TO postgres;

-- Grant execute permission to authenticated role
GRANT EXECUTE ON FUNCTION refresh_dashboard_metrics() TO authenticated;

-- Recreate triggers
CREATE TRIGGER refresh_dashboard_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON sessions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();

CREATE TRIGGER refresh_dashboard_metrics_page_events_trigger
AFTER INSERT OR UPDATE OR DELETE ON page_events
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();

-- Ensure authenticated role has necessary SELECT permissions
GRANT SELECT ON sessions TO authenticated;
GRANT SELECT ON page_events TO authenticated;
GRANT SELECT ON dashboard_metrics TO authenticated;
