import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8">
      {/* Analytics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  {i === 3 && <Skeleton className="h-4 w-4 rounded-full" />}
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-full" /> {/* Sparkline placeholder */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Most Visited Pages Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Number */}
                  <Skeleton className="h-4 w-[300px]" /> {/* URL */}
                </div>
                <Skeleton className="h-4 w-16" /> {/* View count */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 