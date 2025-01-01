 CREATE TABLE waitlist_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE waitlist_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting contacts (anyone can join waitlist)
CREATE POLICY "Enable insert for all users" ON waitlist_contacts
  FOR INSERT WITH CHECK (true);
