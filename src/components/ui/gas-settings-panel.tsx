
import React from "react";
import { useGasPrice } from "@/hooks/useGasPrice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface GasSettingsPanelProps {
  onGasSettingsChange?: (settings: { gasPrice: number; priorityFee: number; gasLimit: number }) => void;
}

const GasSettingsPanel: React.FC<GasSettingsPanelProps> = ({ onGasSettingsChange }) => {
  const { gasPrice, isLoading, error, refetch } = useGasPrice();
  const [customGasPrice, setCustomGasPrice] = React.useState<number | null>(null);
  const [priorityFee, setPriorityFee] = React.useState(1.5);
  const [gasLimit, setGasLimit] = React.useState(500000);

  const effectiveGasPrice = customGasPrice !== null ? customGasPrice : gasPrice || 0;

  React.useEffect(() => {
    if (onGasSettingsChange) {
      onGasSettingsChange({
        gasPrice: effectiveGasPrice,
        priorityFee,
        gasLimit
      });
    }
  }, [effectiveGasPrice, priorityFee, gasLimit, onGasSettingsChange]);

  const handleGasPriceChange = (value: number[]) => {
    setCustomGasPrice(value[0]);
  };

  const handlePriorityFeeChange = (value: number[]) => {
    setPriorityFee(value[0]);
  };

  const handleGasLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGasLimit(value);
    }
  };

  const resetToNetwork = () => {
    setCustomGasPrice(null);
    refetch();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gas Settings</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={resetToNetwork}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Failed to fetch gas price. Using defaults.</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Gas Price (Gwei)</Label>
            <span className="text-sm font-medium">{effectiveGasPrice.toFixed(1)}</span>
          </div>
          <Slider
            value={[effectiveGasPrice]}
            min={5}
            max={100}
            step={0.5}
            onValueChange={handleGasPriceChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Slow (5)</span>
            <span>Fast (100)</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Priority Fee (Gwei)</Label>
            <span className="text-sm font-medium">{priorityFee.toFixed(1)}</span>
          </div>
          <Slider
            value={[priorityFee]}
            min={0.5}
            max={10}
            step={0.1}
            onValueChange={handlePriorityFeeChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Low (0.5)</span>
            <span>High (10)</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gas-limit">Gas Limit</Label>
          <Input
            id="gas-limit"
            type="number"
            value={gasLimit}
            onChange={handleGasLimitChange}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Flash loan transactions typically need 400,000 - 800,000 gas
          </p>
        </div>
        
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm font-medium">Estimated Max Fee</p>
          <p className="text-xs text-muted-foreground mt-1">
            {((effectiveGasPrice + priorityFee) * gasLimit / 1e9).toFixed(6)} ETH
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasSettingsPanel;
