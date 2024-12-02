-- Add slug columns
ALTER TABLE organizations 
ADD COLUMN slug VARCHAR(255),
ADD CONSTRAINT organizations_slug_key UNIQUE (slug);

ALTER TABLE websites 
ADD COLUMN slug VARCHAR(255),
ADD CONSTRAINT websites_slug_key UNIQUE (slug);

ALTER TABLE heatmaps 
ADD COLUMN slug VARCHAR(255),
ADD CONSTRAINT heatmaps_slug_key UNIQUE (slug);

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
BEGIN
  -- Convert to lowercase and replace non-alphanumeric chars with hyphen
  RETURN lower(regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'),
    '^-+|-+$', '', 'g'
  ));
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure unique slug
CREATE OR REPLACE FUNCTION ensure_unique_slug()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer;
BEGIN
  -- Generate base slug from name if slug is not provided
  base_slug := COALESCE(NEW.slug, generate_slug(NEW.name));
  new_slug := base_slug;
  counter := 1;
  
  -- For organizations
  IF TG_TABLE_NAME = 'organizations' THEN
    WHILE EXISTS(SELECT 1 FROM organizations WHERE slug = new_slug AND id != NEW.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  -- For websites
  ELSIF TG_TABLE_NAME = 'websites' THEN
    WHILE EXISTS(SELECT 1 FROM websites WHERE slug = new_slug AND id != NEW.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  -- For heatmaps
  ELSIF TG_TABLE_NAME = 'heatmaps' THEN
    WHILE EXISTS(SELECT 1 FROM heatmaps WHERE slug = new_slug AND id != NEW.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  END IF;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically generate slugs
CREATE TRIGGER ensure_organization_slug
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_unique_slug();

CREATE TRIGGER ensure_website_slug
  BEFORE INSERT OR UPDATE ON websites
  FOR EACH ROW
  EXECUTE FUNCTION ensure_unique_slug();

CREATE TRIGGER ensure_heatmap_slug
  BEFORE INSERT OR UPDATE ON heatmaps
  FOR EACH ROW
  EXECUTE FUNCTION ensure_unique_slug();

-- Update existing records with slugs
UPDATE organizations SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE websites SET slug = generate_slug(name) WHERE slug IS NULL;
UPDATE heatmaps SET slug = generate_slug(name) WHERE slug IS NULL;

-- Make slug columns NOT NULL after populating existing records
ALTER TABLE organizations ALTER COLUMN slug SET NOT NULL;
ALTER TABLE websites ALTER COLUMN slug SET NOT NULL;
ALTER TABLE heatmaps ALTER COLUMN slug SET NOT NULL; 