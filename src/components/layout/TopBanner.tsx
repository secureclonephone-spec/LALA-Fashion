import { createClient } from "@/utils/supabase/server";
import TopBannerClient from "@/components/layout/TopBannerClient";

export default async function TopBanner() {
    const supabase = await createClient();

    const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (!data || data.length === 0) return null;

    // Filter by date range in JS (avoids complex chained OR queries in Supabase)
    const now = new Date();
    const active = data.find((b) => {
        const afterStart = !b.start_date || new Date(b.start_date) <= now;
        const beforeEnd = !b.end_date || new Date(b.end_date) >= now;
        return afterStart && beforeEnd;
    });

    if (!active) return null;

    return <TopBannerClient banner={active} />;
}
