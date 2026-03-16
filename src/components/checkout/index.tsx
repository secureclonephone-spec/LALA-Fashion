"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/cart-slice";
import { setCookie, safeParse } from "@utils/helper";
import { ORDER_ID, IS_GUEST, NOT_IMAGE } from "@utils/constants";
import { useCustomToast } from "@/utils/hooks/useToast";
import { Price } from "@components/theme/ui/Price";
import { GridTileImage } from "@components/theme/ui/grid/Tile";
import { getCookie } from "@utils/getCartToken";
import { useGuestCartToken } from "@/utils/hooks/useGuestCartToken";
import Link from "next/link";

/* ─── Style tokens ─── */
const S = {
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    padding: "32px",
  } as React.CSSProperties,
  iconBox: (size = 40) =>
  ({
    width: `${size}px`,
    height: `${size}px`,
    background: "#eff6ff",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as React.CSSProperties),
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  } as React.CSSProperties,
};

/* ─── Validation rules ─── */
const VALIDATORS: Record<string, { test: (v: string) => boolean; msg: string }> = {
  fullName: {
    test: (v) => /^[a-zA-Z\u0600-\u06FF\s]{3,50}$/.test(v.trim()),
    msg: "Full name must be 3–50 letters only (no numbers or symbols).",
  },
  contact: {
    test: (v) => {
      const num = v.replace(/\s/g, "");
      // Strictly Pakistani mobile format: 03XX-XXXXXXX or +923XX-XXXXXXX
      return /^(03|\+923)[0-9]{9}$/.test(num);
    },
    msg: "Enter a valid Pakistani number: 03XXXXXXXXX or +923XXXXXXXXX.",
  },
  address: {
    test: (v) => v.trim().length >= 8,
    msg: "Address must be at least 8 characters.",
  },
  city: {
    test: (v) => /^[a-zA-Z\u0600-\u06FF\s]{2,40}$/.test(v.trim()),
    msg: "City must be letters only (no numbers).",
  },
  zip: {
    test: (v) => v === "" || /^\d{5}$/.test(v.trim()),
    msg: "Zip code must be exactly 5 digits (numbers only).",
  },
  landmark: {
    test: (v) => v.trim().length >= 5,
    msg: "Landmark must be at least 5 characters.",
  },
  emergency: {
    test: (v) => {
      if (v === "") return true;
      const num = v.replace(/\s/g, "");
      return /^(03|\+923)[0-9]{9}$/.test(num);
    },
    msg: "Enter a valid Pakistani number or leave blank.",
  },
};

