CREATE OR REPLACE FUNCTION create_default_dashboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboards (name, description, website_id, created_by)
  VALUES ('Project overview', 'Default project dashboard', NEW.id, auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_dashboard_trigger
AFTER INSERT ON websites
FOR EACH ROW
EXECUTE FUNCTION create_default_dashboard(); 