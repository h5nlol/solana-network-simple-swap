"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"

export function WalletButton() {
  const { connected, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <Button
      onClick={handleClick}
      variant={connected ? "outline" : "default"}
      className={`w-full h-12 rounded-xl ${
        connected ? "border-blue-200 text-blue-700 hover:bg-blue-50" : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
    >
      {connected ? (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {publicKey ? formatAddress(publicKey.toString()) : "Disconnect"}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
