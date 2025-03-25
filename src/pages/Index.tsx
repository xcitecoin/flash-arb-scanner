
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import TradingStats from "@/components/TradingStats";
import ArbitrageList from "@/components/ArbitrageList";
import TokenPriceTable from "@/components/TokenPriceTable";
import GasSettings from "@/components/GasSettings";
import ScanningStatus from "@/components/ScanningStatus";
import ChainSelector from "@/components/ChainSelector";
import { toast } from "sonner";
import { ArbitrageOpportunity } from "@/lib/types";
import { generateMockOpportunities } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanned, setLastScanned] = useState<Date | undefined>(undefined);
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [autoExecute, setAutoExecute] = useState(false);

  // Available chains
  const chains = [
    { id: "ethereum", name: "Ethereum" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "polygon", name: "Polygon" },
    { id: "bsc", name: "BNB Chain" },
    { id: "avalanche", name: "Avalanche" },
  ];

  // Mock token price data
  const tokenPrices = [
    { dex: "Uniswap", price: 1820.45 },
    { dex: "SushiSwap", price: 1825.12 },
    { dex: "Curve", price: 1818.79 },
    { dex: "Balancer", price: 1823.68 },
    { dex: "PancakeSwap", price: 1826.32 },
  ];

  // Simulate scanning for arbitrage opportunities
  useEffect(() => {
    if (!isScanning) return;

    const scanInterval = setInterval(() => {
      // Update scanning stats
      setLastScanned(new Date());
      setScanCount(prev => prev + 1);
      
      // 30% chance of finding new opportunities
      if (Math.random() < 0.3) {
        const newOpportunities = generateMockOpportunities();
        setOpportunities(newOpportunities);
        
        // Show toast for new opportunities
        if (newOpportunities.length > 0) {
          toast.info(
            `Found ${newOpportunities.length} arbitrage opportunities`,
            {
              description: `Highest profit: $${newOpportunities[0].potentialProfit.toFixed(2)}`,
            }
          );
          
          // Auto-execute if enabled
          if (autoExecute && newOpportunities[0].potentialProfit > 100) {
            setTimeout(() => {
              toast.success("Auto-executed profitable trade", {
                description: `${newOpportunities[0].tokenPair} with ${newOpportunities[0].priceGap.toFixed(2)}% price gap`,
              });
            }, 1500);
          }
        }
      }
    }, 5000);

    return () => clearInterval(scanInterval);
  }, [isScanning, autoExecute]);

  // Initial scan
  useEffect(() => {
    const initialOpportunities = generateMockOpportunities();
    setOpportunities(initialOpportunities);
    setLastScanned(new Date());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-7xl px-4 pt-24 pb-16">
        <div className="flex flex-col space-y-8">
          {/* Top Controls */}
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
          
          {/* Scanning Status */}
          <ScanningStatus 
            isScanning={isScanning}
            lastScanned={lastScanned}
            scanCount={scanCount}
            className="animate-fade-in [animation-delay:400ms]"
          />
          
          {/* Trading Stats */}
          <TradingStats />
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in [animation-delay:500ms]">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="prices">Prices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6 pt-4">
              {/* Opportunities List */}
              <ArbitrageList opportunities={opportunities} />
            </TabsContent>
            
            <TabsContent value="settings" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                prices={tokenPrices} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
