"use client";

import { WalletProvider, WalletManager, WalletId, NetworkConfigBuilder, NetworkId } from '@txnlab/use-wallet-react';

const walletManager = new WalletManager({
  wallets: [
    {
      id: WalletId.PERA,
      options: { 
        shouldShowSignTxnToast: true,
        compactMode: false
      }
    }
  ],
  networks: new NetworkConfigBuilder()
    .testnet({
      algod: {
        baseServer: 'https://testnet-api.algonode.cloud',
        port: '443',
        token: ''
      }
    })
    .build(),
  defaultNetwork: NetworkId.TESTNET,
  options: {
    debug: true
  }
});

export default function AppWalletProvider({ children }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
