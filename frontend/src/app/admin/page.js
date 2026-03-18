"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { Shield, ShieldAlert, LineChart, Coins, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { activeAccount } = useWallet();

  if (!activeAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Wallet Disconnected</h2>
        <p className="text-slate-500">Please connect the Admin Pera Wallet to view platform statistics.</p>
      </div>
    );
  }

  // Simulated metrics
  const metrics = {
    totalEarnings: 15.0, // 50% of 30 ALGO
    totalConsents: 124,
    activeCompanies: 12,
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
          <p className="text-slate-500">Monitor ConsentChain escrows and metrics securely.</p>
        </div>
        <div className="text-right flex items-center gap-3">
          <div className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Admin Role
          </div>
          <div className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border-t-4 border-emerald-500 relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Platform Escrow Earnings</p>
          <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            {metrics.totalEarnings.toFixed(2)} ALGO
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border-t-4 border-blue-500 relative overflow-hidden group">
           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Total Discovered Consents</p>
          <p className="text-4xl font-extrabold">{metrics.totalConsents}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border-t-4 border-purple-500 relative overflow-hidden group">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <LineChart className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Active Companies</p>
          <p className="text-4xl font-extrabold">{metrics.activeCompanies}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800">
        <p>Smart Contract ITxn splits incoming payments automatically (50% to Admin, 50% to User). No manual claim is needed.</p>
      </div>
    </div>
  );
}