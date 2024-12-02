export function HeatmapsSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Skeleton */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex flex-1 justify-end">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-muted animate-pulse rounded w-1/4 mb-2" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-16" />
              </div>
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 