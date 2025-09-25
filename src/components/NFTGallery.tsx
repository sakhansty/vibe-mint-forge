import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { Gallery, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NFT_CONTRACT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function tokenURI(uint256 tokenId) external view returns (string)"
];

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Placeholder

interface NFTItem {
  tokenId: string;
  tokenURI: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
  };
}

export const NFTGallery: React.FC = () => {
  const { isConnected, provider, account } = useWallet();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!isConnected || !provider || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to view your NFTs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      
      // Get transfer events where 'to' is the current account
      const filter = contract.filters.Transfer(null, account);
      const events = await contract.queryFilter(filter);
      
      const userNFTs: NFTItem[] = [];
      
      for (const event of events) {
        if (event.args) {
          const tokenId = event.args.tokenId.toString();
          try {
            const tokenURI = await contract.tokenURI(tokenId);
            
            // If IPFS URI, convert to HTTP gateway
            let httpURI = tokenURI;
            if (tokenURI.startsWith('ipfs://')) {
              httpURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            
            // Fetch metadata
            let metadata;
            try {
              const response = await fetch(httpURI);
              metadata = await response.json();
              
              // Convert IPFS image URI to HTTP if needed
              if (metadata.image && metadata.image.startsWith('ipfs://')) {
                metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }
            } catch (error) {
              console.error('Error fetching metadata:', error);
            }
            
            userNFTs.push({ tokenId, tokenURI, metadata });
          } catch (error) {
            console.error('Error fetching token URI:', error);
          }
        }
      }
      
      setNfts(userNFTs);
      
      if (userNFTs.length === 0) {
        toast({
          title: "No NFTs found",
          description: "You haven't minted any NFTs yet",
        });
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: "Error fetching NFTs",
        description: "Failed to load your NFT collection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected, account]);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gallery className="w-6 h-6 text-primary" />
                Your NFT Collection
              </CardTitle>
              <CardDescription>
                View all NFTs you've minted on Base Sepolia
              </CardDescription>
            </div>
            <Button
              onClick={fetchNFTs}
              disabled={!isConnected || isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {!isConnected ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Gallery className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Connect Your Wallet</p>
              <p className="text-muted-foreground">
                Connect your wallet to view your NFT collection
              </p>
            </div>
          </CardContent>
        </Card>
      ) : nfts.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Gallery className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No NFTs Found</p>
              <p className="text-muted-foreground">
                You haven't minted any NFTs yet. Go to the Mint page to create your first NFT!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.tokenId} className="overflow-hidden">
              <div className="aspect-square relative">
                {nft.metadata?.image ? (
                  <img
                    src={nft.metadata.image}
                    alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Gallery className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold truncate">
                    {nft.metadata?.name || `NFT #${nft.tokenId}`}
                  </h3>
                  <span className="text-sm text-muted-foreground">#{nft.tokenId}</span>
                </div>
                {nft.metadata?.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {nft.metadata.description}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`https://sepolia-explorer.base.org/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};