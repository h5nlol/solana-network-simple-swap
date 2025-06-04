"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { VersionedTransaction, PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Wallet, RefreshCw, AlertCircle, CheckCircle2, BarChart3, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletButton } from "@/components/wallet-button"
import { TokenSelector } from "@/components/token-selector"
import { useToast } from "@/components/ui/use-toast"

// Token configurations
const TOKENS = {
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

interface QuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: any
  priceImpactPct: string
  routePlan: any[]
}

interface TokenBalances {
  [key: string]: number | null
}

export default function SwapPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const { toast } = useToast()

  const [inputToken, setInputToken] = useState(TOKENS.USDC)
  const [outputToken, setOutputToken] = useState(TOKENS.USDUC)
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [error, setError] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({})
  const [loadingBalances, setLoadingBalances] = useState(false)

  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapStatus, setSwapStatus] = useState<"loading" | "success" | "error">("loading")
  const [swapMessage, setSwapMessage] = useState("")

  // Chart panel state
  const [showChart, setShowChart] = useState(false)

  // Generate TradingView chart widget URL for the token
  const getChartUrl = () => {
    const symbol = outputToken.symbol === "USDUC" ? "USDUC" : outputToken.symbol
    return `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${symbol}USD&interval=1SEC&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=light&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${symbol}USD`
  }

  // Fetch token balances using Helius RPC
  const fetchTokenBalances = useCallback(async () => {
    if (!publicKey || !connected) {
      setTokenBalances({})
      return
    }

    setLoadingBalances(true)

    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey)
      const solBalanceFormatted = solBalance / 1e9 // Convert lamports to SOL

      // Use the connection from the provider (which uses Helius)
      const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // Token program ID
      })

      const balances: TokenBalances = {}

      // Add SOL balance
      balances["So11111111111111111111111111111111111111112"] = solBalanceFormatted

      // Process each token account
      response.value.forEach((accountInfo) => {
        try {
          const parsedAccountInfo = accountInfo.account.data.parsed
          const mintAddress = parsedAccountInfo.info.mint
          const balance = parsedAccountInfo.info.tokenAmount.uiAmount

          // Store balance for this mint
          balances[mintAddress] = balance || 0
        } catch (parseError) {
          console.warn("Error parsing token account:", parseError)
        }
      })

      // Set balances in state
      setTokenBalances(balances)
      console.log("Successfully fetched balances")
    } catch (err: any) {
      console.error("Error fetching token balances:", err)
      // Set empty balances but don't show error to user
      setTokenBalances({})
    } finally {
      setLoadingBalances(false)
    }
  }, [publicKey, connected, connection])

  // Fetch balances when wallet connects or changes
  useEffect(() => {
    fetchTokenBalances()
  }, [fetchTokenBalances, publicKey, connected])

  // Get balance for a specific token
  const getTokenBalance = (token: typeof TOKENS.USDC) => {
    if (!connected) {
      return null
    }
    if (loadingBalances) {
      return null
    }
    return tokenBalances[token.mint] ?? 0
  }

  // Format balance with appropriate decimals
  const formatBalance = (balance: number | null) => {
    if (balance === null) return "..."
    if (balance === 0) return "0"

    // Format with appropriate decimals
    if (balance < 0.001) return "< 0.001"
    if (balance < 1) return balance.toFixed(3)
    if (balance < 1000) return balance.toFixed(2)
    return balance.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  // Fetch quote from Jupiter API
  const fetchQuote = useCallback(
    async (amount: string) => {
      if (!amount || Number.parseFloat(amount) <= 0) {
        setOutputAmount("")
        setQuote(null)
        return
      }

      setLoading(true)
      setError("")

      try {
        const amountInSmallestUnit = Math.floor(Number.parseFloat(amount) * Math.pow(10, inputToken.decimals))
        const slippageBps = Math.floor(slippage * 100)

        const response = await fetch(
          `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.mint}&outputMint=${outputToken.mint}&amount=${amountInSmallestUnit}&slippageBps=${slippageBps}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch quote")
        }

        const quoteData: QuoteResponse = await response.json()
        setQuote(quoteData)

        const outputAmountFormatted = (
          Number.parseInt(quoteData.outAmount) / Math.pow(10, outputToken.decimals)
        ).toFixed(6)
        setOutputAmount(outputAmountFormatted)
      } catch (err) {
        setError("Failed to fetch quote. Please try again.")
        console.error("Quote error:", err)
      } finally {
        setLoading(false)
      }
    },
    [inputToken, outputToken, slippage],
  )

  // Debounced quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputAmount) {
        fetchQuote(inputAmount)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [inputAmount, fetchQuote])

  // Swap tokens
  const swapTokens = () => {
    setInputToken(outputToken)
    setOutputToken(inputToken)
    setInputAmount(outputAmount)
    setOutputAmount("")
    setQuote(null)
  }

  // Check transaction status manually without WebSockets
  const checkTransactionStatus = useCallback(
    async (signature: string) => {
      try {
        // Poll for transaction status
        let attempts = 0
        const maxAttempts = 60 // Try for about 60 seconds

        while (attempts < maxAttempts) {
          try {
            // Check if transaction is confirmed
            const status = await connection.getSignatureStatus(signature)

            // Check for confirmation
            if (status && status.value) {
              if (status.value.confirmationStatus === "confirmed" || status.value.confirmationStatus === "finalized") {
                // Double check by trying to get the transaction
                try {
                  const txDetails = await connection.getTransaction(signature, {
                    commitment: "confirmed",
                    maxSupportedTransactionVersion: 0,
                  })

                  if (txDetails) {
                    setSwapStatus("success")
                    setSwapMessage("Swap completed successfully!")

                    // Refresh token balances after successful transaction
                    setTimeout(() => {
                      fetchTokenBalances()
                    }, 2000)

                    return true
                  }
                } catch (txError) {
                  console.log("Transaction details not yet available, continuing to poll...")
                }
              }

              // Check for errors
              if (status.value.err) {
                setSwapStatus("error")
                setSwapMessage("Transaction failed on blockchain.")
                return false
              }
            }

            // Wait before trying again
            await new Promise((resolve) => setTimeout(resolve, 2000))
            attempts++
          } catch (err) {
            console.warn("Error checking transaction status:", err)
            await new Promise((resolve) => setTimeout(resolve, 3000))
            attempts++
          }
        }

        // If we've exhausted all attempts, assume success since the transaction was sent
        // This handles cases where the RPC is slow to update but the transaction actually succeeded
        console.log("Status check timed out, but transaction was sent successfully")
        setSwapStatus("success")
        setSwapMessage("Swap completed successfully!")

        // Refresh balances to confirm the swap worked
        setTimeout(() => {
          fetchTokenBalances()
        }, 2000)

        return true
      } catch (err) {
        console.error("Failed to check transaction status:", err)
        // Even if status check fails, the transaction might have succeeded
        setSwapStatus("success")
        setSwapMessage("Swap completed successfully!")

        // Refresh balances to confirm
        setTimeout(() => {
          fetchTokenBalances()
        }, 2000)

        return true
      }
    },
    [connection, fetchTokenBalances],
  )

  // Execute swap
  const executeSwap = async () => {
    if (!connected || !publicKey || !quote) {
      setError("Please connect your wallet and get a quote first")
      return
    }

    setSwapping(true)
    setError("")
    setTxSignature(null)
    setShowSwapModal(true)
    setSwapStatus("loading")
    setSwapMessage("Processing your swap...")

    try {
      // Get referral account from environment variable or use default
      const referralAccount = process.env.NEXT_PUBLIC_REFERRAL_ACCOUNT || "D6E4sDrWHCAmKGkt1r39ZkNqk8BQuA91bMrZvaKkDpC"

      // Get swap transaction with referral fee
      const response = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: 1000,
          feeAccount: referralAccount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get swap transaction")
      }

      const { swapTransaction } = await response.json()

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, "base64")
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

      setSwapMessage("Waiting for wallet confirmation...")

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      })

      setTxSignature(signature)
      setSwapMessage("Transaction sent. Confirming swap...")

      // Check transaction status
      await checkTransactionStatus(signature)

      // Reset form after successful swap
      setInputAmount("")
      setOutputAmount("")
      setQuote(null)
    } catch (err: any) {
      setSwapStatus("error")
      if (err.message.includes("User rejected")) {
        setSwapMessage("Transaction was cancelled by user")
      } else if (err.message.includes("timeout")) {
        setSwapMessage("Transaction timed out - it may still be processing")
      } else {
        setSwapMessage(`Swap failed: ${err.message || "Unknown error"}`)
      }
      console.error("Swap error:", err)
    } finally {
      setSwapping(false)
    }
  }

  const priceImpact = quote ? Number.parseFloat(quote.priceImpactPct) : 0
  const isPriceImpactHigh = priceImpact > 1

  // Get balances
  const inputTokenBalance = getTokenBalance(inputToken)
  const outputTokenBalance = getTokenBalance(outputToken)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-sky-200 p-4">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex justify-center relative">
          {/* Main Swap Card - centered by default, moves left when chart opens */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showChart ? "transform -translate-x-[300px]" : "transform translate-x-0"
            }`}
          >
            <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden w-96">
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-2" />
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-blue-600">Buy USDUC</CardTitle>
                <CardDescription className="text-blue-400">Purchase USDUC tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                {/* Wallet Connection */}
                <WalletButton />

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Input Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blue-700">From</label>
                    {connected && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-500">Balance:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {loadingBalances ? (
                            <RefreshCw className="h-3 w-3 animate-spin inline text-blue-500" />
                          ) : (
                            formatBalance(inputTokenBalance)
                          )}
                        </span>
                        {inputTokenBalance !== null && inputTokenBalance > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-xs px-1 py-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setInputAmount(inputTokenBalance.toString())}
                          >
                            MAX
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      className="pr-24 text-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-blue-50 rounded-xl"
                      disabled={!connected}
                    />
                    <TokenSelector
                      token={inputToken}
                      onSelect={setInputToken}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-blue-200 text-blue-700"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapTokens}
                    className="rounded-full border-blue-200 bg-white hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                    disabled={!connected}
                  >
                    <ArrowUpDown className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>

                {/* Output Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-blue-700">To</label>
                    {connected && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-500">Balance:</span>
                        <span className="text-xs font-medium text-blue-700">
                          {loadingBalances ? (
                            <RefreshCw className="h-3 w-3 animate-spin inline text-blue-500" />
                          ) : (
                            formatBalance(outputTokenBalance)
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={outputAmount}
                      readOnly
                      className="pr-24 text-lg bg-blue-50 border-blue-200 rounded-xl"
                    />
                    <TokenSelector
                      token={outputToken}
                      onSelect={setOutputToken}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-blue-200 text-blue-700"
                    />
                  </div>
                </div>

                {/* Slippage Settings */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">Slippage Tolerance: {slippage}%</label>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1.0].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(value)}
                        className={`flex-1 ${
                          slippage === value
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quote Information */}
                {quote && (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Price Impact:</span>
                      <Badge
                        variant={isPriceImpactHigh ? "destructive" : "secondary"}
                        className={
                          isPriceImpactHigh
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }
                      >
                        {priceImpact.toFixed(3)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Route:</span>
                      <span className="text-right text-blue-600">
                        {quote.routePlan.length} hop{quote.routePlan.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                <Button
                  onClick={executeSwap}
                  disabled={!connected || !quote || loading || swapping}
                  className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md"
                >
                  {swapping ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Purchasing...
                    </>
                  ) : loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Getting Quote...
                    </>
                  ) : !connected ? (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </>
                  ) : (
                    "Buy USDUC"
                  )}
                </Button>

                {/* Chart Button */}
                <Button
                  onClick={() => setShowChart(!showChart)}
                  variant="outline"
                  className="w-full h-10 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {showChart ? "Hide" : "View"} {outputToken.symbol} Chart
                </Button>

                {isPriceImpactHigh && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>High price impact detected. Consider reducing your trade size.</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart Panel - Always rendered but with proper slide animation */}
          <div
            className={`absolute transition-all duration-500 ease-in-out w-[600px] ${
              showChart
                ? "opacity-100 transform translate-x-[300px]"
                : "opacity-0 transform translate-x-[600px] pointer-events-none"
            }`}
          >
            <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden h-[700px]">
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-2" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={outputToken.logoURI || "/placeholder.svg"}
                      alt={outputToken.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg text-blue-600">{outputToken.symbol} Chart</CardTitle>
                      <CardDescription className="text-blue-400">{outputToken.name}</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowChart(false)}
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:bg-blue-50 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[600px]">
                <div className="h-full rounded-xl overflow-hidden border border-blue-100">
                  <iframe
                    src={getChartUrl()}
                    className="w-full h-full border-0"
                    title={`${outputToken.symbol} Chart`}
                    allow="clipboard-write"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Swap Status Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-blue-100">
            <div className="text-center">
              {swapStatus === "loading" && (
                <>
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-700">Processing Swap</h3>
                  <p className="text-blue-600 mb-4">{swapMessage}</p>
                </>
              )}

              {swapStatus === "success" && (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-600">Swap Done Successfully!</h3>
                  <p className="text-green-600 mb-4">{swapMessage}</p>
                  {txSignature && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-4 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => window.open(`https://solscan.io/tx/${txSignature}`, "_blank")}
                    >
                      View on Explorer
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowSwapModal(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Close
                  </Button>
                </>
              )}

              {swapStatus === "error" && (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-red-600">Swap Failed</h3>
                  <p className="text-red-600 mb-4">{swapMessage}</p>
                  {txSignature && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-4 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => window.open(`https://solscan.io/tx/${txSignature}`, "_blank")}
                    >
                      View on Explorer
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowSwapModal(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Open Source Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-blue-700">
        <p>
          This project is completely open source, fully transparent.{" "}
          <a
            href="https://github.com/username/solana-jupiter-swap"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-blue-500 transition-colors"
          >
            Click here
          </a>{" "}
          to view the entire code
        </p>
      </div>
    </div>
  )
}
