import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chlpbadjuiicssxsbmpq.supabase.co';
const supabaseKey = 'sb_publishable_45C3M5w_ymVkVAymmBggGQ_pe1uD_P-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("--- TEST WITH PUBLISHABLE KEY ---");
    const r1 = await supabase.from('categories').select('id, name, parent_id');
    console.log("TEST 1 ERROR:", r1.error ? JSON.stringify(r1.error) : "OK");

    const r2 = await supabase.from('categories').select(`
        id, name, slug, description, parent_id, image_url, created_at,
        parent:categories!parent_id(id, name),
        subcategories:categories!parent_id(id)
    `);
    console.log("TEST 2 ERROR:", r2.error ? JSON.stringify(r2.error) : "OK");

    // Testing the previously failing query for products on the orders page 
    // Wait, the products page had `product:products!product_id(name, image_url)`
    const r3 = await supabase.from('orders').select(`
        *,
        user:profiles!user_id(full_name, email, avatar_url),
        items:order_items(id, quantity, unit_price, total_price, product:products!product_id(name, image_url))
    `);
    console.log("TEST 3 ERROR:", r3.error ? JSON.stringify(r3.error) : "OK");
}

run().catch(console.error);
