import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  items?: NavItem[];
  isActive?: boolean;
}

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      items: [],
    },
    {
      title: "Questões",
      url: "/questions",
      items: [
        {
          title: "Todas as Questões",
          url: "/questions",
          items: [],
        },
        {
          title: "Criar Questão",
          url: "/questions/create",
          items: [],
        },
        {
          title: "Categorias",
          url: "/questions/categories",
          items: [],
        },
      ],
    },
    {
      title: "Playlists",
      url: "/playlists",
      items: [
        {
          title: "Minhas Playlists",
          url: "/playlists",
          items: [],
        },
        {
          title: "Criar Playlist",
          url: "/playlists/create",
          items: [],
        },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      items: [
        {
          title: "Usuários",
          url: "/admin/users",
          items: [],
        },
        {
          title: "Configurações",
          url: "/admin/settings",
          items: [],
        },
        {
          title: "Relatórios",
          url: "/admin/reports",
          items: [],
        },
      ],
    },
  ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-muted-foreground">
                    OFT<span className="text-bold text-primary">.quest</span>
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <Link href={item.url}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
