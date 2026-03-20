"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { useState, useEffect } from 'react';
import { Shield, PauseCircle, PlayCircle, XCircle, Building, Loader2 } from 'lucide-react';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ConsentManagerClient } from '@/contracts/ConsentManagerClient';
import algosdk, { decodeAddress, encodeAddress } from 'algosdk';

const APP_ID = 757371604;
const INDEXER_URL = `https://testnet-idx.algonode.cloud/v2/applications/${APP_ID}/boxes?limit=1000`;

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function decodeBase64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function shortenAddress(address) {
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export default function UserDashboard() {
  const { activeAccount, signer, wallets, isReady, activeWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyAddressInput, setCompanyAddressInput] = useState('');
  const [discoveryError, setDiscoveryError] = useState('');
  const [portalReady, setPortalReady] = useState(false);
  const [consentStatuses, setConsentStatuses] = useState({});

  const getClient = () => {
    const algorand = AlgorandClient.testNet();
    return new ConsentManagerClient({
      resolveBy: 'id',
      id: APP_ID,
      sender: activeAccount?.address,
      signer: signer,
    }, algorand.client.algod);
  };

  const fetchStatuses = async () => {
    if (!activeAccount) return;
    try {
      const algorand = AlgorandClient.testNet();
      const userBytes = decodeAddress(activeAccount.address).publicKey;
      const boxesResponse = await fetch(INDEXER_URL);
      const boxesData = await boxesResponse.json();
      const discoveredCompanies = [];
      const newStatuses = {};

      for (const box of (boxesData.boxes || [])) {
        try {
          const boxKey = decodeBase64ToBytes(box.name);
          if (boxKey.length !== 65 || boxKey[0] !== 99) continue;

          const boxUserBytes = boxKey.slice(1, 33);
          const companyBytes = boxKey.slice(33, 65);
          if (!arraysEqual(boxUserBytes, userBytes)) continue;

          const companyAddress = encodeAddress(companyBytes);
          const boxResponse = await algorand.client.algod.getApplicationBoxByName(APP_ID, boxKey).do();
          const value = algosdk.decodeUint64(boxResponse.value, 'safe');

          discoveredCompanies.push({
            id: companyAddress,
            name: shortenAddress(companyAddress),
            address: companyAddress,
          });

          if (value === 1n || value === 1) newStatuses[companyAddress] = 'GIVEN';
          else if (value === 2n || value === 2) newStatuses[companyAddress] = 'PAUSED';
          else newStatuses[companyAddress] = 'UNKNOWN';
        } catch (e) {
          console.error('Error reading consent box:', e);
        }
      }

      setCompanies(discoveredCompanies);
      setConsentStatuses(newStatuses);
      setDiscoveryError('');
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setDiscoveryError('Unable to load consent records from the Algorand indexer.');
    }
  };

  useEffect(() => {
    if (!activeAccount) {
      setCompanies([]);
      setConsentStatuses({});
      setPortalReady(false);
      return;
    }

    if (portalReady) {
      fetchStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount, portalReady]);

  const connectPera = async () => {
    if (!isReady) {
      window.alert('Wallet connection is still loading. Please try again in a moment.');
      return;
    }

    try {
      const pera = wallets.find((wallet) => wallet.id === 'pera');
      if (!pera) {
        window.alert('Pera Wallet is not available. Refresh the page and try again.');
        return;
      }

      await pera.connect();
      pera.setActive();
      setPortalReady(true);
    } catch (error) {
      console.error('Pera wallet connection failed:', error);
      window.alert(`Connection failed: ${error.message}`);
    }
  };

  const disconnectWallet = async () => {
    if (!activeWallet) return;

    try {
      await activeWallet.disconnect();
      setPortalReady(false);
      setCompanies([]);
      setConsentStatuses({});
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      window.alert(`Disconnect failed: ${error.message}`);
    }
  };

  const handleConsentAction = async (companyAddress, action) => {
    if (!activeAccount) return;
    setLoading(true);
    try {
      const client = getClient();
      let result;

      if (action === 'give') {
        result = await client.send.giveConsent({ args: { company: companyAddress } });
      } else if (action === 'pause') {
        result = await client.send.pauseConsent({ args: { company: companyAddress } });
      } else if (action === 'revoke') {
        result = await client.send.revokeConsent({ args: { company: companyAddress } });
      }

      console.log("Transaction successful:", result.transaction.txID());
      setCompanies((previousCompanies) => {
        if (previousCompanies.some((company) => company.address === companyAddress)) {
          return previousCompanies;
        }
        return [
          ...previousCompanies,
          {
            id: companyAddress,
            name: shortenAddress(companyAddress),
            address: companyAddress,
          },
        ];
      });
      setCompanyAddressInput('');
      alert(`Consent ${action}d successfully on Algorand Testnet!`);
      await fetchStatuses();
    } catch (error) {
      console.error(`Error during ${action} consent:`, error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!activeAccount || !portalReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect User Wallet</h2>
        <p className="text-slate-500 max-w-md">
          Enter the user portal with the wallet that represents the data owner. Use a different wallet in the company portal.
        </p>
        {activeAccount && !portalReady ? (
          <div className="mt-6 glass-card p-5 rounded-2xl max-w-md w-full">
            <p className="text-sm text-slate-500 mb-2">Detected connected wallet</p>
            <p className="font-mono text-sm break-all mb-4">{activeAccount.address}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setPortalReady(true)} className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold">
                Use This Wallet
              </button>
              <button onClick={disconnectWallet} className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold">
                Switch Wallet
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={connectPera}
            disabled={!isReady}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
          >
            {isReady ? 'Connect Pera Wallet' : 'Loading Wallet...'}
          </button>
        )}
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'GIVEN':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Consent Dashboard</h1>
          <p className="text-slate-500">Manage your data access preferences on Algorand Testnet (App: {APP_ID})</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Connected As</p>
          <p className="font-mono font-medium">{shortenAddress(activeAccount.address)}</p>
          <button onClick={disconnectWallet} className="mt-2 text-xs text-blue-600 font-semibold">
            Switch Wallet
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="font-semibold">Confirming on Blockchain...</span>
          </div>
        </div>
      )}

      <div className="glass-card p-6 rounded-2xl mb-6">
        <h2 className="text-lg font-semibold mb-2">Grant Consent To A Real Company Wallet</h2>
        <p className="text-sm text-slate-500 mb-4">This dashboard shows only companies discovered from your actual on-chain consent records.</p>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={companyAddressInput}
            onChange={(event) => setCompanyAddressInput(event.target.value.trim())}
            placeholder="Enter Algorand company wallet address"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-4 py-3 text-sm font-mono"
          />
          <button
            onClick={() => handleConsentAction(companyAddressInput, 'give')}
            disabled={!companyAddressInput || loading}
            className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
          >
            Give Consent
          </button>
        </div>
        {discoveryError && <p className="mt-3 text-sm text-red-600">{discoveryError}</p>}
      </div>

      <div className="grid gap-6">
        {companies.length === 0 && !discoveryError && (
          <div className="glass-card p-8 rounded-2xl text-center text-slate-500">
            No real company consent records were found for this wallet yet.
          </div>
        )}
        {companies.map((company) => (
          <div key={company.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-xs font-mono text-slate-500 break-all max-w-[200px] md:max-w-none">{company.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(consentStatuses[company.id] || 'REVOKED')}`}>
                {consentStatuses[company.id] || 'REVOKED'}
              </span>

              <div className="flex gap-4">
                <button onClick={() => handleConsentAction(company.address, 'give')} className="flex flex-col items-center gap-1 group" title="Give Consent (Value 1)">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Give</span>
                </button>

                <button onClick={() => handleConsentAction(company.address, 'pause')} className="flex flex-col items-center gap-1 group" title="Pause Consent (Value 2)">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                    <PauseCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-600">Pause</span>
                </button>

                <button onClick={() => handleConsentAction(company.address, 'revoke')} className="flex flex-col items-center gap-1 group" title="Revoke Consent (Delete)">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-red-600">Revoke</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-500">
          <p>Every action above triggers a real <b>Application Call</b> to the Algorand Testnet. Ensure your Pera Wallet is set to Testnet.</p>
        </div>
      </div>
    </div>
  );
}
