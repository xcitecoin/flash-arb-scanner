
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ScanningStatusProps {
  isScanning: boolean;
  lastScanned?: Date;
  scanCount?: number;
  className?: string;
}

const ScanningStatus: React.FC<ScanningStatusProps> = ({
  isScanning,
  lastScanned,
  scanCount = 0,
  className,
}) => {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    if (!isScanning) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isScanning]);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <Card className={cn("border border-border/50", className)}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Scanning{dots}
              </span>
            </>
          ) : (
            <span className="text-sm">Scan paused</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          {lastScanned && (
            <div>
              Last: <span className="font-medium">{formatTime(lastScanned)}</span>
            </div>
          )}
          
          <div>
            Total scans: <span className="font-medium">{scanCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanningStatus;
