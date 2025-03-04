export function SessionsSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {/* Date Filter Skeleton */}
      <div className="mb-4">
        <div className="w-48 h-10 bg-muted animate-pulse rounded" />
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4">
            {['Started', 'Duration', 'Country', 'Screen Resolution', 'Browser', 'OS'].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="border-t">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0"
            >
              {[...Array(6)].map((_, j) => (
                <div 
                  key={j} 
                  className={`h-4 bg-muted animate-pulse rounded ${
                    j === 0 ? 'w-24' : j === 1 ? 'w-16' : 'w-full'
                  }`} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-64 h-4 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="w-24 h-8 bg-muted animate-pulse rounded" />
          <div className="w-24 h-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
} 