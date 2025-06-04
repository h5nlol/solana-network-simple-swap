"use client"

import type React from "react"

import { useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import type { Commitment } from "@solana/web3.js"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Use Helius RPC with API key from environment variable
  const endpoint = useMemo(() => {
    const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY
    if (!heliusApiKey) {
      console.warn("NEXT_PUBLIC_HELIUS_API_KEY not found, falling back to public RPC")
      return "https://api.mainnet-beta.solana.com"
    }
    return `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`
  }, [])

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  // Create connection with custom config to completely disable WebSockets
  const connectionConfig = useMemo(() => {
    return {
      commitment: "confirmed" as Commitment,
      disableRetryOnRateLimit: false,
      confirmTransactionInitialTimeout: 60000, // 60 seconds
      wsEndpoint: "", // Empty string completely disables WebSockets
    }
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
