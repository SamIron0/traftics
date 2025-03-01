"use client"

import { useState } from "react"
import { CalendarIcon, Check } from "lucide-react"
import { format, subDays, subMonths, startOfDay } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DateRange = {
  label: string
  startDate: Date
  endDate: Date
}

interface DateFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

export default function DateFilter({ onDateRangeChange }: DateFilterProps) {
  const now = new Date()

  const dateRanges: DateRange[] = [
    {
      label: "Last 24 hours",
      startDate: subDays(now, 1),
      endDate: now,
    },
    {
      label: "Last 7 days",
      startDate: subDays(now, 7),
      endDate: now,
    },
    {
      label: "Last 15 days",
      startDate: subDays(now, 15),
      endDate: now,
    },
    {
      label: "Last 30 days",
      startDate: subDays(now, 30),
      endDate: now,
    },
    {
      label: "Last 3 months",
      startDate: subMonths(now, 3),
      endDate: now,
    },
    {
      label: "Last 6 months",
      startDate: subMonths(now, 6),
      endDate: now,
    },
    {
      label: "Last 12 months",
      startDate: subMonths(now, 12),
      endDate: now,
    },
  ]

  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[2]) // Default to "Last 30 days"

  const formatDateRange = (range: DateRange) => {
    return `${format(range.startDate, "MMM d, yyyy")} - ${format(range.endDate, "MMM d, yyyy")}`
  }

  const handleRangeSelect = (range: DateRange) => {
    setSelectedRange(range)
    onDateRangeChange(startOfDay(range.startDate), range.endDate)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start md:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{selectedRange.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {dateRanges.map((range) => (
            <DropdownMenuItem 
              key={range.label} 
              onClick={() => handleRangeSelect(range)} 
              className="cursor-pointer"
            >
              <span>{range.label}</span>
              <Check
                className={cn("ml-auto h-4 w-4", selectedRange.label === range.label ? "opacity-100" : "opacity-0")}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {formatDateRange(selectedRange)}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 