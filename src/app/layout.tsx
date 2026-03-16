import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "@/providers";
import { generateMetadataForPage } from "@utils/helper";
import { staticSeo } from "@utils/metadata";
import { SpeculationRules } from "@components/theme/SpeculationRules";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import clsx from "clsx";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-outfit",
  display: "optional",
  preload: true,
});

export async function generateMetadata() {
  return {
    ...(await generateMetadataForPage("", staticSeo.default)),
    icons: {
      icon: [{ url: "/Favicon.png", type: "image/png" }],
      shortcut: "/Favicon.png",
      apple: "/Favicon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
      </head>
      <body
        suppressHydrationWarning
        className={clsx(
          "min-h-screen font-outfit text-foreground bg-background antialiased",
          outfit.variable
        )}>
        <main>
          <ErrorBoundary>
            <GlobalProviders>
              {children}
            </GlobalProviders>
            <SpeculationRules />
          </ErrorBoundary>
        </main>
        <span className="dsv-2025.04.19-7e29" />
      </body>
    </html>
  );
}
