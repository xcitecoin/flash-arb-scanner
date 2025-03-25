
export interface ArbitrageOpportunity {
  id: string;
  sourceDex: string;
  targetDex: string;
  tokenPair: string;
  priceGap: number;
  potentialProfit: number;
  timestamp: number;
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
