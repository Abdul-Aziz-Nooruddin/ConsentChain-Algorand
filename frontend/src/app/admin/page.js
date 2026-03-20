"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, LineChart, Coins, Users, ExternalLink, Loader2, RefreshCcw } from 'lucide-react';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';

const APP_ID = 757371604;
const APP_ADDRESS = "PRAHPRIMDZLWGDDDJMYZYIV7T2SRMXISNZDA52WAK6LYFFXL2L4YJ3YSJ4";
const ADMIN_WALLET_ADDRESS = "5O6BZV3T2QW2UVD4IW3PWUYLFI7EZDLN4VJJNLNXJ7Q2UCTMTGPS5BTZHU";

function shortenAddress(address) {
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function maskAdminAddress(address) {
  return `${address.slice(0, 5)}.....${address.slice(-5)}`;
}

export default function AdminDashboard() {
  const { activeAccount, wallets, isReady, activeWallet } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalReady, setPortalReady] = useState(false);
  const [metrics, setMetrics] = useState({
    balance: 0,
    boxCount: 0,
    txCount: 0,
    recentTxs: []
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthorizedAdmin = activeAccount?.address === ADMIN_WALLET_ADDRESS;

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const algorand = AlgorandClient.testNet();

      const accountInfo = await algorand.client.algod.accountInformation(APP_ADDRESS).do();
      const balance = accountInfo.amount / 1_000_000;

      const boxesResponse = await fetch(`https://testnet-idx.algonode.cloud/v2/applications/${APP_ID}/boxes`);
      const boxesData = await boxesResponse.json();
      const boxCount = boxesData.boxes ? boxesData.boxes.length : 0;

      const txResponse = await fetch(`https://testnet-idx.algonode.cloud/v2/applications/${APP_ID}/transactions?limit=10`);
      const txData = await txResponse.json();
      const recentTxs = txData.transactions || [];

      setMetrics({
        balance,
        boxCount,
        txCount: recentTxs.length,
        recentTxs
      });
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeAccount) {
      setPortalReady(false);
      return;
    }

    if (portalReady && isAuthorizedAdmin) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [activeAccount, portalReady, isAuthorizedAdmin]);

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
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
      window.alert(`Disconnect failed: ${error.message}`);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Loading admin portal...</p>
      </div>
    );
  }

  if (!activeAccount || !portalReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Admin Wallet</h2>
        <p className="text-slate-500 max-w-md">
          This portal is restricted to one specific admin wallet address.
        </p>
        <p className="mt-4 font-mono text-xs text-slate-500 break-all max-w-xl">
          {maskAdminAddress(ADMIN_WALLET_ADDRESS)}
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

  if (!isAuthorizedAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Denied</h2>
        <p className="text-slate-500 max-w-md">
          This portal is restricted to the approved admin wallet only.
        </p>
        <p className="mt-4 text-sm text-slate-500">Connected wallet</p>
        <p className="font-mono text-xs break-all max-w-xl">{activeAccount.address}</p>
        <p className="mt-4 text-sm text-slate-500">Required admin wallet</p>
        <p className="font-mono text-xs break-all max-w-xl">{maskAdminAddress(ADMIN_WALLET_ADDRESS)}</p>
        <button onClick={disconnectWallet} className="mt-6 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold">
          Switch Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Administration</h1>
          <p className="text-slate-500">Real-time Algorand Testnet Monitoring (App: {APP_ID})</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
             <button
              onClick={fetchMetrics}
              disabled={loading}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Admin Role
            </div>
          </div>
          <div className="text-[10px] font-mono opacity-60">Connected: {shortenAddress(ADMIN_WALLET_ADDRESS)}</div>
          <button onClick={disconnectWallet} className="text-xs text-blue-600 font-semibold">
            Switch Wallet
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-3xl border-t-4 border-emerald-500 relative overflow-hidden group shadow-lg">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tight">Contract Escrow Balance</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            {metrics.balance.toFixed(2)} ALGO
          </p>
          <p className="text-[10px] opacity-40 mt-1 font-mono">{APP_ADDRESS.slice(0, 16)}...</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-t-4 border-blue-500 relative overflow-hidden group shadow-lg">
           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tight">Total Consent Boxes</p>
          <p className="text-4xl font-black">{metrics.boxCount}</p>
          <p className="text-[10px] opacity-40 mt-1 uppercase">Immutable Data Records</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-t-4 border-purple-500 relative overflow-hidden group shadow-lg">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <LineChart className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-tight">Recent Interactions</p>
          <p className="text-4xl font-black">{metrics.txCount}</p>
          <p className="text-[10px] opacity-40 mt-1 uppercase">Last 10 Applications Calls</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Live Transaction Log
        {loading && <Loader2 className="w-4 h-4 animate-spin opacity-40" />}
      </h2>

      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 font-bold text-slate-500 text-xs uppercase">Round / Time</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-xs uppercase">Type / Method</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-xs uppercase">Sender Address</th>
                <th className="py-4 px-6 font-bold text-slate-500 text-xs uppercase text-right">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentTxs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 italic">No recent transactions found for this app.</td>
                </tr>
              ) : (
                metrics.recentTxs.map((tx, i) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-sm">#{tx.confirmed-round}</p>
                      <p className="text-[10px] opacity-50">{new Date(tx['round-time'] * 1000).toLocaleTimeString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                        tx['application-transaction']['on-completion'] === 'noop'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tx['tx-type']} / {tx['application-transaction']['on-completion']}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] opacity-70">
                      {tx.sender.slice(0, 12)}...{tx.sender.slice(-12)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a
                        href={`https://perawallet.app/explorer/transaction/${tx.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-bold text-xs"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-6 text-center text-slate-400 text-xs italic">
        The admin dashboard monitors global application state and transaction logs directly from the Algorand Indexer nodes.
      </p>
    </div>
  );
}
