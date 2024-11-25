"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ViewOption {
  views: number;
  description: string;
}

const viewOptions: ViewOption[] = [
  {
    views: 1000,
    description: "Basic heatmap",
  },
  {
    views: 3000,
    description:
      "Heatmap is more accurate and provides more information about user clicks.",
  },
  {
    views: 10000,
    description: "Maximum accuracy and the best data possible.",
  },
];

interface ViewsDropdownProps {
  precision: number;
  setPrecision: (precision: number) => void;
}

export default function ViewsDropdown({
  precision,
  setPrecision,
}: ViewsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="group flex items-center gap-1 text-primary hover:no-underline"
        >
          <span className="border-b border-primary group-hover:border-primary/70">
            {precision.toLocaleString()} views
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[320px]">
        {viewOptions.map((option) => (
          <DropdownMenuItem
            key={option.views}
            className="flex flex-col items-start gap-1 p-3"
            onSelect={() => setPrecision(option.views)}
          >
            <div className="font-semibold">
              {option.views.toLocaleString()} views
            </div>
            <div className="text-sm text-muted-foreground">
              {option.description}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
