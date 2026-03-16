"use client";

import { useState, useRef } from "react";
import Image from "next/image";

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeOrderId(raw: string): string {
  let id = raw.trim().replace(/^#+/, ""); // remove leading #
  if (!id.toUpperCase().startsWith("ORD-")) {
    id = "ORD-" + id;
  }
  return id.toUpperCase();
}

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "order" },
  { key: "processing", label: "Processing", icon: "processing", subtext: "Your order is being prepared" },
  { key: "shipped", label: "Shipped", icon: "shipped" },
  { key: "delivered", label: "Delivered", icon: "delivered" },
];

function getStatusIndex(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return 0;
  if (s === "processing") return 1;
  if (s === "shipped") return 2;
  if (s === "delivered") return 3;
  return 0;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function TrackOrderForm() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    const normalized = normalizeOrderId(inputValue);

    try {
      const res = await fetch(
        `/api/orders?order_number=${encodeURIComponent(normalized)}`
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Order not found. Please check your Order ID and try again.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
    }
  };

  return (
    <div className="tof-wrapper">
      {/* ── Search Card ── */}
      <section className="tof-card">
        <form id="tracking-form" onSubmit={handleSubmit} className="tof-form">
          <div className="tof-input-group">
            <label htmlFor="order-id-input" className="sr-only">Order ID</label>
            <div className="tof-input-icon">
              <svg className="tof-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <input
              ref={inputRef}
              id="order-id-input"
              type="text"
              className="tof-input"
              placeholder="Enter Order ID (e.g. ORD-554871 or #554871)"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <div className="tof-error" role="alert">
              <svg className="tof-err-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button id="track-order-btn" type="submit" className="tof-btn" disabled={loading || !inputValue.trim()}>
            {loading ? (
              <><span className="tof-spinner" /><span>Searching...</span></>
            ) : (
              <><span className="font-semibold">Track Order</span><svg className="tof-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg></>
            )}
          </button>
        </form>

        <footer className="tof-footer">
          <svg className="tof-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span>Accepted formats: ORD-XXXXXX, #XXXXXX, or numeric codes.</span>
        </footer>
      </section>

      {/* ── Help links (only show when no order) ── */}
      {!order && !loading && (
        <div className="tof-help">
          <p>Having trouble? <a href="/contact" className="tof-link">Contact Support</a> or <a href="/faq" className="tof-link">View FAQs</a></p>
        </div>
      )}

      {/* ── Order Result UI ── */}
      {order && (
        <div className="os-inline-result" style={{ marginTop: '60px', width: '100%' }}>
          {/* Header */}
          <header className="os-header">
            <div className="os-header-left">
              <div className="os-id-row">
                <h1 className="os-order-id">{order.order_number}</h1>
                <button className="os-copy-btn" onClick={copyToClipboard} title="Copy Order ID">
                  <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg"><rect height="13" rx="2" ry="2" width="13" x="9" y="9"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <p className="os-date">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="os-header-right">
              <span className={`os-badge os-badge-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
          </header>

          {/* Stepper */}
          <section className="os-stepper-section">
            <div className="os-stepper">
              {STATUS_STEPS.map((step, idx) => {
                const idxStatus = getStatusIndex(order.status);
                const isActive = idx <= idxStatus;
                const isCurrent = idx === idxStatus;
                return (
                  <div key={step.key} className="os-step-wrap">
                    <div className={`os-step-icon-circle ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                      {step.icon === "order" && <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="20"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      {step.icon === "processing" && <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>}
                      {step.icon === "shipped" && <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><rect height="13" width="15" x="1" y="3"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>}
                      {step.icon === "delivered" && <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>}
                    </div>
                    <span className={`os-step-label ${isActive ? "active" : ""}`}>{step.label}</span>
                    {isCurrent && step.subtext && <p className="os-step-subtext">{step.subtext}</p>}
                    {idx < STATUS_STEPS.length - 1 && <div className={`os-step-line ${idx < idxStatus ? "active" : ""}`} />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Details Grid */}
          <section className="os-grid">
            <div className="os-card">
              <h3 className="os-card-title">Payment Method</h3>
              <p className="os-card-value text-slate-800 dark:text-slate-100">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</p>
            </div>
            <div className="os-card">
              <h3 className="os-card-title">Payment Status</h3>
              <p className={`os-card-value os-payment-${order.payment_status.toLowerCase()}`}>{order.payment_status}</p>
            </div>
            <div className="os-card">
              <h3 className="os-card-title">Shipping Address</h3>
              <p className="os-card-text text-slate-600 dark:text-slate-400">{order.shipping_address}<br /></p>
            </div>
            <div className="os-card">
              <h3 className="os-card-title">Contact</h3>
              <p className="os-card-value text-slate-800 dark:text-slate-100">{order.contact_phone}</p>
            </div>
          </section>

          {/* Items List */}
          <section className="os-items-list">
            <div className="os-items-header">
              <h2 className="os-items-title">Order Items</h2>
            </div>
            <div className="os-items-body">
              {order.items.map((item: any) => {
                const productName = item.product?.name || "Product";
                const productImage = item.product?.image_url || "/placeholder.png";
                return (
                  <div key={item.id} className="os-item-row">
                    <div className="os-item-img-wrap">
                      <Image 
                        src={productImage} 
                        alt={productName} 
                        width={80} 
                        height={80} 
                        className="os-item-img" 
                      />
                    </div>
                    <div className="os-item-details">
                      <div className="os-item-info">
                        <h4 className="os-item-name">{productName}</h4>
                        <p className="os-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="os-item-price">Rs {item.unit_price * item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <footer className="os-items-footer">
              <div className="os-total-row">
                <span className="os-total-label">Grand Total</span>
                <span className="os-total-value">Rs {order.total_amount}</span>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
