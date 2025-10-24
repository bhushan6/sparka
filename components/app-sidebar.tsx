"use client";
import { AppWindowMac, Cpu, Plus } from "lucide-react";
import Link from "next/link";
import { NewChatButton } from "@/components/new-chat-button";
import { SearchChatsButton } from "@/components/search-chats";
import { SidebarTopRow } from "@/components/sidebar-top-row";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AppSidebarFooterConditional } from "./app-sidebar-footer-conditional";
import { AppSidebarHistoryConditional } from "./app-sidebar-history-conditional";
import { useQueryState } from "nuqs";
import { AgentApps } from "./agent-apps";

export function AppSidebar() {
  const [app, setApp] = useQueryState("app");
  return (
    <Sidebar
      className="grid max-h-dvh grid-rows-[auto_1fr_auto] group-data-[side=left]:border-r-0"
      collapsible="icon"
    >
      <SidebarHeader className="shrink-0">
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <SidebarTopRow />
          </div>

          {app !== "open" && (
            <>
              <NewChatButton />

              <SidebarMenuItem>
                <SearchChatsButton />
              </SidebarMenuItem>
              {/*<SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Models">
                  <Link href="/models">
                    <Cpu className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Models
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>*/}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Apps"
                  onClick={() => {
                    setApp("open");
                  }}
                >
                  <AppWindowMac className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Apps
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />
      <ScrollArea className="relative flex-1 overflow-y-auto">
        <SidebarContent className="max-w-(--sidebar-width) pr-2">
          {app !== "open" && <AppSidebarHistoryConditional />}
          {app === "open" && <AgentApps />}
        </SidebarContent>
      </ScrollArea>

      <AppSidebarFooterConditional />
    </Sidebar>
  );
}
