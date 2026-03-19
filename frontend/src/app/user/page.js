"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { useState, useEffect } from 'react';
import { Shield, PauseCircle, PlayCircle, XCircle, Building, Loader2 } from 'lucide-react';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ConsentManagerClient } from '@/contracts/ConsentManagerClient';
import algosdk, { decodeAddress } from 'algosdk';

export default function UserDashboard() {
  const { activeAccount, signer } = useWallet();
  const [loading, setLoading] = useState(false);
  
  // Real App ID from Testnet deployment
  const APP_ID = 757371604;

  const [companies] = useState([
    { id: '1', name: 'HealthCorp Analytics', address: '7SWZO2R64VOG2T253CAG6OQUDD4JRW6EDMI7K4U657DQSK2YDINK4SHGQU', status: 'UNKNOWN' },
    { id: '2', name: 'FinTech Solutions', address: 'PRAHPRIMDZLWGDDDJMYZYIV7T2SRMXISNZDA52WAK6LYFFXL2L4YJ3YSJ4', status: 'UNKNOWN' },
  ]);

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
      const newStatuses = {};
      
      for (const company of companies) {
        try {
          // Construct the box key: "c" + user_address_bytes + company_address_bytes
          const userBytes = decodeAddress(activeAccount.address).publicKey;
          const companyBytes = decodeAddress(company.address).publicKey;
          const prefix = new Uint8Array([99]); // 'c'
          const boxKey = new Uint8Array([...prefix, ...userBytes, ...companyBytes]);
          
          const boxResponse = await algorand.client.algod.getApplicationBoxByName(APP_ID, boxKey).do();
          const value = algosdk.decodeUint64(boxResponse.value, 'safe');
          
          if (value === 1n || value === 1) newStatuses[company.id] = 'GIVEN';
          else if (value === 2n || value === 2) newStatuses[company.id] = 'PAUSED';
          else newStatuses[company.id] = 'UNKNOWN';
        } catch (e) {
          // 404 means box doesn't exist = Revoked/No Consent
          newStatuses[company.id] = 'REVOKED';
        }
      }
      setConsentStatuses(newStatuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [activeAccount]);

  const handleConsentAction = async (companyAddress, action) => {
    if (!activeAccount) return;
    setLoading(true);
    try {
      const client = getClient();
      console.log(`${action}ing consent for:`, companyAddress);
      
      let result;
      if (action === 'give') {
        result = await client.send.giveConsent({ args: { company: companyAddress } });
      } else if (action === 'pause') {
        result = await client.send.pauseConsent({ args: { company: companyAddress } });
      } else if (action === 'revoke') {
        result = await client.send.revokeConsent({ args: { company: companyAddress } });
      }
      
      console.log("Transaction successful:", result.transaction.txID());
      alert(`Consent ${action}d successfully on Algorand Testnet!`);
      await fetchStatuses(); // Refresh after action
    } catch (error) {
      console.error(`Error during ${action} consent:`, error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Disconnected</h2>
        <p className="text-slate-500">Please connect your Pera Wallet from the home page to access your dashboard.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'GIVEN': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'PAUSED': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'REVOKED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700';
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
          <p className="font-mono font-medium">{activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}</p>
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

      <div className="grid gap-6">
        {companies.map(company => (
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
                <button 
                  onClick={() => handleConsentAction(company.address, 'give')}
                  className="flex flex-col items-center gap-1 group"
                  title="Give Consent (Value 1)"
                >
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Give</span>
                </button>

                <button 
                  onClick={() => handleConsentAction(company.address, 'pause')}
                  className="flex flex-col items-center gap-1 group"
                  title="Pause Consent (Value 2)"
                >
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                    <PauseCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-600">Pause</span>
                </button>

                <button 
                  onClick={() => handleConsentAction(company.address, 'revoke')}
                  className="flex flex-col items-center gap-1 group"
                  title="Revoke Consent (Delete)"
                >
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
