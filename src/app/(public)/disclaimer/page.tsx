import { AlertCircle, MessageSquare, Info } from "lucide-react";
import Link from "next/link";

export default function DisclaimerPage() {
    return (
        <div className="bg-white dark:bg-background min-h-screen font-outfit text-slate-900 dark:text-foreground">
            {/* Hero Header */}
            <header className="relative pt-24 pb-16 overflow-hidden border-b border-slate-100 dark:border-neutral-900">
                <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" style={{ height: "400px" }}></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Legal <span className="text-red-600">Disclaimer</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-neutral-400 font-normal max-w-2xl leading-relaxed">
                        The information provided on Lala Fashion is for general informational purposes only. Please read this disclaimer carefully.
                    </p>
                    <p className="mt-4 text-sm text-slate-400 italic">Last Updated: March 16, 2026</p>
                </div>
            </header>

            {/* Content Section */}
            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
                    {/* General Information */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-red-600">
                            General Info
                        </h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            The information contained on this website is for general information purposes only. The information is provided by Lala Fashion and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
                        </p>
                    </section>

                    {/* No Warranties */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">No Warranties</h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            This website is provided "as is" without any representations or warranties, express or implied. Lala Fashion makes no representations or warranties in relation to this website or the information and materials provided on this website. Without prejudice to the generality of the foregoing paragraph, Lala Fashion does not warrant that this website will be constantly available, or available at all; or that the information on this website is complete, true, accurate or non-misleading.
                        </p>
                    </section>

                    {/* Product Use */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Product Disclaimer</h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            While we strive for perfection, please note that product colors and textures may vary slightly from those displayed on your screen due to photography lighting and different monitor settings. Any reliance you place on such information is therefore strictly at your own risk.
                        </p>
                    </section>

                    {/* External Links */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">External Links</h2>
                        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed md:text-sm">
                            Through this website, you are able to link to other websites which are not under the control of Lala Fashion. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
                        </p>
                    </section>
                </div>

                {/* Support CTA */}
                <div className="mt-20 p-8 rounded-[2rem] bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 shadow-sm mb-4">
                        <Info className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Need clarification?</h3>
                    <p className="text-slate-500 dark:text-neutral-400 mb-6">If you have any questions about our legal policies, please reach out to our team.</p>
                    <Link 
                        href="/contact"
                        className="inline-flex items-center gap-2 text-red-600 font-bold hover:gap-3 transition-all underline decoration-red-200 underline-offset-4"
                    >
                        Contact Support <MessageSquare className="w-4 h-4" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
