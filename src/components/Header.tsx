
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wallet, Menu } from "lucide-react";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 glass",
        className
      )}
    >
      <div className="flex items-center">
        <h1 className="text-lg font-medium">FlashArb</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full bg-secondary/80 backdrop-blur-sm border-secondary-foreground/10 px-4 transition-all hover:bg-secondary"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
