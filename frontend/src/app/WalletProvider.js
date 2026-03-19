"use client";

import { WalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react';

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
  nodeConfig: {
    network: NetworkId.TESTNET,
    nodeServer: 'https://testnet-api.algonode.cloud',
    nodePort: '443',
    nodeToken: ''
  },
  debug: true
});

export default function AppWalletProvider({ children }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