/* ─── Validated Input Component ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function ValidatedInput({ error, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${hasError ? "#ef4444" : focused ? "#2563EB" : "#e5e7eb"}`,
          borderRadius: "8px",
          fontSize: "14px",
          color: "#374151",
          background: hasError ? "#fff5f5" : "#fff",
          outline: "none",
          boxSizing: "border-box" as const,
          fontFamily: "inherit",
          transition: "border-color 0.2s, background 0.2s",
          boxShadow: focused
            ? hasError
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "0 0 0 3px rgba(37,99,235,0.1)"
            : "none",
          paddingRight: hasError ? "38px" : "14px",
          ...style,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {/* Error icon */}
      {hasError && (
        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <svg width="16" height="16" fill="#ef4444" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {/* Error message */}
      {hasError && (
        <div style={{ marginTop: "5px", fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "flex-start", gap: "4px", lineHeight: "1.4" }}>
          <svg width="12" height="12" fill="#ef4444" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: "1px" }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Icon SVGs ─── */
const IconTruck = () => (
  <svg width="20" height="20" fill="#2563EB" viewBox="0 0 24 24">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9 1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);
const IconCard = () => (
  <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" strokeLinecap="round" />
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClipboard = () => (
  <svg width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconLock = ({ color = "#fff", size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowLeft = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Buttons ─── */
function PrimaryBtn({ children, style, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      style={{
        background: rest.disabled ? "#93c5fd" : hov ? "#1d4ed8" : "#2563EB",
        color: "#fff", border: "none",
        cursor: rest.disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "background 0.2s, transform 0.15s",
        transform: hov && !rest.disabled ? "translateY(-1px)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        ...style,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

function ContinueBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <PrimaryBtn {...rest} style={{ padding: "13px 28px", borderRadius: "10px", fontSize: "15px", fontWeight: 600 }}>
      {children}
    </PrimaryBtn>
  );
}

function BackBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [hov, setHov] = useState(false);
  return (
    <button
      {...rest}
      style={{
        background: "transparent", border: "none",
        color: hov ? "#374151" : "#6b7280",
        fontWeight: 600, cursor: "pointer", fontSize: "14px",
        padding: 0, fontFamily: "inherit", transition: "color 0.15s",
        display: "flex", alignItems: "center", gap: "6px",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <IconArrowLeft /> {children}
    </button>
  );
}

/* ─── Required badge ─── */
const Req = () => <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>;

/* ─── Main Component ─── */
export default function CheckOut({ step }: { step?: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useCustomToast();
  const { resetGuestToken } = useGuestCartToken();

  const cartDetail = useAppSelector((state) => state.cartDetail);
  const cartItemsData = cartDetail?.cart?.items?.edges || [];
  const cartItems = Array.isArray(cartItemsData) ? cartItemsData : [];
  const subtotal = (cartDetail?.cart as any)?.subtotal || (cartDetail?.cart as any)?.grandTotal || 0;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponData, setCouponData] = useState<{
    valid: boolean;
    discount_amount: number;
    final_total: number;
    message: string;
    coupon_id?: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "", contact: "", address: "",
    city: "", zip: "", landmark: "", emergency: "",
  });

  // Per-field errors — only shown after user touches/submits
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* Validate a single field */
  const validateField = (name: string, value: string): string => {
    const rule = VALIDATORS[name];
    if (!rule) return "";
    if (value === "" && name !== "zip" && name !== "emergency") {
      return "This field is required.";
    }
    if (!rule.test(value)) return rule.msg;
    return "";
  };

  /* Update value + validate on change */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // If field was already touched, validate live
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  /* Mark field as touched + validate on blur */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  /* Prevent non-numeric input for phone/zip fields */
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "+"];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
      // Show explicit error so user knows WHY their typing is blocked
      setErrors((prev) => ({ ...prev, [e.currentTarget.name]: `Only numbers are allowed in this field.` }));
    }
  };

  /* Prevent numeric input for name/city fields */
  const handleAlphaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      // Show inline error
      setErrors((prev) => ({ ...prev, [e.currentTarget.name]: `Numbers are not allowed in this field.` }));
    }
  };

  /* Validate all step-1 required fields */
  const validateStep1 = (): boolean => {
    const allFields = ["fullName", "contact", "address", "city", "zip", "landmark", "emergency"];

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    allFields.forEach((field) => {
      newTouched[field] = true;
      const err = validateField(field, formData[field as keyof typeof formData]);
      if (err) newErrors[field] = err;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* Helper to check if step 1 is valid (without touching fields) for button disabling */
  const isStep1Valid = (): boolean => {
    const allFields = ["fullName", "contact", "address", "city", "zip", "landmark", "emergency"];
    for (const field of allFields) {
      if (validateField(field, formData[field as keyof typeof formData])) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      showToast("Please fix the errors before continuing.", "warning");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { showToast("Please enter a coupon code.", "warning"); return; }
    setCouponLoading(true);
    setCouponError("");
    try {
      const cartPayload = cartItems.map((edge: any) => {
        const item = edge.node;
        const productId = item?.product?.id || item?.product_id || item?.id || "";
        return {
          productId: productId.toString(),
          categoryId: item?.product?.category_id || item?.category_id || "",
          price: item?.price || 0,
          quantity: item?.quantity || 1,
        };
      });
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal, cartItems: cartPayload }),
      });
      const data = await res.json();
      if (data.valid) {
        setCouponData(data);
        setCouponError("");
        showToast(data.message, "success");
      } else {
        setCouponData(null);
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponData(null);
    setCouponError("");
  };

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) { showToast("Your cart is empty.", "warning"); return; }
    setIsLoading(true);
    try {
      const cartPayload = cartItems.map((edge: any) => {
        const item = edge.node;
        const productId = item?.product?.id || item?.product_id || item?.id || "";
        return {
          productId: productId.toString(),
          name: item?.name || "Product",
          quantity: item?.quantity || 1,
          price: item?.price || 0,
          selectedColor: cartDetail.itemColors ? cartDetail.itemColors[productId] || null : null,
        };
      });

      const finalTotal = couponData?.final_total ?? subtotal;
      const discountAmount = couponData?.discount_amount ?? 0;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingData: formData,
          cartItems: cartPayload,
          subtotal,
          couponCode: couponData ? couponCode.toUpperCase() : null,
          discountAmount,
          finalTotal,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to place order");

      setCookie(ORDER_ID, result.orderId);
      if (getCookie(IS_GUEST) === "true") await resetGuestToken();
      dispatch(clearCart());
      showToast("Order placed successfully! 🎉", "success");
      router.replace("/success");
    } catch (e: any) {
      showToast(e.message || "Failed to place order. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "SHIPPING" },
    { num: 2, label: "PAYMENT" },
    { num: 3, label: "SUMMARY" },
  ];

  /* Shorthand to get props for each field */
  const field = (name: keyof typeof formData) => ({
    id: `co-${name}`,
    name,
    value: formData[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingTop: "40px", paddingBottom: "60px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "34px", fontWeight: 700, color: "#111827", margin: 0 }}>Checkout</h1>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "6px", marginBottom: 0 }}>
            Your order is just a few clicks away.
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", maxWidth: "400px", margin: "30px auto 0" }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: "contents" }}>
              <div
                onClick={() => s.num <= currentStep && setCurrentStep(s.num as 1 | 2 | 3)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: s.num <= currentStep ? "pointer" : "default", minWidth: "70px" }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: currentStep >= s.num ? "#2563EB" : "#e5e7eb",
                  color: currentStep >= s.num ? "#fff" : "#9ca3af",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "16px", marginBottom: "8px",
                  transition: "background 0.3s",
                }}>
                  {currentStep > s.num ? (
                    <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s.num}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: currentStep >= s.num ? "#2563EB" : "#9ca3af" }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: currentStep > s.num ? "#2563EB" : "#d1d5db", marginTop: "20px", alignSelf: "flex-start", transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", marginTop: "30px" }} className="checkout-cols">
          <style dangerouslySetInnerHTML={{ __html: `@media(max-width:768px){.checkout-cols{flex-direction:column!important;}}` }} />

          {/* ══════════════ LEFT CARD ══════════════ */}
          <div style={{ flex: "1.2", ...S.card }}>

            {/* ── STEP 1 — Shipping ── */}
            {currentStep === 1 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={S.iconBox(40)}><IconTruck /></div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Shipping Information</div>
                    <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>Where should we send your order?</div>
                  </div>
                </div>

                {/* Required note */}
                <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "18px", marginTop: 0 }}>
                  Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
                </p>

                <form onSubmit={handleNextStep} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {/* Full Name */}
                  <div>
                    <label style={S.label} htmlFor="co-fullName">Full Name <Req /></label>
                    <ValidatedInput
                      {...field("fullName")}
                      placeholder="Ahmad Ali"
                      type="text"
                      autoComplete="name"
                      onKeyDown={handleAlphaKeyDown}
                    />
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>Letters only — no numbers or symbols</div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label style={S.label} htmlFor="co-contact">Contact Number <Req /></label>
                    <ValidatedInput
                      {...field("contact")}
                      placeholder="03001234567"
                      type="tel"
                      autoComplete="tel"
                      maxLength={13}
                      onKeyDown={handleNumericKeyDown}
                      inputMode="numeric"
                    />
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>Numbers only — e.g. 03001234567</div>
                  </div>

                  {/* Address */}
                  <div>
                    <label style={S.label} htmlFor="co-address">Street Address <Req /></label>
                    <ValidatedInput
                      {...field("address")}
                      placeholder="House #5, Street 3, Gulshan-e-Iqbal"
                      type="text"
                      autoComplete="street-address"
                    />
                  </div>

                  {/* City + Zip */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={S.label} htmlFor="co-city">City <Req /></label>
                      <ValidatedInput
                        {...field("city")}
                        placeholder="Karachi"
                        type="text"
                        autoComplete="address-level2"
                        onKeyDown={handleAlphaKeyDown}
                      />
                    </div>
                    <div>
                      <label style={S.label} htmlFor="co-zip">
                        Zip Code <span style={{ color: "#9ca3af", fontStyle: "italic", fontWeight: 400, fontSize: "11px" }}>(optional)</span>
                      </label>
                      <ValidatedInput
                        {...field("zip")}
                        placeholder="75500"
                        type="text"
                        maxLength={5}
                        inputMode="numeric"
                        onKeyDown={handleNumericKeyDown}
                      />
                      <div style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>5 digits only</div>
                    </div>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label style={S.label} htmlFor="co-landmark">Famous Landmark / Area <Req /></label>
                    <ValidatedInput
                      {...field("landmark")}
                      placeholder="Near Dolmen Mall, Clifton"
                      type="text"
                    />
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>Helps rider find your location faster</div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label style={S.label} htmlFor="co-emergency">
                      Emergency Contact <span style={{ color: "#9ca3af", fontStyle: "italic", fontWeight: 400, fontSize: "11px" }}>(optional)</span>
                    </label>
                    <ValidatedInput
                      {...field("emergency")}
                      placeholder="03331234567"
                      type="tel"
                      maxLength={13}
                      onKeyDown={handleNumericKeyDown}
                      inputMode="numeric"
                    />
                    <div style={{ marginTop: "4px", fontSize: "11px", color: "#9ca3af" }}>Numbers only</div>
                  </div>

                  {/* Error count banner */}
                  {Object.values(errors).filter(Boolean).length > 0 && (
                    <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <svg width="16" height="16" fill="#ef4444" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div style={{ fontSize: "13px", color: "#b91c1c", fontWeight: 600 }}>
                        Please fix {Object.values(errors).filter(Boolean).length} error{Object.values(errors).filter(Boolean).length > 1 ? "s" : ""} before continuing.
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                    <ContinueBtn
                      type="submit"
                      disabled={!isStep1Valid()}
                    >
                      Continue to Payment <IconArrowRight />
                    </ContinueBtn>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 2 — Payment ── */}
            {currentStep === 2 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={S.iconBox(40)}><IconCard /></div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Payment Method</div>
                    <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>How would you like to pay?</div>
                  </div>
                </div>
                <form onSubmit={handleToSummary} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", border: "2px solid #2563EB", borderRadius: "14px", background: "#eff6ff", cursor: "pointer" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #2563EB", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: "15px" }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>Pay in cash when your order arrives at your doorstep.</div>
                    </div>
                    <svg width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </label>
                  <div style={{ padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <svg width="16" height="16" fill="#16a34a" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: "1px" }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#15803d" }}>Free Delivery Included</div>
                      <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "2px" }}>No extra charges. Pay exactly what you see.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <BackBtn onClick={() => setCurrentStep(1)}>Back</BackBtn>
                    <ContinueBtn type="submit">Review Order <IconArrowRight /></ContinueBtn>
                  </div>
                </form>
              </>
            )}

            {/* ── STEP 3 — Review ── */}
            {currentStep === 3 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <div style={S.iconBox(40)}><IconCheck /></div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>Review Your Order</div>
                    <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>Verify everything before placing.</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "18px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>📦 Shipping Details</span>
                      <button onClick={() => setCurrentStep(1)} style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: "13px", padding: 0 }}>Edit</button>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.8" }}>
                      <strong style={{ color: "#374151", display: "block" }}>{formData.fullName}</strong>
                      {formData.contact}
                      <br />
                      {formData.address}{formData.landmark ? `, near ${formData.landmark}` : ""}
                      <br />
                      {formData.city}{formData.zip ? ` — ${formData.zip}` : ""}
                    </div>
                  </div>
                  <div style={{ padding: "18px", background: "#eff6ff", borderRadius: "12px", border: "2px solid #bfdbfe" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>💵 Cash on Delivery (COD)</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px" }}>Pay when your order arrives.</div>
                      </div>
                      <button onClick={() => setCurrentStep(2)} style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 600, cursor: "pointer", fontSize: "13px", padding: 0 }}>Edit</button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <BackBtn onClick={() => setCurrentStep(2)}>Back</BackBtn>
                </div>
              </>
            )}
          </div>

          {/* ══════════════ RIGHT CARD — Order Summary ══════════════ */}
          <div style={{ flex: "0.9", ...S.card, padding: "28px", position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={S.iconBox(36)}><IconClipboard /></div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Order Summary</span>
            </div>

            {/* Cart items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cartItems.map((edge: any, idx: number) => {
                const item = edge.node;
                const baseImage: any = safeParse(item?.baseImage);
                const productImg = item?.image_url || baseImage?.small_image_url || "";
                const productId = item?.product?.id || item?.product_id || item?.id || "";
                const color = cartDetail.itemColors ? cartDetail.itemColors[productId] : null;
                return (
                  <div key={idx} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: "76px", height: "76px", borderRadius: "10px", background: "#1f2937", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                      {productImg ? (
                        <GridTileImage
                          alt={item?.name || "Product"}
                          src={productImg}
                          fill
                          className="object-cover"
                          onError={(e) => (e.currentTarget.src = NOT_IMAGE)}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="28" height="28" fill="none" stroke="#6b7280" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item?.name}</div>
                      {color && <div style={{ fontSize: "10px", letterSpacing: "1px", color: "#9ca3af", marginTop: "2px", textTransform: "uppercase" }}>{color}</div>}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>Qty: {item?.quantity || 1}</span>
                        <Price amount={String(item?.price ?? 0)} currencyCode="PKR" className="font-bold text-sm border-none text-gray-800" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {cartItems.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                  Your cart is empty. <Link href="/products" style={{ color: "#2563EB" }}>Shop now</Link>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <>
                <div style={{ margin: "18px 0", borderTop: "1px solid #f3f4f6" }} />

                {/* Coupon */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ ...S.label, fontSize: "13px", marginBottom: "8px" }}>Coupon Code</label>
                  {couponData?.valid ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "8px" }}>
                      <svg width="16" height="16" fill="#16a34a" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803d", fontFamily: "monospace" }}>{couponCode.toUpperCase()}</span>
                        <span style={{ fontSize: "12px", color: "#16a34a", marginLeft: "8px" }}>{couponData.message}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "18px", lineHeight: 1, padding: "0 4px" }} title="Remove coupon">×</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          id="co-coupon"
                          style={{ flex: 1, padding: "10px 14px", fontSize: "13px", border: `1.5px solid ${couponError ? "#fca5a5" : "#e5e7eb"}`, borderRadius: "8px", outline: "none", fontFamily: "inherit", background: couponError ? "#fff5f5" : "#fff" }}
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); if (couponError) setCouponError(""); }}
                          placeholder="Enter promo code"
                          type="text"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          style={{ background: couponLoading ? "#93c5fd" : "#2563EB", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, fontSize: "13px", cursor: couponLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "background 0.2s", minWidth: "72px" }}
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p style={{ marginTop: "6px", fontSize: "12px", color: "#ef4444", display: "flex", gap: "4px", alignItems: "center" }}>
                          <svg width="12" height="12" fill="#ef4444" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          {couponError}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div style={{ margin: "0 0 14px", borderTop: "1px solid #f3f4f6" }} />

                {/* Price breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#6b7280" }}>Subtotal</span>
                    <Price amount={String(subtotal ?? 0)} currencyCode="PKR" className="border-none text-gray-700 text-sm" />
                  </div>
                  {couponData?.valid && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>Discount ({couponCode.toUpperCase()})</span>
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>− Rs {couponData.discount_amount.toFixed(0)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#6b7280" }}>Shipping</span>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>Free</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "#6b7280" }}>Payment</span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>COD</span>
                  </div>
                </div>

                <div style={{ margin: "14px 0", borderTop: "1.5px solid #e5e7eb" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Total</span>
                  <div style={{ textAlign: "right" }}>
                    {couponData?.valid && (
                      <div style={{ fontSize: "12px", color: "#9ca3af", textDecoration: "line-through", marginBottom: "2px" }}>
                        Rs {subtotal?.toFixed(0)}
                      </div>
                    )}
                    <Price amount={String(couponData?.final_total ?? subtotal ?? 0)} currencyCode="PKR" className="border-none font-extrabold text-xl text-gray-900" />
                  </div>
                </div>

                {/* Place Order */}
                <PrimaryBtn
                  onClick={handleCompleteOrder}
                  disabled={isLoading || currentStep !== 3}
                  style={{ marginTop: "18px", width: "100%", padding: "15px", borderRadius: "12px", fontSize: "15px", fontWeight: 700 }}
                >
                  {isLoading ? (
                    <>
                      <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order (Cash on Delivery) <IconLock />
                    </>
                  )}
                </PrimaryBtn>

                {currentStep !== 3 && (
                  <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                    Complete all {3 - currentStep} step{3 - currentStep > 1 ? "s" : ""} above to place your order.
                  </p>
                )}
              </>
            )}

            <Link
              href="/products"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", color: "#6b7280", textDecoration: "none", marginTop: "16px" }}
            >
              <IconArrowLeft /> Back to Store
            </Link>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", fontSize: "10px", letterSpacing: "1.5px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" as const }}>
                <IconLock color="#9ca3af" size={11} />
                SECURE SSL ENCRYPTED CHECKOUT
              </div>
              <p style={{ fontSize: "11px", color: "#b0b7c3", lineHeight: 1.5, margin: "6px 0 0", maxWidth: "220px", marginLeft: "auto", marginRight: "auto" }}>
                Your information is processed securely. We do not store payment card details.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}` }} />
    </div>
  );
}
