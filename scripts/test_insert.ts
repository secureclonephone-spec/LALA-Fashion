
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const legacyKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobHBiYWRqdWlpY3NzeHNibXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTkzMTAsImV4cCI6MjA4ODQ3NTMxMH0.b39FqBOpnpY7qOrwC2EHeHpE_k0Avn4FI3sNEWWsqbc";
const modernKey = "sb_publishable_45C3M5w_ymVkVAymmBggGQ_pe1uD_P-";

async function testKey(name: string, key: string) {
  console.log(`\n--- Testing ${name} ---`);
  const supabase = createClient(supabaseUrl!, key);
  const { error } = await supabase
    .from('contact_inquiries')
    .insert([
      { 
        name: `Test ${name}`, 
        email: 'test@example.com', 
        subject: 'Test Subject', 
        message: `This is a test message using ${name} without select.`,
        status: 'NEW'
      }
    ]);

  if (error) {
    console.error(`${name} failed:`, error);
  } else {
    console.log(`${name} successful (no data returned due to no select)`);
  }
}

async function runTests() {
  await testKey('Legacy Key', legacyKey);
  await testKey('Modern Key', modernKey);
}

runTests();
