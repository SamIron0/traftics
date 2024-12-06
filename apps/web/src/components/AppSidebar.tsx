"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  ChevronsUpDown,
  LogOut,
  LayoutDashboard,
  Rocket,
  Settings,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarPanel } from "./SidebarPanel";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppStore } from "@/stores/useAppStore";
import SidebarMembershipSection from "./settings/SidebarMembershipSection";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthStatus();
  const { state } = useSidebar();
  const reset = useAppStore((state) => state.reset);
  const { defaultDashboardId} = useAppStore();
  const orgSlug = useAppStore((state) => state.orgSlug);
  const projectSlug = useAppStore((state) => state.projectSlug);  
  const handleLogout = async () => {
    try {
      await signOut();
      reset();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigation = [
    {
      group: "Analytics",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: `/org/${orgSlug}/project/${projectSlug}/dashboards/${defaultDashboardId}`,
        },
        {
          label: "Sessions",
          icon: BarChart3,
          path: `/org/${orgSlug}/project/${projectSlug}/sessions`,
        },
       ],
    },
    {
      group: "Settings",
      items: [
        {
          label: "Project Settings",
          icon: Settings,
          path: `/org/${orgSlug}/settings`,
        },
      ],
    },
  ];
  const data = {
    user: {
      name: "Samuel Ironkwe",
      email: "samironkwe@gmail.com",
      avatar: "https://github.com/SamIron0.png",
    },
  };

  const handleUpgradeClick = () => {
    router.push(`/org/${orgSlug}/settings/plans`);
  };

  return (
    <div className="flex flex-row h-100vh ">
      <Sidebar collapsible="icon" className="bg-black">
        <SidebarHeader>
          <div className="flex items-center gap-1 py-2 ">
            <Image
              src={state === "collapsed" ? "/logo.svg" : "/logo-text.svg"}
              alt="Traftics Logo"
              width={state === "collapsed" ? 30 : 120}
              height={state === "collapsed" ? 30 : 12}
              className="rounded-lg cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navigation.map((group, index) => (
            <React.Fragment key={group.group}>
              {index > 0 && <Separator className="my-4 px-2" />}
              <SidebarGroup className="space-y-2">
                {group.items.map((item) => (
                  <SidebarMenuButton
                    key={item.path}
                    tooltip={item.label}
                    isActive={pathname.includes(item.path)}
                    onClick={() => router.push(item.path)}
                  >
                    <item.icon />
                    {item.label}
                  </SidebarMenuButton>
                ))}
              </SidebarGroup>
            </React.Fragment>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <Separator className="my-4 px-2" />
          <SidebarMembershipSection state={state} handleUpgradeClick={handleUpgradeClick}/>
           <Separator className="my-4 px-2" />
          <SidebarTrigger />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={data.user.avatar}
                        alt={data.user.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {data.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={data.user.avatar}
                          alt={data.user.name}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {data.user.name}
                        </span>
                        <span className="truncate text-xs">
                          {data.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleUpgradeClick}>
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarPanel currentPath={pathname} />
    </div>
  );
}
