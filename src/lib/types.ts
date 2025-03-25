
export interface ArbitrageOpportunity {
  id: string;
  sourceDex: string;
  targetDex: string;
  tokenPair: string;
  priceGap: number;
  potentialProfit: number;
  timestamp: number;
  tokenAddresses?: {
    token0: string;
    token1: string;
  };
  rawAmounts?: {
    amountIn: string;
    amountOut: string;
  };
  executionStatus?: 'pending' | 'completed' | 'failed';
}

export interface TokenPrice {
  dex: string;
  price: number;
}

export interface TokenPair {
  id: string;
  name: string;
  token0: string;
  token1: string;
  prices: TokenPrice[];
}

export interface GasSettings {
  gasPrice: number; // in gwei
  priorityFee: number; // in gwei
  gasLimit: number;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  lendingPoolAddress: string;
  flashLoanReceiverAddress: string;
  supportedDexes: {
    [dexName: string]: {
      routerAddress: string;
      factoryAddress: string;
    };
  };
}

export interface ExecutionSettings {
  minProfitThreshold: number;
  maxSlippage: number;
  autoExecute: boolean;
}
