
import React from "react";
import { cn } from "@/lib/utils";
import StatCard from "./StatCard";
import { Activity, TrendingUp, BarChart3, Timer } from "lucide-react";

interface TradingStatsProps {
  className?: string;
}

const TradingStats: React.FC<TradingStatsProps> = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatCard
        title="Total Profit"
        value="$1,245.32"
        change="12.5% vs last week"
        isPositive={true}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        className="animate-fade-in"
      />
      
      <StatCard
        title="Executed Trades"
        value="24"
        change="8 today"
        isPositive={true}
        icon={<Activity className="h-5 w-5 text-primary" />}
        className="animate-fade-in [animation-delay:100ms]"
      />
      
      <StatCard
        title="Average Profit"
        value="$52.18"
        change="3.2% vs yesterday"
        isPositive={true}
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
        className="animate-fade-in [animation-delay:200ms]"
      />
      
      <StatCard
        title="Scan Frequency"
        value="3.5s"
        change="0.2s faster"
        isPositive={true}
        icon={<Timer className="h-5 w-5 text-primary" />}
        className="animate-fade-in [animation-delay:300ms]"
      />
    </div>
  );
};

export default TradingStats;
