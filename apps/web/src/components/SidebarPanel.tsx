import React, { useRef } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  PlusIcon,
  ThermometerSun,
} from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "./ui/sheet";
import { Label } from "./ui/label";
import CreateHeatmap from "./Heatmap/CreateHeatmap";
import HeatmapsList from "./Heatmap/HeatmapsList";
import { useAppStore } from "@/stores/useAppStore";
import { Badge } from "./ui/badge";

interface SidebarPanelProps {
  currentPath: string;
}

export function SidebarPanel({ currentPath }: SidebarPanelProps) {
  const { state } = useSidebar();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState("");
  const router = useRouter();
  const heatmapsListRef = useRef<{ refresh: () => void }>(null);
 
  const handleCreateDashboard = () => {
    // Handle dashboard creation here
    console.log("Creating dashboard:", dashboardName);
    setDialogOpen(false);
    setDashboardName("");
  };

  const handleHeatmapCreated = () => {
    if (heatmapsListRef.current) {
      heatmapsListRef.current.refresh();
    }
  };

  const dashboardsPattern =
    /^\/org\/[^/]+\/project\/[^/]+\/dashboards(?:\/[^/]+)?$/;
  const sessionsPattern =
    /^\/org\/[^/]+\/project\/[^/]+\/sessions(?:\/[^/]+)?$/;
  const heatmapsPattern =
    /^\/org\/[^/]+\/project\/[^/]+\/heatmaps(?:\/[^/]+)?$/;

  const getContent = () => {
    if (dashboardsPattern.test(currentPath)) {
      return {
        title: "Dashboard Settings",
        icon: LayoutDashboard,
        content: (
          <>
            <div className="space-y-2 max-w-sm">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" /> New Dashboard
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className={cn("w-full", {
                  "bg-accent text-accent-foreground":
                    currentPath === "/dashboards",
                })}
              >
                <LayoutDashboard className="h-4 w-4 mr-3" /> Project Overview
              </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogTitle>Create New Dashboard</DialogTitle>
                <DialogDescription>
                  Enter a name for your new dashboard.
                </DialogDescription>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Dashboard Name</Label>
                    <Input
                      id="name"
                      value={dashboardName}
                      onChange={(e) => setDashboardName(e.target.value)}
                      placeholder="My Dashboard"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDashboard}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ),
      };
    }
    if (sessionsPattern.test(currentPath)) {
      return {
        title: "Session Filters",
        icon: BarChart3,
        content: (
          <>
            <div className="space-y-2 max-w-sm">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Filter
              </Button>
              <span className="h-[1px] w-full bg-border" />
              <h2 className="text-md font-semibold pt-3">Default Segments</h2>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="w-full justify-start"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Completed Sessions
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="w-full justify-start"
              >
                <Activity className="h-4 w-4 mr-1" />
                Active Sessions
              </Button>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Dashboard</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Dashboard name"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                    Discard
                  </Button>
                  <Button onClick={handleCreateDashboard}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ),
      };
    }
    if (heatmapsPattern.test(currentPath)) {
      return {
        title: "Heatmap Filters",
        icon: ThermometerSun,
        content: (
          <>
            <div className="space-y-2 max-w-sm">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilterSheetOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Heatmap
              </Button>

              <div className="mt-4 space-y-2">
                <HeatmapsList ref={heatmapsListRef} />
              </div>
            </div>

            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetContent side="left" className="p-0 sm:w-[600px]">
                <CreateHeatmap
                  onClose={() => setFilterSheetOpen(false)}
                  onSuccess={handleHeatmapCreated}
                />
              </SheetContent>
            </Sheet>
          </>
        ),
      };
    }
    return null;
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 flex flex-col min-h-0 w-[207px] border-r bg-background transition-[left] duration-200 ease-linear",
        state === "expanded" ? "left-[207px]" : "left-[47px]"
      )}
    >
      <div className="flex-none p-3 mt-1.5">
        <h2 className="text-lg font-semibold flex gap-2">
          {content.title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">{content.content}</div>
    </div>
  );
}
