import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  pages: Array<{
    page: string;
    count: number;
  }>;
}

export function TopPages({ pages }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Visited Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.slice(0, 5).map((page, i) => (
            <div key={page.page} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{i + 1}.</span>
                <span className="font-medium">{page.page}</span>
              </div>
              <span className="text-muted-foreground">{page.count} views</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 