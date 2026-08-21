import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { agency } from "@/lib/config/agency";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${agency.legalName} | ${agency.address.city}, ${agency.address.state} Independent Insurance Agency`,
    template: `%s | ${agency.legalName}`,
  },
  description: `${agency.legalName} is an independent insurance agency based in ${agency.address.city}, ${agency.address.state}, serving ${agency.address.region} and licensed in ${agency.address.state} plus 13 other states. Home, auto, business, and our flagship collector vehicle program.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
