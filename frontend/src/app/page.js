"use client";

import { useWallet } from '@txnlab/use-wallet-react';
import Link from "next/link";
import { ShieldCheck, Zap, Lock, Coins, ArrowRight, User, Building2, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { providers, activeAccount } = useWallet();

  const handleConnect = async () => {
    if (providers) {
      // Connect specifically with Pera Wallet
      const pera = providers.find(p => p.metadata.id === 'pera');
      if (pera) {
        await pera.connect();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400">
            ConsentChain
          </span>
        </div>
        <div className="flex items-center gap-4">
          {activeAccount ? (
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 items-center gap-2 border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium opacity-80">
                {activeAccount.address.slice(0, 5)}...{activeAccount.address.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="glow-effect px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Connect Pera Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 flex flex-col items-center text-center max-w-5xl relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8 text-blue-600 dark:text-blue-400">
          <span className="flex w-2 h-2 rounded-full bg-blue-500"></span>
          DPDP Act 2023 Compliant Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Own Your Data. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400">
            Monetize Your Consent.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl">
          A revolutionary escrow-based consent management platform built on Algorand. 
          Empowering individuals with transparent control over their digital footprint while enabling fair compensation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/user" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-lg transition-transform hover:scale-105 hover:shadow-xl">
            <User className="w-5 h-5" />
            User Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/company" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-full glass-card font-semibold text-lg transition-transform hover:scale-105 hover:border-blue-500/50">
            <Building2 className="w-5 h-5 text-blue-500" />
            Company Portal
          </Link>
        </div>
      </main>

      {/* Feature Sections */}
      <section className="container mx-auto px-6 py-20 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Powered by DPDP Act 2023 🇮🇳</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              The Digital Personal Data Protection Act of 2023 establishes a comprehensive framework for the processing of digital personal data in India. It recognizes both the right of individuals to protect their personal data and the need to process such data for lawful purposes.
            </p>
            <ul className="space-y-4">
              {[
                "Explicit Notice & Consent mechanisms",
                "Right to view, correct, and erase data",
                "Right to nominate and grievance redressal",
                "Strict penalties for non-compliance"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="space-y-6 relative z-10">
              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">User Consent Status</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-sm font-medium">Active</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 opacity-70">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Data Access Request</span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-sm font-medium">Paused</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Algorand?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            ConsentChain leverages the Algorand blockchain to guarantee immutable consent records and instant, microscopic-fee escrow payments.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: "Blazing Fast", desc: "Sub-4 second finality ensures your consent changes are processed instantly.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Lock, title: "Quantum Secure", desc: "State-of-the-art cryptography guarantees your preferences cannot be tampered with.", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: Coins, title: "Micro-Payments", desc: "Fraction of a cent transaction fees make our 50/50 escrow split model viable.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: ShieldCheck, title: "Transparent", desc: "Every consent change and payment is publicly verifiable on the immutable ledger.", color: "text-purple-500", bg: "bg-purple-500/10" }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400 mt-20">
        <p>© 2026 ConsentChain Algorand. Built for data sovereignty.</p>
      </footer>
    </div>
  );
}
