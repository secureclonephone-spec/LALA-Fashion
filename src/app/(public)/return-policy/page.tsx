import { RotateCcw, Package, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ReturnPolicyPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                        <RotateCcw className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Return <span className="text-orange-600">&</span> Exchange
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        Not satisfied with your purchase? Don't worry, we're here to help. Our return processes are simple and hassle-free.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* Return Eligibility */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-orange-600" />
                            Return Eligibility
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            We offer a 7-day return policy for all products. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging with all tags intact.
                        </p>
                    </section>

                    {/* Non-returnable Items */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-orange-600">
                            Non-returnable Items
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-neutral-400 text-sm">
                            <li>Gift cards</li>
                            <li>Personal care items (opened)</li>
                            <li>Sale/Clearance items</li>
                            <li>Custom-made or personalized products</li>
                        </ul>
                    </section>

                    {/* How to Return */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Package className="w-6 h-6 text-orange-600" />
                            How to Initiate a Return
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <div className="text-xl font-bold mb-2 text-slate-900 dark:text-white">1. Contact Us</div>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">Reach out to our support team with your order ID.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <div className="text-xl font-bold mb-2 text-slate-900 dark:text-white">2. Pack It</div>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">Carefully pack the item in its original condition.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                                <div className="text-xl font-bold mb-2 text-slate-900 dark:text-white">3. Ship It</div>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">Send it back to our fulfillment center via your local courier.</p>
                            </div>
                        </div>
                    </section>

                    {/* Refunds */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-orange-600" />
                            Refund Process
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-10 business days.
                        </p>
                    </section>
                </div>

                {/* Return Support */}
                <div className="mt-20 p-8 rounded-[2rem] bg-orange-50 dark:bg-neutral-900 border border-orange-100 dark:border-neutral-800 text-center">
                    <h3 className="text-xl font-bold mb-2">Wrong item received?</h3>
                    <p className="text-slate-500 dark:text-neutral-400 mb-6 font-medium">If we made a mistake, we'll fix it right away with no extra cost to you.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center justify-center px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all font-outfit"
                    >
                        Start an Exchange
                    </Link>
                </div>
            </main>
        </div>
    );
}
