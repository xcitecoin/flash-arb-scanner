
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletProvider";

export function useGasPrice(refreshInterval = 30000) {
  const { ethereum } = useWallet();
  const [gasPrice, setGasPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGasPrice = async () => {
    if (!ethereum) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const gasPriceWei = await provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPriceWei, "gwei"));
      setGasPrice(gasPriceGwei);
    } catch (err: any) {
      console.error("Error fetching gas price:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initially
    if (ethereum) {
      fetchGasPrice();
    }
    
    // Set up interval for refreshing
    const interval = setInterval(() => {
      if (ethereum) {
        fetchGasPrice();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [ethereum, refreshInterval]);
  
  return { gasPrice, isLoading, error, refetch: fetchGasPrice };
}
