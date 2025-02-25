"use client"

import {Play } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useAppStore } from "@/stores/useAppStore"

interface Props {
  pages: Array<{
    page: string;
    count: number;
  }>;
}

export function TopPages({ pages }: Props) {
  const router = useRouter()
  const { projectSlug } = useAppStore()

  const handlePlayClick = (page: string) => {
    // Navigate to sessions page with page filter
    router.push(`/project/${projectSlug}/sessions?page=${encodeURIComponent(page)}`)
  }

  // Calculate total views for percentage
  const maxViews = Math.max(...pages.map(p => p.count))
  
  // Sort pages by view count in descending order
  const sortedPages = [...pages].sort((a, b) => b.count - a.count)
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Top pages</h2>
          <p className="text-muted-foreground">The pages users viewed last</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry pages</SelectItem>
              <SelectItem value="all">All pages</SelectItem>
            </SelectContent>
          </Select>
            </div>
      </div>
      <div className="space-y-4">
        {sortedPages.slice(0, 5).map((page) => (
          <div key={page.page} className="flex items-end gap-4 ">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-600 truncate">
                  {page.page}
                </span>
                <div className="relative">
                  <div className="h-8 bg-muted rounded">
                    <div
                      className="h-full bg-primary rounded"
                      style={{ width: `${(page.count / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
            <span className="text-sm tabular-nums">{page.count} views</span>

            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-accent rounded-md"
                onClick={() => handlePlayClick(page.page)}
              >
                <Play className="h-4 w-4" />
              </button>
            </div>
            </div>
          </div>
        ))}
        
        {sortedPages.length > 5 && (
          <div className="flex items-end gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-zinc-600 truncate">
                  Other
                </span>
                <div className="relative">
                  <div className="h-8 bg-muted rounded">
                    <div 
                      className="h-full bg-muted-foreground/20 rounded"
                      style={{ 
                        width: `${(sortedPages.slice(5).reduce((sum, p) => sum + p.count, 0) / maxViews) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm tabular-nums">
                {sortedPages.slice(5).reduce((sum, p) => sum + p.count, 0)} views
              </span>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-accent rounded-md"
                  onClick={() => handlePlayClick(sortedPages.slice(5)[0].page)}
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 