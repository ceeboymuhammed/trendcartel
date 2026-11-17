import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendCartel — Launch Your Digital Product",
  description: "Validate locally in Naira, scale globally in Tier-1 currencies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900">
        {children}
      </body>
    </html>
  );
}