
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletProvider";
import { ArbitrageOpportunity } from "@/lib/types";
import { toast } from "sonner";
import { ethers } from "ethers";
import { 
  executeFlashLoan,
  estimateProfitability,
  getGasPrice,
  getEthPriceUSD
} from "@/lib/ethereum";
import { formatCurrency } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle, Play, Loader2 } from "lucide-react";

// Network configurations
const networkConfigs = {
  1: {
    chainId: 1,
    name: "Ethereum",
    lendingPoolAddress: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", // Aave V2 LendingPool
    flashLoanReceiverAddress: "0x0000000000000000000000000000000000000000", // This would be your deployed contract
    supportedDexes: {
      "Uniswap": {
        routerAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        factoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
      },
      "SushiSwap": {
        routerAddress: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        factoryAddress: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
      }
    }
  },
  137: {
    chainId: 137,
    name: "Polygon",
    lendingPoolAddress: "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf", // Aave V2 on Polygon
    flashLoanReceiverAddress: "0x0000000000000000000000000000000000000000",
    supportedDexes: {
      "QuickSwap": {
        routerAddress: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"
      },
      "SushiSwap": {
        routerAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        factoryAddress: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
      }
    }
  }
};

interface ArbitrageExecutorProps {
  opportunity: ArbitrageOpportunity;
  gasPrice: number;
  isSimulation?: boolean;
  autoExecute?: boolean;
  minProfitThreshold?: number;
  onExecutionComplete?: (txHash: string, status: 'completed' | 'failed') => void;
}

