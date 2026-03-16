import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shippingData, cartItems, subtotal, couponCode, discountAmount, finalTotal } = body;

    if (!shippingData || !cartItems?.length) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const addressStr = [
      shippingData.fullName,
      shippingData.address,
      shippingData.landmark,
      shippingData.city,
      shippingData.zip,
    ]
      .filter(Boolean)
      .join(", ");

    const orderTotal = finalTotal ?? subtotal;

    // 1. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderId,
        total_amount: orderTotal,
        status: "pending",
        payment_method: "Cash on Delivery",
        payment_status: "pending",
        shipping_address: addressStr,
        contact_phone: shippingData.contact,
        coupon_code: couponCode || null,
        discount_amount: discountAmount || 0,
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderData?.id) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: orderError?.message || "Failed to create order" },
        { status: 500 }
      );
    }

    // 2. Insert order_items
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const orderItemsPayload = cartItems.map((item: any) => {
      const isValidUUID = uuidRegex.test(item.productId || "");
      return {
        order_id: orderData.id,
        ...(isValidUUID ? { product_id: item.productId } : {}),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        selected_color: item.selectedColor || null,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
    if (itemsError) {
      console.warn("Order items insert warning:", itemsError.message);
    }

    // 3. If coupon was used — record usage and increment used_count
    if (couponCode && discountAmount > 0) {
      const { data: couponRow } = await supabase
        .from("coupons")
        .select("id, used_count")
        .eq("code", couponCode.toUpperCase())
        .maybeSingle();

      if (couponRow) {
        // Insert usage record
        await supabase.from("coupon_usages").insert({
          coupon_id: couponRow.id,
          coupon_code: couponCode.toUpperCase(),
          customer_email: shippingData.email || shippingData.contact, // use email if available
          order_id: orderData.id,
          discount_amount: discountAmount,
        });

        // Increment used_count
        await supabase
          .from("coupons")
          .update({ used_count: (couponRow.used_count || 0) + 1 })
          .eq("id", couponRow.id);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.order_number,
      dbOrderId: orderData.id,
    });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("order_number");

  if (!orderNumber) {
    return NextResponse.json({ error: "order_number is required" }, { status: 400 });
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        discount_amount,
        coupon_code,
        status,
        payment_method,
        payment_status,
        shipping_address,
        contact_phone,
        created_at,
        items:order_items(
          id,
          quantity,
          unit_price,
          total_price,
          selected_color,
          product:products!product_id(
            name,
            image_url
          )
        )
      `
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error) {
      console.error("GET /api/orders error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("GET /api/orders exception:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
