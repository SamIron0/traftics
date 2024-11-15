import React from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  PlusIcon,
  ThermometerSun,
} from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarPanelProps {
  currentPath: string;
}

export function SidebarPanel({ currentPath }: SidebarPanelProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState("");
  const router = useRouter();
  const handleCreateDashboard = () => {
    // Handle dashboard creation here
    console.log("Creating dashboard:", dashboardName);
    setDialogOpen(false);
    setDashboardName("");
  };

  const dashboardsPattern = /^\/org\/[^/]+\/project\/[^/]+\/dashboards$/;
  const sessionsPattern = /^\/org\/[^/]+\/project\/[^/]+\/sessions$/;
  const heatmapsPattern = /^\/org\/[^/]+\/project\/[^/]+\/heatmaps$/;

  const getContent = () => {
    if (dashboardsPattern.test(currentPath)) {
      return {
        title: "Dashboard Options",
        icon: LayoutDashboard,
        content: (
          <>
            <div className="space-y-2 max-w-sm">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-3" /> New Dashboard
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className={cn("w-full", {
                  "bg-accent text-accent-foreground": currentPath === "/dashboards"
                })}
              >
                <LayoutDashboard className="h-4 w-4 mr-3" /> Project Overview
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
                  <Button
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                  >
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
                <PlusIcon className="h-4 w-4 mr-3" />
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
                  <Button
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                  >
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
        content: <div>Heatmaps</div>,
      };
    }
    return null;
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="flex flex-col  h-screen space-y-6 p-3 w-[280px] border-r">
      <div className="flex">
        <h2 className="text-lg font-semibold flex gap-2">
          <SidebarTrigger />
            {content.title}
        </h2>
      </div>
      {content.content}
    </div>
  );
}