const ArbitrageExecutor: React.FC<ArbitrageExecutorProps> = ({ 
  opportunity, 
  gasPrice,
  isSimulation = true,
  autoExecute = false,
  minProfitThreshold = 100, // Default $100 minimum profit
  onExecutionComplete 
}) => {
  const { address, ethereum } = useWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [profitDetails, setProfitDetails] = useState<{
    isProtifable: boolean;
    netProfit: number;
    gasCost: number;
    flashLoanFee: number;
  } | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Auto-check profitability when component mounts or opportunity changes
  useEffect(() => {
    if (autoExecute && !hasChecked && address && !isCalculating && !isExecuting) {
      calculateProfitability();
    }
  }, [opportunity, autoExecute, address, hasChecked, isCalculating, isExecuting]);

  // Auto-execute if profitable and above threshold
  useEffect(() => {
    if (
      autoExecute && 
      profitDetails && 
      profitDetails.isProtifable && 
      profitDetails.netProfit >= minProfitThreshold && 
      !isExecuting && 
      address
    ) {
      executeTrade();
    }
  }, [profitDetails, autoExecute, isExecuting, address]);

  const calculateProfitability = async () => {
    if (!address) {
      toast.error("Wallet not connected");
      return;
    }

    setIsCalculating(true);
    setHasChecked(true);

    try {
      // Get current ETH price
      const ethPrice = await getEthPriceUSD();
      
      // Get current gas price if not provided
      const currentGasPrice = gasPrice || await getGasPrice(new ethers.providers.Web3Provider(ethereum));
      
      // Calculate profitability
      const details = estimateProfitability(opportunity, currentGasPrice, ethPrice);
      setProfitDetails(details);
      
      if (!details.isProtifable) {
        if (autoExecute) {
          console.log("Auto-execute: Opportunity not profitable", details);
        } else {
          toast.error("Not profitable", {
            description: `Estimated loss: ${formatCurrency(details.netProfit)}`
          });
        }
      } else {
        if (autoExecute) {
          if (details.netProfit < minProfitThreshold) {
            console.log(`Auto-execute: Profit below threshold (${formatCurrency(details.netProfit)} < ${formatCurrency(minProfitThreshold)})`);
          } else {
            toast.success("Profitable opportunity found", {
              description: `Auto-executing: ${formatCurrency(details.netProfit)} profit`
            });
          }
        } else {
          toast.success("Profitable opportunity", {
            description: `Estimated profit: ${formatCurrency(details.netProfit)}`
          });
        }
      }
    } catch (error) {
      console.error("Error calculating profitability:", error);
      toast.error("Calculation failed");
    } finally {
      setIsCalculating(false);
    }
  };

  const getNetworkConfig = (chainId: number = 1) => {
    return networkConfigs[chainId as keyof typeof networkConfigs] || networkConfigs[1];
  };

  const executeTrade = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet first to execute trades",
      });
      return;
    }

    if (!opportunity.tokenAddresses) {
      toast.error("Missing token details");
      return;
    }

    setIsExecuting(true);

    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const networkConfig = getNetworkConfig((await provider.getNetwork()).chainId);
      
      // Check if flash loan receiver is deployed
      if (networkConfig.flashLoanReceiverAddress === "0x0000000000000000000000000000000000000000") {
        toast.warning("Flash loan receiver not deployed", {
          description: "Please deploy the flash loan receiver contract first",
        });
        
        // For demo purpose, we'll continue in simulation mode
        if (!isSimulation) {
          toast.info("Switching to simulation mode");
        }
      }
      
      // This would use real parameters in a production environment
      const params = {
        receiverContract: networkConfig.flashLoanReceiverAddress,
        token: opportunity.tokenAddresses.token0,
        amount: ethers.utils.parseEther("1.0"), // Amount to borrow
        route: {
          sourceDex: opportunity.sourceDex,
          targetDex: opportunity.targetDex,
          path: [opportunity.tokenAddresses.token0, opportunity.tokenAddresses.token1]
        }
      };

      if (isSimulation || networkConfig.flashLoanReceiverAddress === "0x0000000000000000000000000000000000000000") {
        // Display info about this being a simulation
        toast.info("Simulation mode active", {
          description: autoExecute 
            ? "Auto-executing (simulation): No real transaction will be sent."
            : "This is a demonstration. No real transaction will be sent.",
        });
        
        // In a simulation, we just wait and then show a success message
        setTimeout(() => {
          toast.success("Simulation complete", {
            description: "In production, this would execute a real flash loan transaction."
          });
          
          if (onExecutionComplete) {
            onExecutionComplete(
              "0x" + Math.random().toString(16).substr(2, 40), // Fake transaction hash
              'completed'
            );
          }
          
          setIsExecuting(false);
        }, 3000);
      } else {
        // In a real implementation
        toast.info("Executing flash loan", {
          description: autoExecute 
            ? "Auto-executing arbitrage opportunity" 
            : "This will execute a real flash loan on the blockchain"
        });
        
        try {
          const txHash = await executeFlashLoan(provider, networkConfig.lendingPoolAddress, params);
          
          toast.success("Transaction submitted", {
            description: "Your arbitrage transaction has been submitted to the blockchain",
            action: {
              label: "View",
              onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')
            }
          });
          
          if (onExecutionComplete) onExecutionComplete(txHash, 'completed');
        } catch (error: any) {
          console.error("Error executing transaction:", error);
          toast.error("Transaction failed", {
            description: error.message || "Could not execute the transaction"
          });
          
          if (onExecutionComplete) onExecutionComplete("0x0", 'failed');
        }
        
        setIsExecuting(false);
      }
    } catch (error: any) {
      console.error("Error executing trade:", error);
      toast.error("Execution failed", {
        description: error.message || "Check console for details"
      });
      
      if (onExecutionComplete) {
        onExecutionComplete(
          "0x0000000000000000000000000000000000000000", 
          'failed'
        );
      }
      
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={calculateProfitability}
              disabled={isCalculating || isExecuting || !address}
            >
              {isCalculating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : profitDetails ? (
                profitDetails.isProtifable ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )
              ) : (
                "Check"
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!address ? (
              "Connect wallet to check profitability"
            ) : profitDetails ? (
              <div className="space-y-1 text-xs">
                <p className="font-medium">{profitDetails.isProtifable ? "Profitable" : "Not Profitable"}</p>
                <p>Net Profit: {formatCurrency(profitDetails.netProfit)}</p>
                <p>Gas Cost: {formatCurrency(profitDetails.gasCost)}</p>
                <p>Flash Loan Fee: {formatCurrency(profitDetails.flashLoanFee)}</p>
              </div>
            ) : (
              "Calculate profitability"
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button
        variant="default"
        size="sm"
        className={`h-8 px-3 text-xs ${autoExecute ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
        onClick={executeTrade}
        disabled={isExecuting || (profitDetails && !profitDetails.isProtifable) || !address}
      >
        {isExecuting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            {autoExecute ? "Auto" : "Executing"}
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 mr-1" />
            {autoExecute ? "Auto" : "Execute"}
          </>
        )}
      </Button>
    </div>
  );
};

export default ArbitrageExecutor;
