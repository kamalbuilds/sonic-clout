import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { NetworkProvider } from "@/context/NetworkContext";
import { ToastProvider } from "@/components/ToastProvider";
import Navbar from "@/components/Navbar";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SonicClout",
  description: "SonicClout is a social media platform that allows you to connect with your friends and family.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NetworkProvider>
            <WalletProvider>
              <ToastProvider />
              <Navbar />
              {children}
            </WalletProvider>
          </NetworkProvider>
        </Providers>
      </body>
    </html>
  );
}
