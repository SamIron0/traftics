"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  BarChart3,
  Gauge,
  LayoutDashboard,
  Settings,
  ThermometerSun,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    {
      group: "Analytics",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          label: "Sessions",
          icon: BarChart3,
          path: "/sessions",
        },
        {
          label: "Heatmaps",
          icon: ThermometerSun,
          path: "/heatmaps",
        },
      ],
    },
    {
      group: "Settings",
      items: [
        {
          label: "Options",
          icon: Settings,
          path: "/settings",
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            
            {group.items.map((item) => (
              <SidebarMenuButton
                key={item.path}
                tooltip={item.label}
                isActive={pathname === item.path}
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
        <SidebarMenuButton 
          variant="default" 
          size="sm" 
          tooltip="Status"
          onClick={() => router.push("/status")}
        >
          <Gauge className="text-green-500" />
          System Status
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
  