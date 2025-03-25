
import { ethers } from "ethers";
import { toast } from "sonner";

// Available blockchain node providers
export enum NodeProvider {
  INFURA = "infura",
  ALCHEMY = "alchemy"
}

// Provider configuration interface
export interface ProviderConfig {
  name: string;
  type: NodeProvider;
  apiKey: string;
  networks: {
    [chainId: number]: string;
  };
}

// Default provider configurations
const defaultProviders: { [key in NodeProvider]: ProviderConfig } = {
  [NodeProvider.INFURA]: {
    name: "Infura",
    type: NodeProvider.INFURA,
    apiKey: "", // Will be set by user
    networks: {
      1: "mainnet",
      5: "goerli",
      11155111: "sepolia",
      42161: "arbitrum",
      10: "optimism",
      137: "polygon",
      56: "binance",
      43114: "avalanche"
    }
  },
  [NodeProvider.ALCHEMY]: {
    name: "Alchemy",
    type: NodeProvider.ALCHEMY,
    apiKey: "", // Will be set by user
    networks: {
      1: "eth-mainnet",
      5: "eth-goerli",
      11155111: "eth-sepolia",
      42161: "arb-mainnet",
      10: "opt-mainnet",
      137: "polygon-mainnet"
    }
  }
};

// Store provider configuration in localStorage
export const saveProviderConfig = (provider: NodeProvider, apiKey: string): void => {
  try {
    const config = { ...defaultProviders[provider], apiKey };
    localStorage.setItem(`provider_${provider}`, JSON.stringify(config));
    toast.success(`${config.name} API key saved`);
  } catch (error) {
    console.error("Failed to save provider config:", error);
    toast.error("Failed to save API key");
  }
};

// Get provider configuration from localStorage
export const getProviderConfig = (provider: NodeProvider): ProviderConfig | null => {
  try {
    const configStr = localStorage.getItem(`provider_${provider}`);
    if (!configStr) return null;
    return JSON.parse(configStr);
  } catch (error) {
    console.error("Failed to get provider config:", error);
    return null;
  }
};

// Create ethers provider based on provider type and network
export const createProvider = (
  provider: NodeProvider, 
  chainId: number = 1
): ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | null => {
  try {
    // First check if MetaMask is available
    if (window.ethereum && window.ethereum.isMetaMask) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    
    const config = getProviderConfig(provider);
    if (!config || !config.apiKey) {
      toast.error(`${defaultProviders[provider].name} API key not found`);
      return null;
    }
    
    const network = config.networks[chainId];
    if (!network) {
      toast.error(`Network not supported by ${config.name}`);
      return null;
    }
    
    // Create RPC URL based on provider type
    let rpcUrl: string;
    if (provider === NodeProvider.INFURA) {
      rpcUrl = `https://${network}.infura.io/v3/${config.apiKey}`;
    } else if (provider === NodeProvider.ALCHEMY) {
      rpcUrl = `https://${network}.g.alchemy.com/v2/${config.apiKey}`;
    } else {
      throw new Error("Unsupported provider");
    }
    
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  } catch (error) {
    console.error("Failed to create provider:", error);
    toast.error("Failed to connect to blockchain node");
    return null;
  }
};
