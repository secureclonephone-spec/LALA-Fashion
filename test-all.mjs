import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chlpbadjuiicssxsbmpq.supabase.co';
const supabaseKey = 'sb_publishable_45C3M5w_ymVkVAymmBggGQ_pe1uD_P-';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking Orders...");
    const orders = await supabase.from('orders').select('*, items:order_items(product:products!product_id(name, image_url))').limit(1);
    if (orders.error) console.log("Orders Error:", orders.error);
    else console.log("Orders OK");

    console.log("Checking Activity...");
    const activity = await supabase.from('activity_logs').select('*, user:profiles!actor_id(full_name, email)').limit(1);
    if (activity.error) console.log("Activity Error:", activity.error);
    else console.log("Activity OK");

    console.log("Checking Newsletter...");
    const news = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(1);
    if (news.error) console.log("Newsletter Error:", news.error);
    else console.log("Newsletter OK");
}

check();
