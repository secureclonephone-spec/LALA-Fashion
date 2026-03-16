import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, customerEmail, cartItems } = body as {
      code: string;
      subtotal: number;
      customerEmail?: string;
      cartItems: Array<{
        productId: string;
        categoryId?: string;
        price: number;
        quantity: number;
      }>;
    };

    const fail = (message: string, status = 200) =>
      NextResponse.json({ valid: false, message }, { status });

    if (!code?.trim()) return fail("Please enter a coupon code.");

    const supabase = await createClient();

    // 1. Fetch the coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("Coupon fetch error:", error);
      return fail("An error occurred. Please try again.", 500);
    }
    if (!coupon) return fail("Invalid coupon code.");
    if (coupon.status !== "ACTIVE") return fail("This coupon is no longer active.");

    // 2. Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return fail("This coupon has expired.");
    }

    // 3. Check global usage limit
    if (coupon.usage_limit !== null && (coupon.used_count ?? 0) >= coupon.usage_limit) {
      return fail("This coupon has reached its usage limit.");
    }

    // 4. Check minimum order amount
    if (coupon.min_order_amount !== null && subtotal < Number(coupon.min_order_amount)) {
      return fail(`Minimum order of Rs ${Number(coupon.min_order_amount).toFixed(0)} required for this coupon.`);
    }

    // 5. Limit per customer
    if (coupon.limit_per_customer && customerEmail) {
      const { count } = await supabase
        .from("coupon_usages")
        .select("id", { count: "exact", head: true })
        .eq("coupon_id", coupon.id)
        .eq("customer_email", customerEmail.toLowerCase());

      if ((count ?? 0) > 0) return fail("You have already used this coupon.");
    }

    // 6. Only new users
    if (coupon.only_new_users && customerEmail) {
      const { count: priorUsage } = await supabase
        .from("coupon_usages")
        .select("id", { count: "exact", head: true })
        .eq("customer_email", customerEmail.toLowerCase());

      if ((priorUsage ?? 0) > 0) {
        return fail("This coupon is only valid for first-time customers.");
      }
    }

    // 7. Applies To — validate against cart
    let eligibleSubtotal = Number(subtotal);

    if (coupon.applies_to === "Specific Products") {
      const appliedIds: string[] = coupon.applied_product_ids || [];
      if (appliedIds.length > 0) {
        const eligible = cartItems.filter((item) => appliedIds.includes(item.productId));
        if (eligible.length === 0) {
          return fail("This coupon is not valid for the products in your cart.");
        }
        eligibleSubtotal = eligible.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
      }
    }

    if (coupon.applies_to === "Specific Categories") {
      const appliedCatIds: string[] = coupon.applied_category_ids || [];
      if (appliedCatIds.length > 0) {
        const eligible = cartItems.filter(
          (item) => item.categoryId && appliedCatIds.includes(item.categoryId)
        );
        if (eligible.length === 0) {
          return fail("This coupon is not valid for the categories in your cart.");
        }
        eligibleSubtotal = eligible.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
      }
    }

    // 8. Compute discount
    let discountAmount = 0;
    const dv = Number(coupon.discount_value);
    if (coupon.discount_type === "Percentage (%)") {
      discountAmount = (eligibleSubtotal * dv) / 100;
    } else {
      discountAmount = Math.min(dv, eligibleSubtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalTotal = Math.max(0, Number(subtotal) - discountAmount);

    return NextResponse.json({
      valid: true,
      message: `Coupon applied! You save Rs ${discountAmount.toFixed(0)}.`,
      discount_amount: discountAmount,
      final_total: finalTotal,
      coupon_id: coupon.id,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
    });
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { valid: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
