import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (isConnected && account) {
    return (
      <Button
        onClick={disconnectWallet}
        variant="outline"
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};