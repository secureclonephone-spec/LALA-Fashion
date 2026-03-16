const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:$$Pakistanii9988@db.chlpbadjuiicssxsbmpq.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'hero_slides' OR tablename = 'homepage_categories';
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
