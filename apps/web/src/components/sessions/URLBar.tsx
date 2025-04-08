import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Page {
  href: string;
  timestamp: string;
}

interface URLBarProps {
  pages: Page[];
  selectedPageIndex: number;
  onPageSelect: (index: number) => void;
  onTimeUpdate: (timestamp: string) => void;
}

export function URLBar({
  pages,
  selectedPageIndex,
  onPageSelect,
  onTimeUpdate,
}: URLBarProps) {
  const { toast } = useToast();

  const handleCopyUrl = () => {
    if (pages[selectedPageIndex]) {
      navigator.clipboard.writeText(pages[selectedPageIndex].href);
      toast({
        description: "URL copied to clipboard",
      });
    }
  };

  const handleOpenExternal = () => {
    if (pages[selectedPageIndex]) {
      window.open(pages[selectedPageIndex].href, "_blank");
    }
  };

  return (
    <div className="border-b px-4 py-3 transition-all duration-300 bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">
              {selectedPageIndex + 1}/{pages.length}
            </span>
            <div className="flex w-full items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full max-w-xl justify-between"
                  >
                    {pages[selectedPageIndex]?.href || "No pages recorded"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                  {pages.map((page, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        onPageSelect(index);
                        onTimeUpdate(page.timestamp);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {index + 1}.
                        </span>
                        {page.href}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyUrl}
                    disabled={!pages.length}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy URL</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenExternal}
                    disabled={!pages.length}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open in new tab</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 