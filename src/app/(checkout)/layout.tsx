import Navbar from "@components/layout/navbar";
import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="block lg:hidden">
        <Navbar />
      </div>
      <main className="mx-auto min-h-screen w-full" style={{ background: "#F8FAFC" }}>
        {children}
      </main>
    </>
  );
}
