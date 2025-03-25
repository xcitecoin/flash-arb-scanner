
import { ethers } from "ethers";
import { toast } from "sonner";
import { ArbitrageOpportunity } from "./types";

// ABI for Aave FlashLoan feature (simplified)
const flashLoanABI = [
  "function flashLoan(address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] calldata modes, address onBehalfOf, bytes calldata params, uint16 referralCode)",
];

// Sample DEX trade interfaces (simplified)
const dexTradeABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)",
];

export interface FlashLoanParams {
  receiverContract: string;
  token: string;
  amount: ethers.BigNumber;
  route: {
    sourceDex: string;
    targetDex: string;
    path: string[];
  };
}

export const ARBITRAGE_FEE = 0.0009; // 0.09% fee 
export const GAS_LIMIT_ESTIMATE = 500000; // Estimated gas for the flash loan operation

// Function to estimate profitability
export const estimateProfitability = (
  opportunity: ArbitrageOpportunity,
  gasPrice: number, // in gwei
  ethPrice: number // in USD
): {
  isProtifable: boolean;
  netProfit: number;
  gasCost: number;
  flashLoanFee: number;
} => {
  // Calculate flash loan fee (0.09% for Aave v2)
  const flashLoanFee = opportunity.potentialProfit * ARBITRAGE_FEE;
  
  // Calculate gas cost
  const gasCostEth = (GAS_LIMIT_ESTIMATE * gasPrice) / 1e9; // Convert from gwei to ETH
  const gasCostUsd = gasCostEth * ethPrice;
  
  // Calculate net profit
  const netProfit = opportunity.potentialProfit - flashLoanFee - gasCostUsd;
  
  return {
    isProtifable: netProfit > 0,
    netProfit,
    gasCost: gasCostUsd,
    flashLoanFee
  };
};

// Function to execute a flash loan
export const executeFlashLoan = async (
  provider: ethers.providers.Web3Provider, 
  lendingPoolAddress: string,
  params: FlashLoanParams
): Promise<string> => {
  try {
    const signer = provider.getSigner();
    const lendingPool = new ethers.Contract(lendingPoolAddress, flashLoanABI, signer);
    
    // Prepare flash loan parameters
    const assets = [params.token];
    const amounts = [params.amount];
    const modes = [0]; // 0 = no debt, 1 = stable, 2 = variable
    const onBehalfOf = await signer.getAddress();
    const referralCode = 0;
    
    // Encode the arbitrage route details
    const encodedParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "address[]"],
      [params.route.sourceDex, params.route.targetDex, params.route.path]
    );
    
    toast.info("Executing flash loan...");
    
    // Execute the flash loan
    const tx = await lendingPool.flashLoan(
      params.receiverContract,
      assets,
      amounts,
      modes,
      onBehalfOf,
      encodedParams,
      referralCode,
      {
        gasLimit: GAS_LIMIT_ESTIMATE
      }
    );
    
    toast.info("Transaction sent", {
      description: "Waiting for confirmation..."
    });
    
    await tx.wait();
    
    toast.success("Flash loan executed successfully!");
    return tx.hash;
  } catch (error: any) {
    console.error("Flash loan execution failed:", error);
    toast.error("Flash loan failed", {
      description: error.message || "Check console for details"
    });
    throw error;
  }
};

// Function to check if a token is approved for a specific contract
export const checkAllowance = async (
  provider: ethers.providers.Web3Provider,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string
): Promise<boolean> => {
  const tokenAbi = ["function allowance(address owner, address spender) view returns (uint256)"];
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  return !allowance.isZero();
};

// Function to approve a token for a specific contract
export const approveToken = async (
  provider: ethers.providers.Web3Provider,
  tokenAddress: string,
  spenderAddress: string,
  amount: ethers.BigNumber = ethers.constants.MaxUint256
): Promise<boolean> => {
  try {
    const tokenAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    
    toast.info("Approving token...");
    
    const tx = await tokenContract.approve(spenderAddress, amount);
    await tx.wait();
    
    toast.success("Token approved!");
    return true;
  } catch (error: any) {
    console.error("Token approval failed:", error);
    toast.error("Approval failed", {
      description: error.message || "Check console for details"
    });
    return false;
  }
};

// Get current gas price
export const getGasPrice = async (provider: ethers.providers.Web3Provider): Promise<number> => {
  const gasPrice = await provider.getGasPrice();
  return parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
};

// Get ETH price in USD from a simple price oracle (could be replaced with a real oracle)
export const getEthPriceUSD = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 1800; // Fallback price
  }
};
