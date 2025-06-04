# Solana Jupiter Swap Interface

A beautiful, responsive token swap interface built with Next.js and Jupiter's aggregator for the Solana blockchain.

## Features

- 🔄 **Token Swapping**: Swap between USDC, SOL, and USDUC tokens
- 📊 **Real-time Charts**: View TradingView charts for selected tokens
- 💰 **Balance Display**: See your token balances in real-time
- 🎯 **Slippage Control**: Customize slippage tolerance
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔒 **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- ⚡ **Jupiter Integration**: Best prices through Jupiter's aggregator
- 🎨 **Beautiful UI**: Modern design with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Helius API key (free at [helius.xyz](https://helius.xyz))

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd solana-jupiter-swap
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Edit `.env.local` and add your Helius API key:
\`\`\`env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_HELIUS_API_KEY` | Your Helius RPC API key for optimal performance | Yes |
| `NEXT_PUBLIC_REFERRAL_ACCOUNT` | Wallet address to receive referral fees | No |

## Configuration

### Adding New Tokens

To add new tokens, update the `TOKENS` object in both:
- `components/token-selector.tsx`
- `app/page.tsx`

Example:
\`\`\`typescript
NEWTOKEN: {
  mint: "token_mint_address_here",
  symbol: "TOKEN",
  name: "Token Name",
  decimals: 6,
  logoURI: "/images/token-logo.png",
}
\`\`\`

### Customizing Referral Fees

The app includes a referral fee mechanism. You can:
1. Set your own referral account in `.env.local`
2. Or modify the `feeAccount` in the swap execution code

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Wallet Integration**: Solana Wallet Adapter
- **Blockchain**: Solana Web3.js
- **DEX Aggregator**: Jupiter
- **Charts**: TradingView Widgets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

- Create an issue for bug reports or feature requests
- Join our community discussions
- Check out the [Jupiter documentation](https://docs.jup.ag/)

## Acknowledgments

- [Jupiter](https://jup.ag/) for the amazing DEX aggregator
- [Helius](https://helius.xyz/) for reliable RPC infrastructure
- [Solana](https://solana.com/) for the fast blockchain
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
