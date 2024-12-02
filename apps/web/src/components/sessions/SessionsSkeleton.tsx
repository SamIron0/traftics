export function SessionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0"
            >
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 