import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_info');
  if (error) {
      console.log("RPC get_schema_info not found, trying a basic select limit 1");
      const { data: d1, error: e1 } = await supabase.from('products').select('*').limit(1);
      if (e1) {
          console.error(e1);
      } else {
          console.log("Products columns:", d1 ? Object.keys(d1[0] || {}) : "none");
      }
      
      const { data: d2, error: e2 } = await supabase.from('product_variants').select('*').limit(1);
      if (e2) {
          console.error("No product_variants table", e2.message);
      } else {
          console.log("Product_variants columns:", d2 ? Object.keys(d2[0] || {}) : "none");
      }
  } else {
      console.log(data);
  }
}

run();
