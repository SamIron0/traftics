import { useAppStore } from "@/stores/useAppStore";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CreditCard, Rocket } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

export default function SidebarMembershipSection({
  state,
  handleUpgradeClick,
}: {
  state: "collapsed" | "expanded";
  handleUpgradeClick: () => void;
}) {
  const { subscriptionStatus } = useAppStore();
  const router = useRouter();

  const renderContent = () => {
    switch (subscriptionStatus) {
      case "active":
        return (
          <>
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              🌟 You're on the premium plan. Enjoy all advanced features!
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:p-2"
                    onClick={handleUpgradeClick}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Manage billing
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium"
                  hidden={state !== "collapsed"}
                >
                  Manage billing
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        );

      case "canceled":
        return (
          <>
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              👋 Your subscription is ending soon. Renew to keep premium features.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:p-2"
                    onClick={handleUpgradeClick}
                  >
                    <Rocket className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Renew subscription
                    </span>
                  </Button>
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
          </>
        );

      case "past_due":
        return (
          <>
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              ⚠️ Payment overdue. Update your billing info to avoid service interruption.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:p-2"
                    onClick={handleUpgradeClick}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Update payment
                    </span>
                  </Button>
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
          </>
        );

      default:
        return (
          <>
            <p className="text-xs group-data-[collapsible=icon]:hidden">
              ✨ Get a 7-day free trial. Try our most advanced features for free.
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2 group-data-[collapsible=icon]:p-2"
                    onClick={handleUpgradeClick}
                  >
                    <Rocket className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Upgrade plan
                    </span>
                  </Button>
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
          </>
        );
    }
  };

  return <>{renderContent()}</>;
}
