"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function logAdminAction(
    action: string,
    entityType: string,
    entityId?: string,
    details?: any
) {
    try {
        const supabase = await createClient();

        // Get IP Address
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const realIp = headersList.get("x-real-ip");
        const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : (realIp || "Unknown");

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        let actorId = null;
        let actorName = "System";

        if (user) {
            actorId = user.id;
            // Fetch profile for name
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (profile?.full_name) {
                actorName = profile.full_name;
            } else if (user.email) {
                actorName = user.email;
            }
        }

        const logEntry = {
            actor_id: actorId,
            actor_name: actorName,
            action,
            entity_type: entityType,
            entity_id: entityId || null,
            ip_address: ipAddress,
            details: details || null
        };

        const { error } = await supabase.from("activity_logs").insert(logEntry);

        if (error) {
            console.error("Failed to insert activity log:", error);
        }

    } catch (e) {
        console.error("Error in logAdminAction:", e);
    }
}
