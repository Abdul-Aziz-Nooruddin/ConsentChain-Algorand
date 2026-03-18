"use client";

import { PeraWalletConnect } from '@perawallet/connect'
import { PROVIDER_ID, useInitializeProviders, WalletProvider } from '@txnlab/use-wallet'
import algosdk from 'algosdk'

export default function AppWalletProvider({ children }) {
  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect }
    ],
    nodeConfig: {
      network: 'localnet',
      nodeServer: 'http://localhost',
      nodePort: '4001',
      nodeToken: 'a'.repeat(64),
    },
    algosdkStatic: algosdk,
  })

  return (
    <WalletProvider value={providers}>
      {children}
    </WalletProvider>
  )
}
