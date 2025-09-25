# Vibe NFT Minter 🎨

A modern, full-stack Web3 dApp for minting NFTs on Base Sepolia network. Built with React, Tailwind CSS, Supabase, and ethers.js.

## Features

- 🔗 **MetaMask Integration** - Connect your wallet seamlessly
- 🎨 **IPFS Upload** - Upload images and metadata to IPFS via NFT.Storage
- ⚡ **NFT Minting** - Mint NFTs directly on Base Sepolia
- 🖼️ **Gallery View** - Browse your minted NFT collection
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🔄 **Real-time Updates** - Live transaction status and notifications

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase Edge Functions
- **Blockchain**: Ethereum (Base Sepolia) + ethers.js
- **Storage**: IPFS via NFT.Storage
- **UI Components**: shadcn/ui + Lucide React

## Prerequisites

1. **MetaMask** - Install MetaMask browser extension
2. **Base Sepolia ETH** - Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
3. **NFT.Storage Account** - Get free API key from [NFT.Storage](https://nft.storage/)
4. **Contract Address** - Deploy your ERC-721 contract or use existing one

## Quick Start

### 1. Clone & Install
```bash
git clone <your-repo>
cd vibe-nft-minter
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
```env
# NFT.Storage API Key (get from https://nft.storage/)
NFT_STORAGE_KEY=your_nft_storage_api_key

# Alchemy Base Sepolia RPC URL (optional - for better reliability)
ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/your_api_key

# Your deployed ERC-721 contract address
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

### 3. Supabase Setup
1. Create a [Supabase](https://supabase.com) account
2. Create a new project
3. Go to **Edge Functions** in your Supabase dashboard
4. Deploy the upload function:
```bash
supabase functions deploy upload-to-ipfs --project-ref your-project-ref
```
5. Add your NFT_STORAGE_KEY as a secret in Supabase:
```bash
supabase secrets set NFT_STORAGE_KEY=your_key --project-ref your-project-ref
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Smart Contract

Your ERC-721 contract needs a public `mint` function:

```solidity
function mint(string memory tokenURI) public returns (uint256) {
    uint256 tokenId = _tokenIds.current();
    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenURI);
    _tokenIds.increment();
    return tokenId;
}
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── WalletConnect.tsx    # MetaMask connection
│   ├── NFTMinter.tsx        # Minting interface
│   └── NFTGallery.tsx       # NFT collection display
├── hooks/
│   └── useWallet.ts         # Wallet connection hook
├── pages/
│   └── Index.tsx           # Main app page
└── integrations/
    └── supabase/           # Supabase client & types
supabase/
└── functions/
    └── upload-to-ipfs/     # IPFS upload endpoint
        └── index.ts
```

## Deployment

### Deploy to Vercel

1. **Frontend Deployment**:
   - Connect your GitHub repo to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on git push

2. **Backend Deployment**:
   - Supabase Edge Functions are automatically deployed
   - Update function secrets via Supabase CLI

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NFT_STORAGE_KEY` - Your NFT.Storage API key
- `ALCHEMY_BASE_SEPOLIA_URL` - Alchemy RPC URL (optional)
- `CONTRACT_ADDRESS` - Your deployed contract address

## Usage

1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask connection
2. **Switch Network** - Ensure you're on Base Sepolia network
3. **Upload & Mint**:
   - Select an image file (JPEG, PNG, GIF, WebP)
   - Add NFT name and description
   - Click "Upload to IPFS" to get tokenURI
   - Click "Mint NFT" and confirm transaction
4. **View Gallery** - Switch to "My Gallery" tab to see your NFTs

## Troubleshooting

**MetaMask Issues:**
- Make sure MetaMask is installed and unlocked
- Check that you're on Base Sepolia network
- Ensure you have sufficient ETH for gas fees

**Upload Issues:**
- Verify NFT_STORAGE_KEY is set correctly
- Check file size (max 10MB) and type (images only)
- Ensure Supabase Edge Function is deployed

**Transaction Issues:**
- Check contract address is correct
- Verify contract has mint function
- Ensure you have enough ETH for gas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [NFT.Storage Docs](https://nft.storage/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [ethers.js Docs](https://docs.ethers.org/)

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/74a962cb-79e7-452a-8d00-8cae8fca74fd

You can continue editing this project on [Lovable](https://lovable.dev/projects/74a962cb-79e7-452a-8d00-8cae8fca74fd).