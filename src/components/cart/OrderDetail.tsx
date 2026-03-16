"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ClipboardCheck, Phone, MapPin, Package, ExternalLink } from "lucide-react";
import { getCookie } from "@utils/getCartToken";
import { ORDER_ID } from "@utils/constants";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color: string | null;
  product: { name: string; image_url: string } | null;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  contact_phone: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetail() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const orderId = getCookie(ORDER_ID);
    if (!orderId) { setIsLoading(false); return; }

    fetch(`/api/orders?order_number=${encodeURIComponent(orderId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopyId = () => {
    if (!order) return;
    const trackingId = `#ST-${order.order_number}`;
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 animate-pulse">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] shadow-xl max-w-lg mx-auto p-8">
        <p className="text-lg text-slate-700 font-semibold mb-6">
          Your order has been placed successfully!
        </p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          Continue Shopping <ExternalLink size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-white w-full max-w-lg rounded-[2rem] p-8 md:p-10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] text-center animate-in fade-in zoom-in duration-500 mx-auto">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#F0FDF4' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30" style={{ backgroundColor: '#22C55E' }}>
          <Check className="text-white w-7 h-7" strokeWidth={3} />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-2">Congratulations!</h2>
      <p className="text-[#64748B] font-medium mb-8">Your order has been successfully placed.</p>

      {/* Order Brief Card */}
      <div className="space-y-4 mb-6">
        {(order.items || []).map((item, idx) => (
          <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-left flex items-center gap-4 transition-hover hover:border-blue-200 hover:shadow-sm">
            <div className="w-16 h-16 bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 relative border border-slate-200">
              {item.product?.image_url ? (
                <Image 
                  src={item.product.image_url} 
                  alt={item.product.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                  <Package size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-[#1E293B] truncate text-sm">{item.product?.name || "Product"}</h4>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Qty: {item.quantity}</p>
                {item.selected_color && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{item.selected_color}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1E293B] text-sm">Rs. {item.total_price?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center py-4 px-2 mb-6 border-b border-[#E2E8F0]">
        <span className="text-sm font-semibold text-[#64748B]">Total Amount Paid</span>
        <span className="text-xl font-black text-[#1E293B]">Rs. {order.total_amount?.toLocaleString()}</span>
      </div>

      {/* Tracking ID Section */}
      <div className="mb-8">
        <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Order Tracking ID</p>
        <div className="flex items-center justify-between bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl px-4 py-3 group">
          <span className="font-mono font-bold text-[#2563EB] text-lg">#ST-{order.order_number}</span>
          <button 
            onClick={handleCopyId}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            {copied ? <ClipboardCheck size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy ID"}
          </button>
        </div>
      </div>

      {/* Shipping Info Summary (Mini) */}
      <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100 italic">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed font-medium">
          <MapPin size={12} className="shrink-0 mt-0.5 text-blue-500" />
          <span>{order.shipping_address}</span>
        </div>
        {order.contact_phone && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-bold not-italic">
            <Phone size={12} className="text-blue-500" />
            <span>{order.contact_phone}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          href={`/customer/orders`} 
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm flex items-center justify-center gap-2"
        >
          Track Order
        </Link>
        <Link 
          href="/support"
          className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold py-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          Contact Support
        </Link>
      </div>

      {/* Close Link */}
      <Link href="/" className="inline-block mt-8 text-sm font-semibold text-[#94A3B8] hover:text-[#64748B] transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
