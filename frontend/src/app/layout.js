import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "./WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ConsentChain | DPDP Act 2023",
  description: "Manage your digital consent securely powered by Algorand and DPDP Act 2023 regulations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
