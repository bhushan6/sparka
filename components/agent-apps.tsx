"use client";

import { useQuery } from "@tanstack/react-query";
import { AgentAppItem } from "./agent-app-item";
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from "./ui/sidebar";
import { Loader2 } from "lucide-react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useSession } from "@/providers/session-provider";

type Toolkit = {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  categories?: Array<{
    name: string;
    slug: string;
  }>;
  isConnected: boolean;
  connectionId?: string;
};

const fetchToolkits = async (): Promise<{ toolkits: Toolkit[] }> => {
  const response = await fetch("/api/composio/toolkit");
  if (!response.ok) {
    throw new Error("Failed to fetch toolkits");
  }
  return response.json();
};

export const AgentApps = () => {
  const { data: session, isPending: isSessionPending } = useSession();

  if (isSessionPending) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <Loader2 className="w-4 h-4 animate-spin mx-auto group-data-[collapsible=icon]:hidden" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (!isSessionPending && !session) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <p className="text-center text-sm text-gray-500 group-data-[collapsible=icon]:hidden">
            Sign in to see your apps.
          </p>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["/api/composio/toolkit"],
    queryFn: fetchToolkits,
  });

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <Loader2 className="w-4 h-4 animate-spin mx-auto group-data-[collapsible=icon]:hidden" />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <p className="text-[var(--destructive)] text-center group-data-[collapsible=icon]:hidden">
            Failed to load apps
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center justify-center w-full h-full text-sm text-blue-500 hover:underline"
          >
            <ArrowClockwiseIcon className="w-4 h-4 mr-1" />
            Try Again
          </button>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {data?.toolkits?.map((toolkit: Toolkit) => (
            <AgentAppItem key={toolkit.slug} toolkit={toolkit} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
