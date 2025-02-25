import { useAppStore } from "@/stores/useAppStore";
import { CreditCard, Rocket } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function SidebarMembershipSection({
  state,
  handleUpgradeClick,
}: {
  state: "collapsed" | "expanded";
  handleUpgradeClick: () => void;
}) {
  const { subscriptionStatus, cancelAtPeriodEnd } = useAppStore();

  const renderContent = () => {
    switch (subscriptionStatus) {
      case "active":
        return (
          <div className="flex flex-col gap-5">
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              {cancelAtPeriodEnd
                ? "🔄 Your subscription will cancel at the end of the billing period"
                : "🌟 You're on the premium plan. Enjoy all advanced features!"}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex border items-center justify-center gap-2 group-data-[collapsible=icon]:p-2 rounded-lg px-3 py-2",
                      state === "collapsed"
                        ? "bg-gradient-to-br border border-zinc-300 from-blue-500/20 via-indigo-500/20 to-purple-500/20 hover:from-blue-500/30 hover:via-indigo-500/30 hover:to-purple-500/30"
                        : "border-zinc-500/50"
                    )}
                    onClick={handleUpgradeClick}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs group-data-[collapsible=icon]:hidden">
                      {"Manage billing"}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium"
                  hidden={state !== "collapsed"}
                >
                  {"Manage billing"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );

      case "canceled":
        return (
          <div className="flex flex-col gap-5">
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              👋 Your subscription is ending soon. Renew to keep premium
              features.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex border items-center justify-center gap-2 group-data-[collapsible=icon]:p-2 rounded-lg px-3 py-2",
                      state === "collapsed"
                        ? "bg-gradient-to-br border border-zinc-300 from-blue-500/20 via-indigo-500/20 to-purple-500/20 hover:from-blue-500/30 hover:via-indigo-500/30 hover:to-purple-500/30"
                        : "border-zinc-500/50"
                    )}
                    onClick={handleUpgradeClick}
                  >
                    <Rocket className="h-4 w-4" />
                    <span className="text-xs group-data-[collapsible=icon]:hidden">
                      Renew subscription
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium"
                  hidden={state !== "collapsed"}
                >
                  Renew subscription
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );

      case "past_due":
        return (
          <div className="flex flex-col gap-5">
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              ⚠️ Payment overdue. Update your billing info to avoid service
              interruption.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex border items-center justify-center gap-2 group-data-[collapsible=icon]:p-2 rounded-lg px-3 py-2",
                      state === "collapsed"
                        ? "bg-gradient-to-br border border-zinc-300 from-blue-500/20 via-indigo-500/20 to-purple-500/20 hover:from-blue-500/30 hover:via-indigo-500/30 hover:to-purple-500/30"
                        : "border-zinc-500/50"
                    )}
                    onClick={handleUpgradeClick}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs group-data-[collapsible=icon]:hidden">
                      Update payment
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium"
                  hidden={state !== "collapsed"}
                >
                  Update payment
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-5">
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              ✨ Get access to our most advanced features.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex border items-center justify-center gap-2 group-data-[collapsible=icon]:p-2 rounded-lg px-3 py-2",
                      state === "collapsed"
                        ? "bg-gradient-to-br border border-zinc-300 from-blue-500/20 via-indigo-500/20 to-purple-500/20 hover:from-blue-500/30 hover:via-indigo-500/30 hover:to-purple-500/30"
                        : "border-zinc-500/50"
                    )}
                    onClick={handleUpgradeClick}
                  >
                    <Rocket className="h-4 w-4" />
                    <span className="text-xs group-data-[collapsible=icon]:hidden">
                      Upgrade plan
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium"
                  hidden={state !== "collapsed"}
                >
                  Upgrade plan
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}
