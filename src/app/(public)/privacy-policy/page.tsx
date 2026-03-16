import { Lock, EyeOff, Shield, Database } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                        <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Privacy <span className="text-emerald-600">Policy</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        We value your privacy and are committed to protecting it. This policy explains what information we collect and how we use it to enhance your experience.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* Information Collection */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <EyeOff className="w-6 h-6 text-emerald-600" />
                            Information Collection
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number or credit card information. 
                        </p>
                    </section>

                    {/* How we use it */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Shield className="w-6 h-6 text-emerald-600" />
                            Information Usage
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm mb-4">
                            Any of the information we collect from you may be used in one of the following ways:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-neutral-400 text-sm">
                            <li>To personalize your experience (your information helps us to better respond to your individual needs)</li>
                            <li>To improve our website (we continually strive to improve our website offerings based on the information and feedback we receive from you)</li>
                            <li>To improve customer service (your information helps us to more effectively respond to your customer service requests and support needs)</li>
                            <li>To process transactions</li>
                        </ul>
                    </section>

                    {/* Data Protection */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <Database className="w-6 h-6 text-emerald-600" />
                            Data Security
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Cookies Usage</h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Yes (Cookies are small files that a site or its service provider transfers to your computers hard drive through your Web browser (if you allow) that enables the sites or service providers systems to recognize your browser and capture and remember certain information). We use cookies to help us remember and process the items in your shopping cart and understand and save your preferences for future visits.
                        </p>
                    </section>
                </div>

                {/* Privacy Contact */}
                <div className="mt-20 p-8 rounded-[2rem] bg-emerald-50 dark:bg-neutral-900 border border-emerald-100 dark:border-neutral-800 text-center text-sm">
                    <h3 className="text-xl font-bold mb-2">Privacy Questions?</h3>
                    <p className="text-slate-500 dark:text-neutral-400 mb-6 font-medium">Your data rights are important to us. Contact us for any privacy-related concerns.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
                    >
                        Contact Privacy Team &rarr;
                    </Link>
                </div>
            </main>
        </div>
    );
}
