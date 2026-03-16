-- Drop the restrictive authenticated-only policy
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON public.homepage_categories;

-- Create a permissive policy that allows all users (including anon admin panel) to insert, update, delete
CREATE POLICY "Allow all users to manage" ON public.homepage_categories
    FOR ALL
    USING (true)
    WITH CHECK (true);
