"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  ChevronsUpDown,
  LogOut,
  LayoutDashboard,
  Rocket,
  Settings,
  ThermometerSun,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { signOut } = useAuthStatus();

  const orgSlug = params?.orgSlug as string;
  const projectSlug = params?.projectSlug as string;

  const handleLogout = async () => {
    try {
      await signOut();
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
          path: `/org/${orgSlug}/project/${projectSlug}/dashboards/`,
        },
        {
          label: "Sessions",
          icon: BarChart3,
          path: `/org/${orgSlug}/project/${projectSlug}/sessions`,
        },
        {
          label: "Heatmaps",
          icon: ThermometerSun,
          path: `/org/${orgSlug}/project/${projectSlug}/heatmaps`,
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
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "https://github.com/SamIron0.png",
    },
  };

  return (
    <div className="flex flex-row h-100vh ">
      <Sidebar className="bg-black">
        <SidebarHeader></SidebarHeader>

        <SidebarContent>
          {navigation.map((group) => (
            <SidebarGroup key={group.group} className="space-y-2">
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>

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
          ))}
        </SidebarContent>

        <SidebarFooter>
          <Button variant="secondary" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Upgrade plan
          </Button>

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
                    <DropdownMenuItem>
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
