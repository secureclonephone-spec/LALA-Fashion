import Link from "next/link";
import { Suspense } from "react";
import { isObject } from "@/utils/type-guards";
import { getThemeCustomization } from "@/utils/bagisto";
import LogoIcon from "@components/common/icons/LogoIcon";
import FaceBookIcon from "@components/common/icons/social-icon/FaceBookIcon";
import InstaGramIcon from "@components/common/icons/social-icon/InstaGramIcon";
import TwitterIcon from "@components/common/icons/social-icon/TwitterIcon";
import Subscribe from "./Subscribe";
import FooterMenu from "./FooterMenu";
import ServiceContent from "./ServiceContent";
import { ThemeCustomizationTranslationEdge } from "@/types/theme/theme-customization";
const { COMPANY_NAME, SITE_NAME } = process.env;
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2010 + (currentYear > 2010 ? `-${currentYear}` : "");
  const skeleton =
    "w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";
  const menu = await getThemeCustomization();
  const copyrightName = COMPANY_NAME || SITE_NAME || "";
  const services =
    menu?.services_content?.themeCustomizations?.edges?.[0]?.node;

  return (
    <>
      {isObject(services) && services?.translations?.edges && (
        <ServiceContent
          name={services?.name}
          serviceData={services?.translations?.edges?.map(
            (edge: ThemeCustomizationTranslationEdge) => edge.node,
          )}
        />
      )}
      <style>
        {`
              @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
              .prebuilt-ui-footer-wrapper, .prebuilt-ui-footer-wrapper * {
                  font-family: "Geist", sans-serif;
              }
          `}
      </style>
      <div className='lala-fashion-footer-wrapper bg-white dark:bg-background pt-20 transition-colors duration-300'>
        <footer className="bg-neutral-100 dark:bg-neutral-900 w-full text-black dark:text-white pt-8 lg:pt-12 px-4 sm:px-8 md:px-16 lg:px-28 rounded-tl-[3rem] rounded-tr-[3rem] overflow-hidden transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8 md:gap-12">

            <div className="lg:col-span-3 space-y-6">
              <Link href="/" aria-label="Go to homepage">
                <LogoIcon />
              </Link>
              <p className="text-sm/6 text-neutral-600 dark:text-neutral-400 max-w-96 transition-colors duration-300">LalaFashion helps you build faster by transforming your design vision into fully functional, production-ready UI components.</p>
              <div className="flex gap-5 md:gap-6 order-1 md:order-2">
                {/* X (Twitter) */}
                <a href="#" className="text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                {/* Github */}
                <a href="#" className="text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
                {/* Linkedin */}
                <a href="#" className="text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                {/* Youtube */}
                <a href="#" className="text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
              </div>
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-y-12 items-start mt-8 lg:mt-0">
              {/* Watches */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Watches</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Men's Watches</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Women's Watches</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Smartwatches</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Luxury Watches</a></li>
                </ul>
              </div>

              {/* Glasses */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Glasses</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Sunglasses</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Reading Glasses</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Prescription Glasses</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Fashion Glasses</a></li>
                </ul>
              </div>

              {/* Jewellery */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Jewellery</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Kaan (Earrings)</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Rings</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Bracelets &amp; Bangles</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Bag / Purse Accessories</a></li>
                </ul>
              </div>

              {/* Electronics */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Electronics</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Hair Dryers</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Beard Trimmers</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Electric Shavers</a></li>
                  <li><a href="#" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Personal Care Gadgets</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Support</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><Link href="/faqs" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">FAQs</Link></li>
                  <li><Link href="/contact" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Contact Us</Link></li>
                  <li><Link href="/track-order" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Track Order</Link></li>
                  <li><Link href="/about" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">About Us</Link></li>
                </ul>
              </div>

              {/* Policies */}
              <div>
                <h3 className="font-medium text-sm mb-4 dark:text-neutral-200 transition-colors duration-300">Policies</h3>
                <ul className="space-y-3 text-sm text-neutral-800 dark:text-neutral-400 transition-colors duration-300">
                  <li><Link href="/terms" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Terms & Conditions</Link></li>
                  <li><Link href="/disclaimer" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Disclaimer</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Privacy Policy</Link></li>
                  <li><Link href="/return-policy" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Return Policy</Link></li>
                  <li><Link href="/shipment-policy" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Shipment Policy</Link></li>
                  <li><Link href="/data-policy" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-300">Data Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-12 pt-4 border-t border-neutral-300 dark:border-neutral-800 flex justify-between items-center z-10 relative transition-colors duration-300">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm transition-colors duration-300">© 2025 LalaFashion Design</p>
            <p className='text-sm text-neutral-600 dark:text-neutral-400 transition-colors duration-300'>All right reserved.</p>
          </div>
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl h-full max-h-64 bg-slate-100 dark:bg-slate-900 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />
            <div className="flex items-center justify-center h-[12rem] sm:h-[16rem] md:h-[20rem] lg:h-[24rem]">
              <TextHoverEffect text="LalaFashion" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
