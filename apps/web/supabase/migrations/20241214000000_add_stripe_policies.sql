-- Allow users to read their own customer record
CREATE POLICY "Users can view own customer record" ON customers
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to create their own customer record
CREATE POLICY "Users can create own customer record" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own customer record
CREATE POLICY "Users can update own customer record" ON customers
  FOR UPDATE USING (auth.uid() = id);
