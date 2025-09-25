import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const NFT_CONTRACT_ABI = [
  "function mint(string tokenURI) external"
];

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Placeholder

export const NFTMinter: React.FC = () => {
  const { isConnected, signer } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const uploadToIPFS = async (): Promise<string | null> => {
    if (!file || !name) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);

      const { data, error } = await supabase.functions.invoke('upload-to-ipfs', {
        body: formData,
      });

      if (error) throw error;
      
      return data.tokenURI;
    } catch (error) {
      console.error('IPFS upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload to IPFS",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const mintNFT = async () => {
    if (!isConnected || !signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const tokenURI = await uploadToIPFS();
    if (!tokenURI) return;

    setIsMinting(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
      const tx = await contract.mint(tokenURI);
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash}`,
      });

      await tx.wait();
      
      toast({
        title: "NFT Minted Successfully!",
        description: "Your NFT has been minted on Base Sepolia",
      });

      // Reset form
      setFile(null);
      setName('');
      setDescription('');
      setPreviewUrl('');
    } catch (error) {
      console.error('Minting error:', error);
      toast({
        title: "Minting Failed",
        description: "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          Mint Your NFT
        </CardTitle>
        <CardDescription>
          Upload your artwork and mint it as an NFT on Base Sepolia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file">Artwork</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input
                id="file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter NFT name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your NFT"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={mintNFT}
          disabled={!file || !name || !isConnected || isUploading || isMinting}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading to IPFS...
            </>
          ) : isMinting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Minting NFT...
            </>
          ) : (
            'Mint NFT'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};