
import React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Chain {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface ChainSelectorProps {
  chains: Chain[];
  selectedChain: string;
  onSelectChain: (chainId: string) => void;
  className?: string;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({
  chains,
  selectedChain,
  onSelectChain,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="chain-select">Blockchain</Label>
      <Select value={selectedChain} onValueChange={onSelectChain}>
        <SelectTrigger id="chain-select" className="w-full">
          <SelectValue placeholder="Select blockchain" />
        </SelectTrigger>
        <SelectContent>
          {chains.map((chain) => (
            <SelectItem key={chain.id} value={chain.id} className="flex items-center">
              {chain.icon && <span className="mr-2">{chain.icon}</span>}
              {chain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChainSelector;
