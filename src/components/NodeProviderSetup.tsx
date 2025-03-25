
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle } from "lucide-react";
import { NodeProvider, saveProviderConfig, getProviderConfig } from "@/lib/providers";
import { toast } from "sonner";

interface NodeProviderSetupProps {
  onComplete?: () => void;
}

const NodeProviderSetup: React.FC<NodeProviderSetupProps> = ({ onComplete }) => {
  const [activeTab, setActiveTab] = useState<string>(NodeProvider.INFURA);
  const [infuraKey, setInfuraKey] = useState<string>("");
  const [alchemyKey, setAlchemyKey] = useState<string>("");
  const [hasInfura, setHasInfura] = useState<boolean>(false);
  const [hasAlchemy, setHasAlchemy] = useState<boolean>(false);

  useEffect(() => {
    // Check if provider keys are already saved
    const infuraConfig = getProviderConfig(NodeProvider.INFURA);
    const alchemyConfig = getProviderConfig(NodeProvider.ALCHEMY);
    
    if (infuraConfig?.apiKey) {
      setHasInfura(true);
      setInfuraKey(infuraConfig.apiKey);
    }
    
    if (alchemyConfig?.apiKey) {
      setHasAlchemy(true);
      setAlchemyKey(alchemyConfig.apiKey);
    }
  }, []);

  const handleSaveInfura = () => {
    if (!infuraKey.trim()) {
      toast.error("Please enter your Infura API key");
      return;
    }
    
    saveProviderConfig(NodeProvider.INFURA, infuraKey);
    setHasInfura(true);
    
    if (onComplete) onComplete();
  };

  const handleSaveAlchemy = () => {
    if (!alchemyKey.trim()) {
      toast.error("Please enter your Alchemy API key");
      return;
    }
    
    saveProviderConfig(NodeProvider.ALCHEMY, alchemyKey);
    setHasAlchemy(true);
    
    if (onComplete) onComplete();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Blockchain Node Provider</CardTitle>
        <CardDescription>
          Connect to Ethereum and other blockchain networks with Infura or Alchemy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value={NodeProvider.INFURA} className="relative">
              Infura
              {hasInfura && (
                <span className="absolute -top-1 -right-1">
                  <Check className="h-4 w-4 text-green-500" />
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value={NodeProvider.ALCHEMY} className="relative">
              Alchemy
              {hasAlchemy && (
                <span className="absolute -top-1 -right-1">
                  <Check className="h-4 w-4 text-green-500" />
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={NodeProvider.INFURA} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="infura-key">Infura Project ID</Label>
              <Input
                id="infura-key"
                value={infuraKey}
                onChange={(e) => setInfuraKey(e.target.value)}
                placeholder="Enter your Infura project ID"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://infura.io" className="underline" target="_blank" rel="noopener noreferrer">infura.io</a>
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveInfura}>
                {hasInfura ? "Update API Key" : "Save API Key"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value={NodeProvider.ALCHEMY} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alchemy-key">Alchemy API Key</Label>
              <Input
                id="alchemy-key"
                value={alchemyKey}
                onChange={(e) => setAlchemyKey(e.target.value)}
                placeholder="Enter your Alchemy API key"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://alchemy.com" className="underline" target="_blank" rel="noopener noreferrer">alchemy.com</a>
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveAlchemy}>
                {hasAlchemy ? "Update API Key" : "Save API Key"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground border-t p-4 mt-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p>
            Your API keys are stored locally in your browser's localStorage. 
            Please be careful when using shared computers.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NodeProviderSetup;
