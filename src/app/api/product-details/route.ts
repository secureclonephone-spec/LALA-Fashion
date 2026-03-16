import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        let query = supabase
            .from("products")
            .select("id, name, slug, sku, mrp, sale_price, image_url, stock_status");

        if (uuidRegex.test(id)) {
            query = query.eq("id", id);
        } else {
            query = query.or(`slug.eq.${id},sku.eq.${id}`);
        }

        const { data: product, error } = await query.single();

        if (error || !product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
