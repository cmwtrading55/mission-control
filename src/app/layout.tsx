import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import dynamic from "next/dynamic";

// Dynamically import ConvexProvider to avoid SSR issues during static build
const ConvexProvider = dynamic(
  () => import("@/components/ConvexProvider").then((mod) => mod.ConvexProvider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Operations dashboard for assistant activities",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950">
        <ConvexProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 bg-slate-900 px-6 py-8 md:px-10">
              {children}
            </main>
          </div>
        </ConvexProvider>
      </body>
    </html>
  );
}
