"use client"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Token {
  mint: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

interface TokenSelectorProps {
  token: Token
  onSelect: (token: Token) => void
  className?: string
}

const AVAILABLE_TOKENS = {
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "/images/usdc-logo.jpg",
  },
  SOL: {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    logoURI: "/images/solana-logo.png",
  },
  USDUC: {
    mint: "CB9dDufT3ZuQXqqSfa1c5kY935TEreyBw9XJXxHKpump",
    symbol: "USDUC",
    name: "USDUC Token",
    decimals: 6,
    logoURI: "/images/usduc-logo.png",
  },
}

export function TokenSelector({ token, onSelect, className }: TokenSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`hover:bg-blue-50 ${className}`}>
          <img src={token.logoURI || "/placeholder.svg"} alt={token.symbol} className="w-4 h-4 mr-1 rounded-full" />
          {token.symbol}
          <ChevronDown className="ml-1 h-3 w-3 text-blue-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-blue-100 shadow-lg">
        {Object.values(AVAILABLE_TOKENS).map((availableToken) => (
          <DropdownMenuItem
            key={availableToken.mint}
            onClick={() => onSelect(availableToken)}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700"
          >
            <img
              src={availableToken.logoURI || "/placeholder.svg"}
              alt={availableToken.symbol}
              className="w-5 h-5 rounded-full"
            />
            <div>
              <div className="font-medium">{availableToken.symbol}</div>
              <div className="text-xs text-blue-500">{availableToken.name}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
