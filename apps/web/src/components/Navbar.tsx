import React from "react";
import { Filter } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex flex-1 justify-end">
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 