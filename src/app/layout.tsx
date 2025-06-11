import { Navbar } from "@/components/common/navbar";
import { Providers } from "@/components/common/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn, constructMetaData } from "@/lib/utils";
import { Inter } from 'next/font/google';
import "./globals.css";

import 'simplebar-react/dist/simplebar.min.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata = constructMetaData();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            'min-h-screen font-sans antialiased grainy',
            inter.className
          )}
        >
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          {children}

          {/* Toaster */}
          <Toaster position="top-right" expand={true} richColors />
        </body>
      </Providers>
    </html>
  );
}
