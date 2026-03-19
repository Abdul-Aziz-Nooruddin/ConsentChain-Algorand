"use client";

import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';
import { PeraWalletConnect } from '@perawallet/connect';

const walletManager = new WalletManager({
  wallets: [
    {
      id: WalletId.PERA,
      options: {
        shouldShowSignTxnToast: true
      }
    }
  ],
  network: NetworkId.TESTNET,
  debug: true
});

export default function AppWalletProvider({ children }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
