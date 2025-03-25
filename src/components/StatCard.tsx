
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  className,
  icon,
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg", 
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
            
            {change && (
              <p className={cn(
                "mt-1 text-xs font-medium", 
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? "+" : ""}{change}
              </p>
            )}
          </div>
          
          {icon && (
            <div className="bg-primary/10 p-2 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
