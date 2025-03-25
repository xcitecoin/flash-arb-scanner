import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import TradingStats from "@/components/TradingStats";
import ArbitrageExecutor from "@/components/ArbitrageExecutor";
import TokenPriceTable from "@/components/TokenPriceTable";
import GasSettings from "@/components/GasSettings";
import ScanningStatus from "@/components/ScanningStatus";
import ChainSelector from "@/components/ChainSelector";
import NodeProviderSetup from "@/components/NodeProviderSetup";
import ContractDeploy from "@/components/ContractDeploy";
import { toast } from "sonner";
import { ArbitrageOpportunity } from "@/lib/types";
import { generateMockOpportunities } from "@/lib/mockData";
import { scanArbitrageOpportunities } from "@/lib/dexService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/context/WalletProvider";
import { useGasPrice } from "@/hooks/useGasPrice";
import { AlertCircle } from "lucide-react";
import { NodeProvider, getProviderConfig } from "@/lib/providers";

const Index = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<Date | undefined>(undefined);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoExecute, setAutoExecute] = useState(false);
  const [isSimulation, setIsSimulation] = useState(true);
  const [hasNodeProvider, setHasNodeProvider] = useState(false);
  const { address } = useWallet();
  const { gasPrice } = useGasPrice();

  const chains = [
    { id: "ethereum", name: "Ethereum" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "polygon", name: "Polygon" },
    { id: "bsc", name: "BNB Chain" },
    { id: "avalanche", name: "Avalanche" },
  ];

  useEffect(() => {
    const infuraConfig = getProviderConfig(NodeProvider.INFURA);
    const alchemyConfig = getProviderConfig(NodeProvider.ALCHEMY);
    
    setHasNodeProvider(!!(infuraConfig?.apiKey || alchemyConfig?.apiKey));
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    if (scanCount === 0) {
      toast.info(
        hasNodeProvider ? "Connected to blockchain" : "Simulation Mode Active",
        {
          description: hasNodeProvider 
            ? "The app is now connected to real blockchain data"
            : "This app is currently using simulated data. Add an Infura or Alchemy API key to use real blockchain data.",
          duration: 6000,
        }
      );
    }

    const scanInterval = setInterval(async () => {
      setLastScanned(new Date());
      setScanCount(prev => prev + 1);
      
      if (hasNodeProvider) {
        try {
          const chainId = selectedChain === "ethereum" ? 1 : 
                          selectedChain === "polygon" ? 137 : 1;
          
          const realOpportunities = await scanArbitrageOpportunities(
            chainId,
            getProviderConfig(NodeProvider.INFURA)?.apiKey ? 
              NodeProvider.INFURA : NodeProvider.ALCHEMY
          );
          
          if (realOpportunities.length > 0) {
            setOpportunities(realOpportunities);
            toast.info(
              `Found ${realOpportunities.length} arbitrage opportunities`,
              {
                description: `Highest profit: $${realOpportunities[0].potentialProfit.toFixed(2)}`,
              }
            );
          }
        } catch (error) {
          console.error("Error scanning for real opportunities:", error);
          const newOpportunities = generateMockOpportunities().map(opp => ({
            ...opp,
            tokenAddresses: {
              token0: opp.tokenPair.split('/')[0] === 'ETH' 
                ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
              token1: opp.tokenPair.split('/')[1] === 'USDC' 
                ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
                : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
            }
          }));
          setOpportunities(newOpportunities);
        }
      } else {
        if (Math.random() < 0.3) {
          const newOpportunities = generateMockOpportunities().map(opp => ({
            ...opp,
            tokenAddresses: {
              token0: opp.tokenPair.split('/')[0] === 'ETH' 
                ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
              token1: opp.tokenPair.split('/')[1] === 'USDC' 
                ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
                : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
            }
          }));
          
          setOpportunities(newOpportunities);
          
          if (newOpportunities.length > 0) {
            toast.info(
              `Found ${newOpportunities.length} arbitrage opportunities (simulated)`,
              {
                description: `Highest profit: $${newOpportunities[0].potentialProfit.toFixed(2)}`,
              }
            );
          }
        }
      }
    }, 5000);

    return () => clearInterval(scanInterval);
  }, [isScanning, autoExecute, scanCount, address, hasNodeProvider, selectedChain]);

  useEffect(() => {
    const initialOpportunities = generateMockOpportunities().map(opp => ({
      ...opp,
      tokenAddresses: {
        token0: opp.tokenPair.split('/')[0] === 'ETH' 
          ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
          : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        token1: opp.tokenPair.split('/')[1] === 'USDC' 
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
          : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
      }
    }));
    setOpportunities(initialOpportunities);
    setLastScanned(new Date());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-7xl px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-8">
          <div className={`${hasNodeProvider ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'} border rounded-lg p-3 flex items-center space-x-3 animate-fade-in`}>
            <AlertCircle className={`h-5 w-5 ${hasNodeProvider ? 'text-green-500' : 'text-amber-500'}`} />
            <p className={`text-sm ${hasNodeProvider ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {hasNodeProvider 
                ? <strong>Connected to blockchain data</strong>
                : <strong>Simulation mode active</strong>} - {hasNodeProvider 
                  ? "The application is now using real blockchain data from your configured node provider."
                  : "All arbitrage opportunities are simulated for demonstration purposes."}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight animate-fade-in">
                Flash Arbitrage Scanner
              </h1>
              <p className="text-muted-foreground mt-1 animate-fade-in [animation-delay:100ms]">
                Scan, detect, and execute profitable arbitrage opportunities
              </p>
            </div>
            
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <ChainSelector 
                chains={chains}
                selectedChain={selectedChain}
                onSelectChain={setSelectedChain}
                className="w-full md:w-[200px] animate-fade-in [animation-delay:200ms]"
              />
              
              <Button 
                variant={isScanning ? "outline" : "default"}
                onClick={() => {
                  setIsScanning(!isScanning);
                  toast(isScanning ? "Scanning paused" : "Scanning started");
                }}
                className="animate-fade-in [animation-delay:300ms]"
              >
                {isScanning ? "Pause Scan" : "Start Scan"}
              </Button>
            </div>
          </div>
          
          <ScanningStatus 
            isScanning={isScanning}
            lastScanned={lastScanned}
            scanCount={scanCount}
            className="animate-fade-in [animation-delay:400ms]"
          />
          
          <TradingStats />
          
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in [animation-delay:500ms]">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="prices">Prices</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6 pt-4">
              {!hasNodeProvider && (
                <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Connect to Real Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                      Currently using simulated data. Connect to Infura or Alchemy to access real blockchain data and execute actual arbitrage trades.
                    </p>
                    <Button onClick={() => setActiveTab("settings")}>
                      Configure Node Provider
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Arbitrage Opportunities</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      toast.info("Refreshing opportunities...");
                      
                      if (hasNodeProvider) {
                        const chainId = selectedChain === "ethereum" ? 1 : 
                                      selectedChain === "polygon" ? 137 : 1;
                                      
                        scanArbitrageOpportunities(
                          chainId,
                          getProviderConfig(NodeProvider.INFURA)?.apiKey ? 
                            NodeProvider.INFURA : NodeProvider.ALCHEMY
                        ).then(opportunities => {
                          setOpportunities(opportunities);
                        }).catch(error => {
                          console.error("Error scanning for opportunities:", error);
                          const newOpps = generateMockOpportunities().map(opp => ({
                            ...opp,
                            tokenAddresses: {
                              token0: opp.tokenPair.split('/')[0] === 'ETH' 
                                ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                                : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
                              token1: opp.tokenPair.split('/')[1] === 'USDC' 
                                ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
                                : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
                            }
                          }));
                          setOpportunities(newOpps);
                        });
                      } else {
                        const newOpps = generateMockOpportunities().map(opp => ({
                          ...opp,
                          tokenAddresses: {
                            token0: opp.tokenPair.split('/')[0] === 'ETH' 
                              ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                              : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
                            token1: opp.tokenPair.split('/')[1] === 'USDC' 
                              ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
                              : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
                          }
                        }));
                        setOpportunities(newOpps);
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </div>
                
                {opportunities.length > 0 ? (
                  <div className="space-y-3 animate-stagger">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="bg-card rounded-lg border p-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-lg font-medium">{opp.tokenPair}</span>
                              <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                                {opp.priceGap.toFixed(2)}% gap
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-md font-semibold">${opp.potentialProfit.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">potential profit</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-muted-foreground">Buy on:</span> {opp.sourceDex}
                            </div>
                            <div className="mx-2">→</div>
                            <div>
                              <span className="text-muted-foreground">Sell on:</span> {opp.targetDex}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="ml-auto">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  toast.info("Viewing details...");
                                }}
                              >
                                Details
                              </Button>
                              
                              {gasPrice !== null && (
                                <div className="ml-auto">
                                  <ArbitrageExecutor 
                                    opportunity={opp} 
                                    gasPrice={gasPrice || 30}
                                    isSimulation={!hasNodeProvider}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No arbitrage opportunities found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        toast.info("Scanning for opportunities...");
                        setTimeout(() => {
                          const newOpps = generateMockOpportunities().map(opp => ({
                            ...opp,
                            tokenAddresses: {
                              token0: opp.tokenPair.split('/')[0] === 'ETH' 
                                ? '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                                : '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
                              token1: opp.tokenPair.split('/')[1] === 'USDC' 
                                ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC
                                : '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
                            }
                          }));
                          setOpportunities(newOpps);
                        }, 1500);
                      }}
                    >
                      Scan Now
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NodeProviderSetup 
                  onComplete={() => setHasNodeProvider(true)}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Execution Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-execute">Auto-Execute Trades</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically execute profitable arbitrage opportunities
                        </p>
                      </div>
                      <Switch
                        id="auto-execute"
                        checked={autoExecute}
                        onCheckedChange={setAutoExecute}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Minimum Profit Threshold</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm">$50</Button>
                        <Button variant="outline" size="sm" className="bg-primary/5">$100</Button>
                        <Button variant="outline" size="sm">$200</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Maximum Slippage</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Button variant="outline" size="sm">0.5%</Button>
                        <Button variant="outline" size="sm" className="bg-primary/5">1%</Button>
                        <Button variant="outline" size="sm">2%</Button>
                        <Button variant="outline" size="sm">5%</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <GasSettings />
              </div>
            </TabsContent>
            
            <TabsContent value="prices" className="pt-4">
              <TokenPriceTable 
                tokenPair="ETH/USDC" 
                prices={[
                  { dex: "Uniswap", price: 1820.45 },
                  { dex: "SushiSwap", price: 1825.12 },
                  { dex: "Curve", price: 1818.79 },
                  { dex: "Balancer", price: 1823.68 },
                  { dex: "PancakeSwap", price: 1826.32 },
                ]} 
              />
            </TabsContent>
            
            <TabsContent value="deploy" className="pt-4">
              <ContractDeploy />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
