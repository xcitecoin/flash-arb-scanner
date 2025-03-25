
import { ethers } from "ethers";
import { TokenPair, ArbitrageOpportunity } from "./types";
import { toast } from "sonner";
import { createProvider, NodeProvider } from "./providers";
import { formatCurrency } from "./formatters";

// ABI for Uniswap V2 Router
const uniswapV2RouterABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"
];

// Marketplace interfaces for different DEXes
const DEX_INTERFACES = {
  UniswapV2: {
    router: uniswapV2RouterABI,
    routers: {
      // Mainnet
      1: {
        Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        SushiSwap: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        PancakeSwap: "0x10ED43C718714eb63d5aA57B78B54704E256024E"
      },
      // Polygon
      137: {
        QuickSwap: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        SushiSwap: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"
      }
    }
  }
};

// Common token addresses
export const COMMON_TOKENS = {
  // Ethereum Mainnet
  1: {
    ETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  // Polygon
  137: {
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  }
};

// Get token price from a DEX
export const getTokenPrice = async (
  provider: ethers.providers.Provider,
  routerAddress: string,
  baseToken: string,
  quoteToken: string,
  amount: string = "1"
): Promise<number | null> => {
  try {
    const router = new ethers.Contract(
      routerAddress,
      uniswapV2RouterABI,
      provider
    );
    
    const amountIn = ethers.utils.parseEther(amount);
    const path = [baseToken, quoteToken];
    
    const amounts = await router.getAmountsOut(amountIn, path);
    return parseFloat(ethers.utils.formatUnits(amounts[1], 6)); // Assuming USDC/USDT with 6 decimals
  } catch (error) {
    console.error("Failed to get token price:", error);
    return null;
  }
};

// Scan for arbitrage opportunities across DEXes
export const scanArbitrageOpportunities = async (
  chainId: number = 1,
  providerType: NodeProvider = NodeProvider.INFURA
): Promise<ArbitrageOpportunity[]> => {
  const provider = createProvider(providerType, chainId);
  if (!provider) {
    toast.error("Failed to connect to blockchain node");
    return [];
  }
  
  try {
    toast.info("Scanning for arbitrage opportunities...");
    
    const tokenPairs = [
      { base: COMMON_TOKENS[chainId]?.ETH || COMMON_TOKENS[chainId]?.WETH, quote: COMMON_TOKENS[chainId]?.USDC, symbol: "ETH/USDC" },
      { base: COMMON_TOKENS[chainId]?.WBTC, quote: COMMON_TOKENS[chainId]?.USDC, symbol: "WBTC/USDC" }
    ];
    
    const dexes = Object.keys(DEX_INTERFACES.UniswapV2.routers[chainId] || {});
    if (dexes.length === 0) {
      toast.error(`No DEXes configured for chain ID ${chainId}`);
      return [];
    }
    
    const opportunities: ArbitrageOpportunity[] = [];
    
    for (const pair of tokenPairs) {
      const prices = [];
      
      // Get prices from all DEXes
      for (const dex of dexes) {
        const routerAddress = DEX_INTERFACES.UniswapV2.routers[chainId][dex];
        const price = await getTokenPrice(provider, routerAddress, pair.base, pair.quote);
        
        if (price !== null) {
          prices.push({ dex, price });
        }
      }
      
      // Find arbitrage opportunities
      if (prices.length >= 2) {
        prices.sort((a, b) => a.price - b.price);
        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        
        const priceGap = ((maxPrice.price - minPrice.price) / minPrice.price) * 100;
        
        // Only add if there's a meaningful price gap
        if (priceGap > 0.5) {
          const potentialProfit = (priceGap / 100) * 1000; // Assuming $1000 trade
          
          opportunities.push({
            id: `${Date.now()}-${pair.symbol}`,
            sourceDex: minPrice.dex,
            targetDex: maxPrice.dex,
            tokenPair: pair.symbol,
            priceGap,
            potentialProfit,
            timestamp: Date.now(),
            tokenAddresses: {
              token0: pair.base,
              token1: pair.quote
            }
          });
        }
      }
    }
    
    if (opportunities.length > 0) {
      toast.success(`Found ${opportunities.length} arbitrage opportunities`);
    } else {
      toast.info("No arbitrage opportunities found");
    }
    
    return opportunities;
  } catch (error) {
    console.error("Failed to scan arbitrage opportunities:", error);
    toast.error("Failed to scan arbitrage opportunities");
    return [];
  }
};
