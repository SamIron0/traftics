import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useAppStore } from "@/stores/useAppStore";
import { Tables } from "supabase/types";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
export function Navbar() {
  const { allProjects, projectId } = useAppStore();
  const [selectedSite, setSelectedSite] = useState<Partial<Tables<"websites">>>(
    allProjects.find((p) => p.id === projectId) || {}
  );
  const router = useRouter();
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex flex-1 justify-start">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[200px] justify-between text-sm"
              >
                {selectedSite?.name}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              {allProjects.map((project) => {
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/80"
                    onClick={() => setSelectedSite(project)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {project.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              <Button
                className="w-full rounded-none border-0 border-t"
                onClick={() => {
                  router.push("/signup");
                }}
                variant={"outline"}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add new site
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
