"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { useState } from 'react';
import { Shield, PauseCircle, PlayCircle, XCircle, Building } from 'lucide-react';

export default function UserDashboard() {
  const { activeAccount } = useWallet();
  const [companies, setCompanies] = useState([
    { id: '1', name: 'HealthCorp Analytics', address: 'AAAA...BBBB', status: 'GIVEN' },
    { id: '2', name: 'FinTech Solutions', address: 'CCCC...DDDD', status: 'PAUSED' },
    { id: '3', name: 'Retail Insights', address: 'EEEE...FFFF', status: 'REVOKED' },
  ]);

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
          <p className="text-slate-500">Manage your data access preferences as per DPDP Act 2023.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Connected As</p>
          <p className="font-mono font-medium">{activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {companies.map(company => (
          <div key={company.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-sm font-mono text-slate-500">{company.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusColor(company.status)}`}>
                {company.status}
              </span>

              <div className="flex gap-2">
                <button 
                  className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 rounded-full transition-colors disabled:opacity-50"
                  disabled={company.status === 'GIVEN'}
                  title="Give Consent"
                >
                  <PlayCircle className="w-6 h-6" />
                </button>
                <button 
                  className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 rounded-full transition-colors disabled:opacity-50"
                  disabled={company.status === 'PAUSED' || company.status === 'REVOKED'}
                  title="Pause Consent"
                >
                  <PauseCircle className="w-6 h-6" />
                </button>
                <button 
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-full transition-colors disabled:opacity-50"
                  disabled={company.status === 'REVOKED'}
                  title="Revoke Consent"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-500">
          <p>Sign a transaction via Pera Wallet to apply state changes to the blockchain securely.</p>
        </div>
      </div>
    </div>
  );
}