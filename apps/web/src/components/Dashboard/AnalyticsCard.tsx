import { Card, CardContent } from "@/components/ui/card"
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer} from "@/components/ui/chart"
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts"

interface AnalyticsCardProps {
  title: string
  value: string | number
  data: number[]
  showInfo?: boolean
}

export function AnalyticsCard({ title, value, data, showInfo }: AnalyticsCardProps) {
  // Transform data into chart format
  const chartData = data.map((value, index) => ({
    value,
    index: index.toString(),
  }))

  const chartConfig = {
    value: {
      color: "#2563eb",
    },
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-2 flex flex-row justify-between items-center">
          <div className="flex flex-col ">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-normal text-muted-foreground">{title}</h3>
            {showInfo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bounce rate is the percentage of sessions</p>
                    <p>where users viewed only one page.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-lg font-medium">{value}</p></div>
          <div className="w-[100px] ">
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 12, bottom: 0, left: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="index"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  hide={true}
                />
                <Area 
                  dataKey="value"
                  type="natural"
                  fill="var(--color-value)"
                  fillOpacity={0.2}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

