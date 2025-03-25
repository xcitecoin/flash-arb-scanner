
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, LogOut, Loader2 } from "lucide-react";
import { useWallet } from "@/context/WalletProvider";
import { shortenAddress } from "@/lib/formatters";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { address, balance, chainId, isConnecting, connectWallet, disconnectWallet } = useWallet();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 glass",
        className
      )}
    >
      <div className="flex items-center">
        <h1 className="text-lg font-medium">FlashArb</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {!address ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full bg-secondary/80 backdrop-blur-sm border-secondary-foreground/10 px-4 transition-all hover:bg-secondary"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-primary/10 backdrop-blur-sm border-primary/20 px-4 transition-all hover:bg-primary/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {shortenAddress(address)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-mono text-xs">{shortenAddress(address)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>{balance ? parseFloat(balance).toFixed(4) : "0"} ETH</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{chainId === 1 ? "Ethereum" : chainId === 137 ? "Polygon" : `Chain ID: ${chainId}`}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
