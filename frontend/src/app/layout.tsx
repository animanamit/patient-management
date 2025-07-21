import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { ColorPaletteModal } from "@/components/color-palette-modal";
import { Toaster } from "sonner";

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
          <ColorPaletteModal />
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
