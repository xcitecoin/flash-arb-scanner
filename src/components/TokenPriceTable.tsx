
import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface TokenPrice {
  dex: string;
  price: number;
}

interface TokenPriceTableProps {
  tokenPair: string;
  prices: TokenPrice[];
  className?: string;
}

const TokenPriceTable: React.FC<TokenPriceTableProps> = ({
  tokenPair,
  prices,
  className,
}) => {
  // Find the min and max prices
  const minPrice = Math.min(...prices.map(p => p.price));
  const maxPrice = Math.max(...prices.map(p => p.price));
  
  // Calculate the price difference percentage
  const priceDiff = ((maxPrice - minPrice) / minPrice) * 100;
  
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Price Comparison: {tokenPair}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm mb-4">
          <span className="text-muted-foreground">Price difference: </span>
          <span className="font-medium text-green-500">{priceDiff.toFixed(2)}%</span>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DEX</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">vs Lowest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((price, index) => {
              const diffFromMin = ((price.price - minPrice) / minPrice) * 100;
              const isLowest = price.price === minPrice;
              const isHighest = price.price === maxPrice;
              
              return (
                <TableRow key={index} className={cn(
                  isLowest && "bg-green-50",
                  isHighest && "bg-red-50"
                )}>
                  <TableCell className="font-medium">{price.dex}</TableCell>
                  <TableCell className="text-right">{formatCurrency(price.price)}</TableCell>
                  <TableCell className={cn(
                    "text-right",
                    isLowest ? "text-green-500" : "text-red-500"
                  )}>
                    {isLowest ? "LOWEST" : `+${diffFromMin.toFixed(2)}%`}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TokenPriceTable;
