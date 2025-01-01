"use client"

import * as React from "react"
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { subDays, startOfDay } from "date-fns"

export type DateRangeKey = "last-24-hours" | "last-7-days" | "last-15-days" | "last-30-days" | "last-3-months" | "last-6-months" | "last-12-months" ;

interface DateFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export default function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const [dateRange, setDateRange] = React.useState<DateRangeKey>("last-15-days")

  const dateRangeMap: Record<DateRangeKey, string> = {
    "last-24-hours": "Last 24 hours",
    "last-7-days": "Last 7 days",
    "last-15-days": "Last 15 days",
    "last-30-days": "Last 30 days",
    "last-3-months": "Last 3 months",
    "last-6-months": "Last 6 months", 
    "last-12-months": "Last 12 months",
  }

  const handleDateRangeChange = (value: DateRangeKey) => {
    setDateRange(value);
    const endDate = new Date();
    let startDate: Date;

    switch (value) {
      case "last-24-hours":
        startDate = subDays(endDate, 1);
        break;
      case "last-7-days":
        startDate = subDays(endDate, 7);
        break;
      case "last-15-days":
        startDate = subDays(endDate, 15);
        break;
      case "last-30-days":
        startDate = subDays(endDate, 30);
        break;
      case "last-3-months":
        startDate = subDays(endDate, 90);
        break;
      case "last-6-months":
        startDate = subDays(endDate, 180);
        break;
      case "last-12-months":
        startDate = subDays(endDate, 365);
        break;
      default:
        startDate = subDays(endDate, 15);
    }

    onDateRangeChange(startOfDay(startDate), endDate);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start gap-2">
            <Calendar className="h-4 w-4" />
            {dateRangeMap[dateRange]}
            <div className="ml-auto">
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px]">
          <DropdownMenuRadioGroup value={dateRange} onValueChange={(value) => handleDateRangeChange(value as DateRangeKey)}>
            {Object.entries(dateRangeMap).map(([value, label]) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                className="py-3"
              >
                <div className="flex items-center gap-2">
                 {label}
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 