import "./globals.css";
import AppWalletProvider from "./WalletProvider";

export const metadata = {
  title: "ConsentChain | DPDP Act 2023",
  description: "Manage your digital consent securely powered by Algorand and DPDP Act 2023 regulations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 min-h-screen"
      >
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
