'use client'
import { Calendar, Home, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


// Menu items.
const items = [
  {
    title: "Cotação",
    url: "/quotation",
    icon: Home,
  },
  {
    title: "Produtos",
    url: "/products",
    icon: Calendar,
  },
  {
    title: "Fornecedores",
    url: "/suppliers",
    icon: Search,
  },
  {
    title: "Empresa",
    url: "/companies",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="w-16rem">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
