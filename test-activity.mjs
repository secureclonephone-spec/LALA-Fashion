import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chlpbadjuiicssxsbmpq.supabase.co';
const supabaseKey = 'sb_publishable_45C3M5w_ymVkVAymmBggGQ_pe1uD_P-';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("--- TEST ACTIVITY LOGS ---");
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            *,
            user:profiles!actor_id(full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error("ERROR:", error);
        console.log("Stringified error:", JSON.stringify(error));
        console.log("Keys in error:", Object.keys(error));
    } else {
        console.log("SUCCESS, rows:", data.length);
    }
}

run().catch(console.error);
