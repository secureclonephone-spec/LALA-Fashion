import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, city, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Use a direct client for public form submission to avoid cookie/session issues
        const { createClient: createSimpleClient } = await import('@supabase/supabase-js');
        const supabase = createSimpleClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase
            .from('contact_inquiries')
            .insert([
                { 
                    name, 
                    email, 
                    phone, 
                    city, 
                    subject, 
                    message,
                    status: 'NEW'
                }
            ]);

        if (error) {
            console.error("Supabase Insert Error:", error);
            return NextResponse.json(
                { error: "Failed to submit inquiry", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Inquiry submitted successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
