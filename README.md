# Solana Token Swap Interface

A clean and fast token swap UI built on Solana using the Jupiter aggregator. Easily swap SOL, USDC, USDUC, or any SPL token with the best prices across top DEXs like Raydium, pumpfun, pumpswap and more.

---

## 🧠 Features

- **Best Rates via Jupiter**  
  Smart routing across all Solana DEXs (Raydium, Orca, PumpSwap, Serum, etc.)

- **Live Token Balances**  
  Real-time updates after each swap

- **Price Impact Warnings**  
  See how much slippage you're taking before confirming

- **TradingView Charts**  
  Integrated charts for supported tokens

- **Wallet Support**  
  Works with Phantom, Solflare, and more

- **Custom Slippage Control**  
  Fine-tune your trade safety

- **Referral Rewards**  
  Earn from swaps using your wallet as a referral

---

## ⚙️ Tech Stack

- **Frontend**: Next.js 14 + React 18  
- **Styling**: Tailwind CSS + shadcn/ui  
- **Blockchain**: Solana Web3.js + Wallet Adapter  
- **Aggregator**: Jupiter v6 API  
- **RPC**: Helius  
- **Charts**: TradingView widget

---

## 🚀 Getting Started

### Prereqs

- Node.js 18+
- Solana wallet (Phantom, Solflare)
- Helius API key (get one at [helius.xyz](https://www.helius.xyz))

---

### 📦 Install & Run

```bash
git clone https://github.com/h5nlol/solana-network-simple-swap.git
cd solana-network-simple-swap
npm install
```

---

### 🛠️ Setup Environment

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key
NEXT_PUBLIC_REFERRAL_ACCOUNT=your_wallet_address
```

---

### 🔧 Run the App

```bash
npm run dev
```

Then open your browser:  
`http://localhost:3000`

---

## 🪙 Adding Tokens

To add more tokens, edit:

```ts
// components/token-selector.tsx
// app/page.tsx

NEW_TOKEN: {
  mint: "TOKEN_MINT_ADDRESS",
  symbol: "ABC",
  name: "Your Token",
  decimals: 6,
  logoURI: "/images/your-token.png",
}
```

---

## 💰 Referral Rewards

If you set your wallet in `.env.local` as `NEXT_PUBLIC_REFERRAL_ACCOUNT`, you’ll get a % of the swap fees from users who trade through your UI (if supported by Jupiter).

---

## 🧬 How Swaps Work

1. Enter amount → app gets quote from Jupiter  
2. Picks best route from available DEXs  
3. Builds transaction → sends to wallet  
4. You confirm in wallet  
5. Swap happens on-chain  
6. App updates your balance + shows status  

---

## 📁 Folder Structure

```
├── app/
├── components/
│   ├── ui/
│   ├── wallet-provider.tsx
│   ├── wallet-button.tsx
│   └── token-selector.tsx
├── public/
│   └── images/
├── lib/
└── README.md
```

---

## 🏗️ Build for Production

```bash
npm run build
npm start
```

---

## 🤝 Contribute

1. Fork this repo  
2. Make a branch:  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make your changes and commit  
4. Push and open a pull request  

---

## 📄 License

MIT — feel free to use and modify.

---

## 🙏 Thanks To

- [Jupiter Aggregator](https://jup.ag)  
- [Solana Foundation](https://solana.org)  
- [Helius](https://helius.xyz)  
- [shadcn/ui](https://ui.shadcn.com)  
- [Vercel](https://vercel.com)

---

## ⚠️ Disclaimer

This is a free open-source project. Use at your own risk. Always verify transactions before confirming.
