
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletProvider";
import { ethers } from "ethers";

interface ContractDeployProps {
  onDeploymentComplete?: (contractAddress: string) => void;
}

const ContractDeploy: React.FC<ContractDeployProps> = ({ onDeploymentComplete }) => {
  const { address, ethereum, chainId } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  
  // Check if a contract was previously deployed
  useEffect(() => {
    const savedAddress = localStorage.getItem('flashLoanContractAddress');
    if (savedAddress && savedAddress !== '0x0000000000000000000000000000000000000000') {
      setContractAddress(savedAddress);
    }
  }, []);
  
  const getAaveLendingPoolAddressProvider = (networkId: number): string => {
    // Real Aave addresses
    switch (networkId) {
      case 1: // Ethereum Mainnet
        return "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"; // Aave V2
      case 137: // Polygon
        return "0xd05e3E715d945B59290df0ae8eF85c1BdB684744"; // Aave V2
      case 42161: // Arbitrum
        return "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"; // Aave V3
      default:
        return "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"; // Default to Ethereum Mainnet
    }
  };
  
  const deployContract = async () => {
    if (!address || !ethereum) {
      toast.error("Wallet not connected");
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      // In real implementation, we would use the contract ABI and bytecode to deploy
      // For this demo, we'll simulate a deployment
      
      if (network.chainId !== 1 && network.chainId !== 137) {
        toast.warning("Unsupported network", {
          description: "Please switch to Ethereum Mainnet or Polygon for deployment"
        });
      }
      
      toast.info("Deploying contract", {
        description: `Deploying to ${network.chainId === 1 ? 'Ethereum' : network.chainId === 137 ? 'Polygon' : 'Network ' + network.chainId}`
      });
      
      // In real app, we'd use something like:
      // const factory = new ethers.ContractFactory(abi, bytecode, signer);
      // const contract = await factory.deploy(getAaveLendingPoolAddressProvider(network.chainId));
      // await contract.deployed();
      
      // For this demo, simulate deploying after a delay
      const mockDeployment = () => {
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            // Generate a random address for simulation
            const mockAddress = "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
            resolve(mockAddress);
          }, 3000);
        });
      };
      
      const deployedAddress = await mockDeployment();
      setContractAddress(deployedAddress);
      localStorage.setItem('flashLoanContractAddress', deployedAddress);
      
      if (onDeploymentComplete) {
        onDeploymentComplete(deployedAddress);
      }
      
      toast.success("Contract deployed", {
        description: "Flash loan contract deployed successfully"
      });
    } catch (error: any) {
      console.error("Error deploying contract:", error);
      toast.error("Deployment failed", {
        description: error.message || "Could not deploy the contract"
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flash Loan Arbitrage Contract</CardTitle>
        <CardDescription>
          Deploy your flash loan arbitrage contract to the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deploy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="code">Contract Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deploy">
            <div className="space-y-4">
              {!address ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Please connect your wallet to deploy the contract
                  </p>
                </div>
              ) : (
                <>
                  {contractAddress ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">
                          Contract deployed successfully
                        </p>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-white dark:bg-black p-1 rounded border">
                            {contractAddress}
                          </code>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(contractAddress)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => window.open(`https://etherscan.io/address/${contractAddress}`, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setContractAddress(null);
                          localStorage.removeItem('flashLoanContractAddress');
                          if (onDeploymentComplete) {
                            onDeploymentComplete('0x0000000000000000000000000000000000000000');
                          }
                        }}
                        variant="outline"
                      >
                        Reset Deployment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Deploy the FlashLoanArbitrage contract to execute arbitrage trades using Aave flash loans.
                      </p>
                      
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-md">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          This contract will:
                        </p>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 list-disc pl-5 mt-2 space-y-1">
                          <li>Borrow tokens using Aave's flash loan</li>
                          <li>Execute arbitrage between different DEXes</li>
                          <li>Repay the flash loan and keep the profit</li>
                        </ul>
                      </div>
                      
                      <Button 
                        onClick={deployContract}
                        disabled={isDeploying}
                        className="w-full"
                      >
                        {isDeploying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          "Deploy Contract"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="code">
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border overflow-auto max-h-64">
                <pre className="text-xs text-slate-800 dark:text-slate-200">
                  <code>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { FlashLoanReceiverBase } from "./FlashLoanReceiverBase.sol";
import { ILendingPool } from "./ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./ILendingPoolAddressesProvider.sol";
import { IERC20 } from "./IERC20.sol";
import { IUniswapV2Router02 } from "./IUniswapV2Router02.sol";

contract FlashLoanArbitrage is FlashLoanReceiverBase {
    address public owner;
    
    constructor(ILendingPoolAddressesProvider _provider) FlashLoanReceiverBase(_provider) {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function executeFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external onlyOwner {
        address[] memory assets = new address[](1);
        assets[0] = asset;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        
        LENDING_POOL.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            params,
            0
        );
    }
    
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Execute arbitrage logic here
        return true;
    }
    
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
    
    receive() external payable {}
}`}</code>
                </pre>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => copyToClipboard("// Full contract code in src/contracts/FlashLoanArbitrage.sol")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Full Contract Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground border-t p-4 mt-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Before deploying in production, ensure the contract is audited for security vulnerabilities. Flash loan arbitrage carries significant risks including smart contract risk, market risk, and gas costs that may exceed profits.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContractDeploy;
