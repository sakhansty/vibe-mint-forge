import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnect } from '@/components/WalletConnect';
import { NFTMinter } from '@/components/NFTMinter';
import { NFTGallery } from '@/components/NFTGallery';
import { useWallet } from '@/hooks/useWallet';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('mint');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Vibe NFT Minter
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create, mint, and showcase your unique NFTs on Base Sepolia network
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-md mx-auto mb-8">
          <WalletConnect />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {isConnected ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="mint">Mint NFT</TabsTrigger>
                <TabsTrigger value="gallery">My Gallery</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mint" className="mt-0">
                <NFTMinter />
              </TabsContent>
              
              <TabsContent value="gallery" className="mt-0">
                <NFTGallery />
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Get Started</CardTitle>
                <CardDescription className="text-center">
                  Connect your wallet to start minting NFTs on Base Sepolia
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">🎨 Create</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your artwork and metadata to IPFS
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">🔗 Mint</h3>
                    <p className="text-sm text-muted-foreground">
                      Mint your NFT on Base Sepolia network
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;