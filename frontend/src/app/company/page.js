"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import { useState, useEffect } from 'react';
import { Shield, Building2, Eye, Database, Coins, Loader2 } from 'lucide-react';
import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { ConsentManagerClient } from '@/contracts/ConsentManagerClient';
import algosdk, { decodeAddress } from 'algosdk';

export default function CompanyDashboard() {
  const { activeAccount, signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [consentStatuses, setConsentStatuses] = useState({});
  const [purchasedData, setPurchasedData] = useState({});

  const APP_ID = 757371604;

  const [users] = useState([
    { id: '1', address: '7SWZO2R64VOG2T253CAG6OQUDD4JRW6EDMI7K4U657DQSK2YDINK4SHGQU', name: 'User A', cost: 2 },
    { id: '2', address: 'PRAHPRIMDZLWGDDDJMYZYIV7T2SRMXISNZDA52WAK6LYFFXL2L4YJ3YSJ4', name: 'User B', cost: 2 },
  ]);

  const fetchStatuses = async () => {
    if (!activeAccount) return;
    try {
      const algorand = AlgorandClient.testNet();
      const newStatuses = {};
      
      for (const user of users) {
        try {
          // Box Key: 'c' + User + Company (activeAccount.address)
          const userBytes = decodeAddress(user.address).publicKey;
          const companyBytes = decodeAddress(activeAccount.address).publicKey;
          const prefix = new Uint8Array([99]);
          const boxKey = new Uint8Array([...prefix, ...userBytes, ...companyBytes]);
          
          const boxResponse = await algorand.client.algod.getApplicationBoxByName(APP_ID, boxKey).do();
          const value = algosdk.decodeUint64(boxResponse.value, 'safe');
          
          if (value === 1n || value === 1) newStatuses[user.id] = 'GIVEN';
          else if (value === 2n || value === 2) newStatuses[user.id] = 'PAUSED';
          else newStatuses[user.id] = 'UNKNOWN';
        } catch (e) {
          newStatuses[user.id] = 'REVOKED';
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

  const handleBuyData = async (userAddress, userId) => {
    if (!activeAccount || !signer) return;
    setLoading(true);
    try {
      const algorand = AlgorandClient.testNet();
      const client = new ConsentManagerClient({
        resolveBy: 'id',
        id: APP_ID,
        sender: activeAccount.address,
        signer: signer,
      }, algorand.client.algod);

      console.log("Initiating Data Purchase from:", userAddress);

      // Create Payment Transaction (2 ALGO to App Address)
      const payTxn = await algorand.createTransaction.payment({
        sender: activeAccount.address,
        receiver: algosdk.getApplicationAddress(APP_ID),
        amount: (2).algo(),
      });

      // Call accessData(user, payTxn)
      const result = await client.send.accessData({
        args: {
          user: userAddress,
          payTxn: payTxn,
        },
      });

      console.log("Purchase Successful! TxID:", result.transaction.txID());
      setPurchasedData(prev => ({ ...prev, [userId]: { creditScore: 780 + Math.floor(Math.random() * 20), health: "Healthy" } }));
      alert("Data purchased successfully! The payment has been split 50/50 between the User and Admin on the blockchain.");
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed: " + (error.message || "Ensure you have enough Testnet ALGO and Consent is GIVEN."));
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-slate-500">Access user data securely via Algorand Escrow (App: {APP_ID})</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Connected As</p>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <p className="font-mono font-medium">{activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-8)}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="font-semibold">Processing Escrow Payment...</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Available Records</p>
          <p className="text-3xl font-bold">{Object.values(consentStatuses).filter(s => s === 'GIVEN').length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Paused Records</p>
          <p className="text-3xl font-bold">{Object.values(consentStatuses).filter(s => s === 'PAUSED').length}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-blue-500">
          <p className="text-slate-500 text-sm font-semibold mb-1 uppercase">Records Purchased</p>
          <p className="text-3xl font-bold">{Object.keys(purchasedData).length}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">User Data Requests</h2>
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <th className="py-4 px-6 font-semibold text-slate-500">User Wallet</th>
              <th className="py-4 px-6 font-semibold text-slate-500">Consent Status</th>
              <th className="py-4 px-6 font-semibold text-slate-500">Cost</th>
              <th className="py-4 px-6 font-semibold text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-mono text-xs truncate max-w-[150px]">{user.address}</p>
                  {purchasedData[user.id] && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px] text-blue-600 border border-blue-100 dark:border-blue-800">
                      <b>DECRYPTED DATA:</b> CS: {purchasedData[user.id].creditScore} | Status: {purchasedData[user.id].health}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    consentStatuses[user.id] === 'GIVEN' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    consentStatuses[user.id] === 'PAUSED' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {consentStatuses[user.id] || 'CHECKING...'}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" /> {user.cost} ALGO
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => handleBuyData(user.address, user.id)}
                    disabled={consentStatuses[user.id] !== 'GIVEN' || purchasedData[user.id] || loading}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      consentStatuses[user.id] === 'GIVEN' && !purchasedData[user.id]
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg glow-effect' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    {purchasedData[user.id] ? 'Accessed' : 'Buy Data'}
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
