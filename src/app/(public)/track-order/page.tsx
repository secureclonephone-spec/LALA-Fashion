import TrackOrderForm from "@components/orders/TrackOrderForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | NaveedShop",
  description:
    "Enter your Order ID to see real-time status, items, and shipping details.",
};

export default function TrackOrderPage() {
  return (
    <div className="tof-page">
      {/* Header */}
      <header className="tof-header">
        <h1 className="tof-title">📦 Track Your Order</h1>
        <p className="tof-subtitle">
          Enter your Order ID to see real-time status, items, and shipping
          details.
        </p>
      </header>

      {/* Form */}
      <TrackOrderForm />
    </div>
  );
}
