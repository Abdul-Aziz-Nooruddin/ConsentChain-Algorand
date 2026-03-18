"use client";

import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

const walletManager = new WalletManager({
  wallets: [WalletId.PERA],
  network: NetworkId.LOCALNET
});

export default function AppWalletProvider({ children }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
