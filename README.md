# Solana Token Swap Interface

A modern, user-friendly token swap interface built on the Solana blockchain. This application leverages Jupiter's powerful aggregation protocol to provide users with the best possible swap rates across multiple decentralized exchanges.

## Overview

This swap interface is designed to make token trading on Solana simple and accessible. Built with Next.js and integrated with Jupiter's aggregator, it automatically finds the most efficient routes across various DEXs to ensure users get optimal prices for their trades.

The application currently supports swapping between USDC, SOL, and USDUC tokens, with real-time balance tracking, price impact calculations, and integrated charting capabilities. (you can change that yourself, or add more tokens)

## Key Features

**Smart Routing**: Utilizes Jupiter's aggregation protocol to find the best prices across multiple DEXs including Raydium, Orca, pumpswap, non migrated pumpdotfun tokens and Serum.

**Real-time Balance Tracking**: Displays your current token balances with automatic refresh after successful swaps.

**Price Impact Protection**: Shows price impact calculations and warns users about high-impact trades to prevent unexpected losses.

**Integrated Charts**: View TradingView charts for supported tokens directly within the interface.

**Wallet Integration**: Seamless connection with popular Solana wallets including Phantom and Solflare.

**Slippage Control**: Customizable slippage tolerance settings to balance between execution speed and price protection.

**Transaction Monitoring**: Real-time transaction status updates with links to blockchain explorers for verification.

## Technology Stack

This application is built using modern web technologies optimized for performance and user experience:

- **Frontend Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Blockchain Integration**: Solana Web3.js and Wallet Adapter
- **DEX Aggregation**: Jupiter API v6
- **RPC Provider**: Helius for reliable blockchain connectivity
- **Charts**: TradingView embedded widgets

## Getting Started

### Prerequisites

Before running this application, you'll need:

- Node.js version 18 or higher
- A Helius API key (free tier available at helius.xyz)
- A Solana wallet browser extension (Phantom, Solflare, etc.)

### Installation

Clone the repository and install dependencies:

\`\`\`bash
git clone https://github.com/your-username/solana-jupiter-swap.git
cd solana-jupiter-swap
npm install
\`\`\`

### Configuration

Create your environment configuration:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit the `.env.local` file and add your Helius API key:

\`\`\`env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_REFERRAL_ACCOUNT=your_referral_wallet_address
\`\`\`

### Running the Application

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Open your browser and navigate to `http://localhost:3000` to access the swap interface.

## Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_HELIUS_API_KEY` | Your Helius RPC API key for optimal performance and rate limits | Yes |
| `NEXT_PUBLIC_REFERRAL_ACCOUNT` | Wallet address to receive referral fees from swaps | No |

### Adding New Tokens

To support additional tokens, update the token configuration in both `components/token-selector.tsx` and `app/page.tsx`:

\`\`\`typescript
NEWTOKEN: {
  mint: "token_mint_address_here",
  symbol: "TOKEN",
  name: "Token Full Name",
  decimals: 6,
  logoURI: "/images/token-logo.png",
}
\`\`\`

### Customizing Referral Fees

The application includes a referral fee mechanism that can be configured through environment variables or by modifying the `feeAccount` parameter in the swap execution code.

## How It Works

### Swap Process

1. **Quote Generation**: When you enter a swap amount, the application queries Jupiter's API to find the best route across multiple DEXs
2. **Route Optimization**: Jupiter analyzes liquidity across various pools to minimize price impact and maximize output
3. **Transaction Creation**: A swap transaction is constructed with your specified parameters
4. **Wallet Interaction**: Your wallet prompts you to approve the transaction
5. **Execution**: The transaction is submitted to the Solana network
6. **Confirmation**: The application monitors the transaction status and updates your balances

### Security Features

- All transactions require explicit wallet approval
- Price impact warnings for potentially unfavorable trades
- Slippage protection to prevent excessive price movement
- Open source code for full transparency and auditability

## Development

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── wallet-provider.tsx
│   ├── wallet-button.tsx
│   └── token-selector.tsx
├── public/               # Static assets
│   └── images/          # Token logos
├── lib/                 # Utility functions
└── README.md
\`\`\`

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Contributing

We welcome contributions from the community. Whether you're fixing bugs, adding features, or improving documentation, your help makes this project better for everyone.

### How to Contribute

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request with a clear description of your changes

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new functionality when applicable
- Update documentation for any API changes
- Ensure all tests pass before submitting

## License

This project is open source and available under the MIT License. See the LICENSE file for more details.

## Support and Community

- **Issues**: Report bugs or request features through GitHub Issues
- **Discussions**: Join community discussions for questions and ideas
- **Documentation**: Comprehensive guides available in the docs folder

## Acknowledgments

This project builds upon the excellent work of several open source projects and services:

- **Jupiter Protocol** for providing the best-in-class DEX aggregation
- **Solana Foundation** for the high-performance blockchain infrastructure
- **Helius** for reliable RPC services and developer tools
- **shadcn/ui** for the beautiful and accessible component library
- **Vercel** for seamless deployment and hosting

## Disclaimer

This software is provided as-is for educational and development purposes. Users should understand the risks associated with cryptocurrency trading and use the application at their own discretion. Always verify transactions and never trade more than you can afford to lose.
