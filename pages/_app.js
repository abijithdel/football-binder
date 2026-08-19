import React from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { AppProvider } from '../context/AppContext';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <Head>
        <title>Football Play Bid | Live Player Auction Arena</title>
        <meta name="description" content="Real-time football player live bidding and squad management system." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>" />
      </Head>
      <div className="min-h-screen flex flex-col bg-[#070708] text-white">
        <div className="ambient-glow" />
        <Navbar />
        <main className="flex-1 pb-16">
          <Component {...pageProps} />
        </main>
        <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-500 font-mono">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>FOOTBALL PLAY BID SYSTEM • REAL-TIME SOCKET.IO AUCTION</div>
            <div className="text-zinc-600">HIGH CONTRAST MONOCHROME EDITION</div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
