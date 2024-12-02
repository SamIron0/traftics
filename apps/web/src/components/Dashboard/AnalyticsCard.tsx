import { Card, CardContent } from "@/components/ui/card"
import { Info } from 'lucide-react'
import { Sparkline } from "./Sparkline"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AnalyticsCardProps {
  title: string
  value: string | number
  data: number[]
  showInfo?: boolean
}

export function AnalyticsCard({ title, value, data, showInfo }: AnalyticsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-normal text-muted-foreground">{title}</h3>
            {showInfo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More information about {title.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-2xl font-medium">{value}</p>
          <Sparkline data={data} className="text-blue-500" />
        </div>
      </CardContent>
    </Card>
  )
}

