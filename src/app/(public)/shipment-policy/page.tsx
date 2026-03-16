import { Truck, MapPin, Globe, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ShipmentPolicyPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Shipment <span className="text-blue-600">Policy</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        We deliver all across Pakistan, ensuring your products reach you safely and quickly. Our logistics team works 24/7 to fulfill your style needs.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* Shipping Coverage */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            Nationwide Coverage
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Lala Fashion provides nationwide delivery across Pakistan. From major cities like Karachi, Lahore, and Islamabad to remote northern areas and southern coastal towns, we ensure our fashion reaches every doorstep. 
                        </p>
                    </section>

                    {/* Delivery Times */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-600" />
                            Delivery Times
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Major Cities</h3>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">2-4 business days</p>
                                <p className="mt-2 text-xs text-slate-400 italic">Expedited options available for some products.</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Other Regions</h3>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">5-7 business days</p>
                                <p className="mt-2 text-xs text-slate-400 italic">Depends on courier accessibility and weather conditions.</p>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Rates */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-600">
                            Shipping Rates
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Shipping rates are calculated based on weight and destination at the time of checkout. We offer <strong>FREE SHIPPING</strong> on orders over RS. 5,000 across Pakistan.
                        </p>
                    </section>

                    {/* Order Tracking */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Globe className="w-6 h-6 text-blue-600" />
                            Order Tracking
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Once your order is shipped, you will receive a tracking ID via SMS and Email. You can use this ID on our <Link href="/track-order" className="text-blue-600 hover:underline">Track Order</Link> page to see the real-time status of your package.
                        </p>
                    </section>

                    {/* Damages */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                            Safe Delivery Guarantee
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Lala Fashion is responsible for your order until it reaches your doorstep. In the rare event that your package is lost or damaged during transit, please contact us within 24 hours of the scheduled delivery time for a replacement or resolution.
                        </p>
                    </section>
                </div>

                {/* Support CTA */}
                <div className="mt-20 p-10 rounded-[3rem] bg-blue-600 text-white text-center shadow-xl shadow-blue-500/20">
                    <h3 className="text-2xl font-bold mb-4">Questions about your shipment?</h3>
                    <p className="text-blue-100 mb-8 font-medium">Our logistics partners are working around the clock to get your style to you.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all font-outfit"
                    >
                        Talk to Support
                    </Link>
                </div>
            </main>
        </div>
    );
}
