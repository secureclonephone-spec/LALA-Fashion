import { ShieldCheck, MessageSquare, Info } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Terms & <span className="text-blue-600">Conditions</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        Please read these terms carefully before using our platform. By accessing Lala Fashion, you agree to be bound by these terms of service.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold">1</span>
                            Introduction
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            Welcome to Lala Fashion. These Terms & Conditions govern your use of our website and services. By using our site, you accept these terms in full. If you disagree with any part of these terms, you must not use our website. We reserve the right to modify these terms at any time, and changes will be effective immediately upon posting.
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold">2</span>
                            Intellectual Property Rights
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            Unless otherwise stated, Lala Fashion and/or its licensors own the intellectual property rights in the website and material on the website. Subject to the license below, all these intellectual property rights are reserved. You may view, download for caching purposes only, and print pages from the website for your own personal use, subject to the restrictions set out below and elsewhere in these terms and conditions.
                        </p>
                    </section>

                    {/* User Conduct */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold">3</span>
                            Acceptable Use
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website; or in any way which is unlawful, illegal, fraudulent or harmful, or in connection with any unlawful, illegal, fraudulent or harmful purpose or activity.
                        </p>
                    </section>

                    {/* Products and Services */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold">4</span>
                            Products & Pricing
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            We strive to ensure that all details, descriptions, and prices appearing on this website are accurate. However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible and give you the option of reconfirming your order at the correct price or cancelling it.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold">5</span>
                            Limitation of Liability
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            Lala Fashion will not be liable to you (whether under the law of contact, the law of torts or otherwise) in relation to the contents of, or use of, or otherwise in connection with, this website for any indirect, special or consequential loss; or for any business losses, loss of revenue, income, profits or anticipated savings.
                        </p>
                    </section>
                </div>

                {/* Support CTA */}
                <div className="mt-20 p-8 rounded-[2rem] bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 shadow-sm mb-4">
                        <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Have questions about our terms?</h3>
                    <p className="text-slate-500 dark:text-neutral-400 mb-6">Our legal team is here to help you understand how we operate.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all underline decoration-blue-200 underline-offset-4"
                    >
                        Contact Legal Support <MessageSquare className="w-4 h-4" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
