
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import MarketPair from "./MarketPair";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArbitrageOpportunity } from "@/lib/types";

interface ArbitrageListProps {
  opportunities: ArbitrageOpportunity[];
  className?: string;
}

const ArbitrageList: React.FC<ArbitrageListProps> = ({
  opportunities,
  className,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExecute = (id: string) => {
    setLoading(id);
    
    // Simulate transaction execution
    setTimeout(() => {
      setLoading(null);
      toast.success("Transaction submitted", {
        description: "Your arbitrage transaction has been submitted to the blockchain.",
      });
    }, 2000);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Arbitrage Opportunities</h2>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => {
            toast.info("Refreshing opportunities...");
          }}
        >
          Refresh
        </Button>
      </div>
      
      {opportunities.length > 0 ? (
        <div className="space-y-3 animate-stagger">
          {opportunities.map((opp) => (
            <MarketPair
              key={opp.id}
              sourceDex={opp.sourceDex}
              targetDex={opp.targetDex}
              tokenPair={opp.tokenPair}
              priceGap={opp.priceGap}
              potentialProfit={opp.potentialProfit}
              onClick={() => handleExecute(opp.id)}
            />
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
            }}
          >
            Scan Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArbitrageList;
