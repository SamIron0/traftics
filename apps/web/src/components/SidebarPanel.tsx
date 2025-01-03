import React from "react";
import {
  LayoutDashboard,
  PlusIcon,
} from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

interface SidebarPanelProps {
  currentPath: string;
}

export function SidebarPanel({ currentPath }: SidebarPanelProps) {
  const { state } = useSidebar();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState("");
  const router = useRouter();

  const handleCreateDashboard = () => {
    // Handle dashboard creation here
    setDialogOpen(false);
    setDashboardName("");
  };

  const dashboardsPattern =
    /^\/org\/[^/]+\/project\/[^/]+\/dashboards(?:\/[^/]+)?$/;
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
        <h2 className="text-lg font-semibold flex gap-2">{content.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">{content.content}</div>
    </div>
  );
}
