
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface GasSettingsProps {
  className?: string;
}

const GasSettings: React.FC<GasSettingsProps> = ({ className }) => {
  const [maxGas, setMaxGas] = useState<number>(50);
  const [autoAdjust, setAutoAdjust] = useState<boolean>(true);
  
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Gas Settings</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="gas-limit">Max Gas (Gwei)</Label>
              <span className="text-sm font-medium">{maxGas}</span>
            </div>
            <Slider
              id="gas-limit"
              min={10}
              max={100}
              step={1}
              value={[maxGas]}
              onValueChange={(value) => setMaxGas(value[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-adjust" className="cursor-pointer">Auto-adjust gas</Label>
            <Switch
              id="auto-adjust"
              checked={autoAdjust}
              onCheckedChange={setAutoAdjust}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="flash-bots" className="cursor-pointer">Use Flashbots</Label>
            <Switch
              id="flash-bots"
              checked={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasSettings;
