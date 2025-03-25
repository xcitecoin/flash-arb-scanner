
import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { shortenAddress } from "@/lib/formatters";

interface WalletContextType {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  ethereum: any;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  ethereum: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ethereum, setEthereum] = useState<any>(null);

  // Initialize ethereum object with better mobile detection
  useEffect(() => {
    const detectEthereum = () => {
      // Check for ethereum in window
      const ethereum = (window as any).ethereum;
      
      if (ethereum) {
        console.log("MetaMask detected in window.ethereum");
        setEthereum(ethereum);
        return true;
      }
      
      // Check for ethereum in ethereum-compatible browsers
      if ((window as any).web3?.currentProvider) {
        console.log("MetaMask detected in window.web3.currentProvider");
        setEthereum((window as any).web3.currentProvider);
        return true;
      }
      
      // Check if on mobile
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
      
      if (isMobile) {
        // Deep link to MetaMask if on mobile
        console.log("Mobile device detected, will try deep linking to MetaMask");
      }
      
      return false;
    };
    
    const checkConnection = async () => {
      if (!ethereum) return;
      
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const userBalance = await provider.getBalance(accounts[0]);
          
          setAddress(accounts[0]);
          setChainId(network.chainId);
          setBalance(ethers.utils.formatEther(userBalance));
          
          toast.success("Wallet connected", {
            description: shortenAddress(accounts[0]),
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    // Detect ethereum and check connection
    if (detectEthereum()) {
      checkConnection();
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else if (accounts[0] !== address) {
        // Account changed
        setAddress(accounts[0]);
        updateBalance(accounts[0]);
        toast.info("Account changed", {
          description: shortenAddress(accounts[0]),
        });
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      toast.info("Network changed", {
        description: `ChainID: ${newChainId}`,
      });
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [ethereum, address]);

  const updateBalance = async (address: string) => {
    if (!ethereum) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const userBalance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(userBalance));
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const connectWallet = async () => {
    if (!ethereum) {
      // Handle mobile deep linking to MetaMask
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
      
      if (isMobile) {
        // Create deep link to MetaMask
        const dappUrl = window.location.href;
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        
        toast.info("Redirecting to MetaMask", {
          description: "Opening MetaMask mobile app...",
          action: {
            label: "Cancel",
            onClick: () => console.log("Cancelled MetaMask redirect"),
          },
        });
        
        // Redirect to MetaMask
        window.location.href = metamaskAppDeepLink;
        return;
      }
      
      // Desktop browser without MetaMask
      toast.error("MetaMask not installed", {
        description: "Please install MetaMask to connect your wallet",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const network = await provider.getNetwork();
      const userBalance = await provider.getBalance(accounts[0]);

      setAddress(accounts[0]);
      setChainId(network.chainId);
      setBalance(ethers.utils.formatEther(userBalance));

      toast.success("Wallet connected", {
        description: shortenAddress(accounts[0]),
      });
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Connection rejected", {
          description: "You rejected the connect request",
        });
      } else {
        toast.error("Connection failed", {
          description: error.message || "Could not connect to wallet",
        });
      }
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setChainId(null);
    toast.info("Wallet disconnected");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        chainId,
        isConnecting,
        connectWallet,
        disconnectWallet,
        ethereum,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
