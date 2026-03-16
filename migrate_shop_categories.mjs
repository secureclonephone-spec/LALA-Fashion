import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:$$Pakistanii9988@db.chlpbadjuiicssxsbmpq.supabase.co:5432/postgres',
});

const runMigration = async () => {
  try {
    await client.connect();
    console.log('Connected to database.');

    const createTableQuery = `
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
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_policies
              WHERE tablename = 'homepage_categories' AND policyname = 'Allow public read access'
          ) THEN
              CREATE POLICY "Allow public read access" ON public.homepage_categories
                  FOR SELECT USING (true);
          END IF;
      END $$;

      -- Allow authenticated users to manage
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_policies
              WHERE tablename = 'homepage_categories' AND policyname = 'Allow authenticated users to manage'
          ) THEN
              CREATE POLICY "Allow authenticated users to manage" ON public.homepage_categories
                  FOR ALL USING (auth.role() = 'authenticated');
          END IF;
      END $$;
    `;

    await client.query(createTableQuery);
    console.log('Table \`homepage_categories\` created successfully.');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
};

runMigration();
