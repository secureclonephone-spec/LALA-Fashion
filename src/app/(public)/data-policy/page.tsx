import { Database, ShieldCheck, UserCheck, HardDrive } from "lucide-react";
import Link from "next/link";

export default function DataPolicyPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-2xl">
                        <Database className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Data <span className="text-violet-600">Policy</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        Learn how we handle, process, and protect your digital footprint at Lala Fashion. Transparency is our core value.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* What is Data Policy? */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-violet-600" />
                            Data Governance
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            At Lala Fashion, we take data governance seriously. Our Data Policy outlines the strict protocols we follow to ensure your personal and transactional information is handled with the highest level of integrity and security. We comply with local data protection regulations in Pakistan to provide you with a safe digital shopping environment.
                        </p>
                    </section>

                    {/* Data We Process */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <HardDrive className="w-6 h-6 text-violet-600" />
                            Data Processing
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm mb-4">
                            To provide our services, we process several types of data:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800">
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Transactional Data</span>
                                <span className="text-xs text-slate-500 dark:text-neutral-400">Order history, payment methods, and billing details.</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800">
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Interaction Data</span>
                                <span className="text-xs text-slate-500 dark:text-neutral-400">Search queries, page views, and time spent on site.</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800">
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Technical Data</span>
                                <span className="text-xs text-slate-500 dark:text-neutral-400">IP address, browser type, and device information.</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900/50 border border-slate-100 dark:border-neutral-800">
                                <span className="font-bold text-slate-900 dark:text-white block mb-1">Marketing Data</span>
                                <span className="text-xs text-slate-500 dark:text-neutral-400">Newsletter preferences and promotional interactions.</span>
                            </div>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            We retain your personal data only for as long as is necessary for the purposes set out in this Data Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-violet-600" />
                            Your Data Rights
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm mb-4">
                            As a user of Lala Fashion, you have the following rights regarding your data:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-neutral-400 text-sm">
                            <li>Right to Access: Request a copy of the data we hold about you.</li>
                            <li>Right to Rectification: Correct any inaccurate or incomplete data.</li>
                            <li>Right to Deletion: Request removal of your data from our systems (where applicable).</li>
                            <li>Right to Object: Withdraw your consent for data processing at any time.</li>
                        </ul>
                    </section>
                </div>

                {/* Data Contact */}
                <div className="mt-20 p-8 rounded-[2rem] bg-violet-50 dark:bg-neutral-900 border border-violet-100 dark:border-neutral-800 text-center">
                    <h3 className="text-xl font-bold mb-2">Data Privacy Concern?</h3>
                    <p className="text-slate-500 dark:text-neutral-400 mb-6 font-medium">If you have specific questions about how your data is being used, our Data Protection Officer is ready to assist.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center justify-center px-10 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all font-outfit"
                    >
                        Contact Data Officer
                    </Link>
                </div>
            </main>
        </div>
    );
}
