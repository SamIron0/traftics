import { useState } from "react"
import { Check, PlayCircle } from "lucide-react"

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

type StatusOption = {
  label: string
  value: 'all' | 'played' | 'not_played'
}

interface StatusFilterProps {
  onStatusChange: (status: StatusOption['value']) => void;
}

export default function StatusFilter({ onStatusChange }: StatusFilterProps) {
  const statusOptions: StatusOption[] = [
    {
      label: "All recordings",
      value: "all",
    },
    {
      label: "Already played",
      value: "played",
    },
    {
      label: "Not played",
      value: "not_played",
    },
  ]

  const [selectedStatus, setSelectedStatus] = useState<StatusOption>(statusOptions[0])

  const handleStatusSelect = (status: StatusOption) => {
    setSelectedStatus(status)
    onStatusChange(status.value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start md:w-auto">
          <PlayCircle className="mr-2 h-4 w-4" />
          <span>{selectedStatus.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {statusOptions.map((status) => (
            <DropdownMenuItem 
              key={status.value} 
              onClick={() => handleStatusSelect(status)}
              className="cursor-pointer"
            >
              <span>{status.label}</span>
              <Check
                className={cn("ml-auto h-4 w-4", selectedStatus.value === status.value ? "opacity-100" : "opacity-0")}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 