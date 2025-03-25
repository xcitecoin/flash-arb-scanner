
import { ArbitrageOpportunity } from './types';

// Mock data for arbitrage opportunities
export const generateMockOpportunities = (): ArbitrageOpportunity[] => {
  const dexes = ['Uniswap', 'SushiSwap', 'Curve', 'Balancer', 'PancakeSwap', 'Trader Joe'];
  const tokenPairs = ['ETH/USDC', 'WBTC/ETH', 'LINK/ETH', 'UNI/ETH', 'AAVE/ETH', 'MKR/ETH'];
  
  const opportunities: ArbitrageOpportunity[] = [];
  
  // Generate 5-8 random opportunities
  const count = Math.floor(Math.random() * 4) + 5;
  
  for (let i = 0; i < count; i++) {
    // Select random dexes
    const sourceIndex = Math.floor(Math.random() * dexes.length);
    let targetIndex = Math.floor(Math.random() * dexes.length);
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * dexes.length);
    }
    
    // Select random token pair
    const pairIndex = Math.floor(Math.random() * tokenPairs.length);
    
    // Generate random price gap between 0.1% and 3.5%
    const priceGap = parseFloat((Math.random() * 3.4 + 0.1).toFixed(2));
    
    // Generate potential profit between $10 and $500
    const potentialProfit = parseFloat((Math.random() * 490 + 10).toFixed(2));
    
    opportunities.push({
      id: `arb-${i + 1}`,
      sourceDex: dexes[sourceIndex],
      targetDex: dexes[targetIndex],
      tokenPair: tokenPairs[pairIndex],
      priceGap,
      potentialProfit,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000), // Random timestamp within the last hour
    });
  }
  
  // Sort by potential profit (highest first)
  return opportunities.sort((a, b) => b.potentialProfit - a.potentialProfit);
};
