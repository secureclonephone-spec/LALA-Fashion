"use server";

import { createClient } from "@/utils/supabase/server";

export async function getInquiries() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .rpc("get_admin_inquiries");

    if (error) {
        console.error("Error fetching inquiries:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function updateInquiryStatus(id: string, status: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .rpc("update_inquiry_status_admin", { 
            inquiry_id: id, 
            new_status: status 
        });

    if (error) {
        console.error("Error updating inquiry status:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function deleteInquiryAction(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .rpc("delete_inquiry_admin", { 
            inquiry_id: id 
        });

    if (error) {
        console.error("Error deleting inquiry:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
