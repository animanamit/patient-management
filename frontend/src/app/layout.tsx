import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "CarePulse - Healthcare Management",
  description: "Digital platform for physiotherapy clinic management in Singapore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
