CREATE TABLE IF NOT EXISTS public.homepage_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.homepage_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.homepage_categories
    FOR SELECT USING (true);

-- Allow authenticated users to manage
CREATE POLICY "Allow authenticated users to manage" ON public.homepage_categories
    FOR ALL USING (auth.role() = 'authenticated');
