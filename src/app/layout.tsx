import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";
import type { CurrentPerson } from "@/lib/hooks/use-current-person";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "COEO Project Hub",
  description: "Internal IT operations hub for Coeo Solutions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coeo_people")
    .select("id, name, initials, color")
    .order("name");
  const people = (data ?? []) as CurrentPerson[];

  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <ToastProvider>
          <AppShell people={people}>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
