import { ReactNode, Suspense } from "react";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import NewsletterSection from "@/components/layout/newsletter";
import TopBanner from "@/components/layout/TopBanner";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main>
      <Suspense fallback={null}>
        <TopBanner />
      </Suspense>
      <Navbar />
      <div className="mx-auto min-h-[calc(100vh-580px)] w-full">
        {children}
      </div>
      <NewsletterSection />
      <Footer />
    </main>
  );
}
