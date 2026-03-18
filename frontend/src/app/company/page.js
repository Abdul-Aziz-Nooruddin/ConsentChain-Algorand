"use client";

import { useWallet } from '@txnlab/use-wallet';
import { Shield, Building2, Eye, Database, Coins } from 'lucide-react';

export default function CompanyDashboard() {
  const { activeAccount } = useWallet();

  const users = [
    { id: '1', address: 'USR1...XYZA', status: 'GIVEN', cost: 2 },
    { id: '2', address: 'USR2...QWER', status: 'PAUSED', cost: 2 },
    { id: '3', address: 'USR3...ASDF', status: 'GIVEN', cost: 2 },
  ];

  if (!activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Disconnected</h2>
        <p className="text-slate-500">Please connect your Pera Wallet from the home page to access the portal.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Company Data Portal</h1>
          <p className="text-slate-500">Access user data seamlessly via Algorand Escrow Payments.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Connected As</p>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="font-mono font-medium">{activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Available Records</p>
          <p className="text-3xl font-bold">2</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Paused Records</p>
          <p className="text-3xl font-bold">1</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Escrow Processed</p>
          <p className="text-3xl font-bold flex items-center gap-2"><Coins className="w-6 h-6 text-yellow-500" /> 0 ALGO</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">User Data Requests</h2>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="py-4 px-6 font-semibold text-slate-500">User Wallet</th>
              <th className="py-4 px-6 font-semibold text-slate-500">Consent Status</th>
              <th className="py-4 px-6 font-semibold text-slate-500">Cost (ALGO)</th>
              <th className="py-4 px-6 font-semibold text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                <td className="py-4 px-6 font-mono text-sm">{user.address}</td>
                <td className="py-4 px-6">
                  {user.status === 'GIVEN' ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-semibold uppercase">Given</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-semibold uppercase">Paused</span>
                  )}
                </td>
                <td className="py-4 px-6 font-medium flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" /> {user.cost}
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    disabled={user.status !== 'GIVEN'}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      user.status === 'GIVEN' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 glow-effect' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    Buy Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}