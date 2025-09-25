import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

export interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });

  const BASE_SEPOLIA_CHAIN_ID = 84532;

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setWalletState({
        account: accounts[0],
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
      });

      // Check if on Base Sepolia
      if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Base Sepolia network",
          variant: "destructive",
        });
        await switchToBaseSepolia();
      } else {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const switchToBaseSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Base Sepolia network:', addError);
        }
      }
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
    });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({ ...prev, account: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToBaseSepolia,
  };
};

declare global {
  interface Window {
    ethereum?: any;
  }
}