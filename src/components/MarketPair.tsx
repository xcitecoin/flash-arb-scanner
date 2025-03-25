
import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

interface MarketPairProps {
  sourceDex: string;
  targetDex: string;
  tokenPair: string;
  priceGap: number;
  potentialProfit: number;
  className?: string;
  onClick?: () => void;
}

const MarketPair: React.FC<MarketPairProps> = ({
  sourceDex,
  targetDex,
  tokenPair,
  priceGap,
  potentialProfit,
  className,
  onClick,
}) => {
  const isPositive = priceGap > 0;
  
  return (
    <Card 
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/50",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground">{sourceDex}</span>
              <ArrowRight className="mx-2 h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{targetDex}</span>
            </div>
            <h3 className="mt-1 text-lg font-medium">{tokenPair}</h3>
            
            <div className="mt-2 flex items-center">
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                "text-xs font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? "+" : ""}{priceGap.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <p className="text-sm font-medium text-muted-foreground">Potential Profit</p>
            <p className="text-lg font-semibold">{formatCurrency(potentialProfit)}</p>
            
            <div className="mt-3 w-full md:w-auto">
              <Button 
                size="sm" 
                className="w-full transition-all duration-300"
                onClick={onClick}
              >
                Execute Trade
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketPair;
