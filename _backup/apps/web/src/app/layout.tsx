
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SidebarWrapper from "@/components/layout/SidebarWrapper";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Nexa AI",
  description: "Your Al Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <div className="vp-app">
          <div className="vp-bg-glow vp-bg-glow--left" />
          <div className="vp-bg-glow vp-bg-glow--right" />

          <SidebarWrapper />

          <main className="vp-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
