"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

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

type AgentAppItemProps = {
  toolkit: Toolkit;
};

export const AgentAppItem = ({ toolkit }: AgentAppItemProps) => {
  const { name, logo, isConnected, slug, connectionId } = toolkit;
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/composio/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toolkitSlug: slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate connection");
      }
      return data;
    },
    onSuccess: (data) => {
      const { redirectUrl, id: newConnectionId } = data;

      if (redirectUrl) {
        const newWindow = window.open(redirectUrl, "_blank");
        if (newWindow) {
          const pollStatus = setInterval(async () => {
            try {
              const statusResponse = await fetch(
                `/api/composio/status?connectionId=${newConnectionId}`,
              );
              const statusData = await statusResponse.json();

              if (statusResponse.ok && statusData.status === "ACTIVE") {
                clearInterval(pollStatus);
                newWindow.close();
                toast.success(`${name} connected successfully!`);
                queryClient.invalidateQueries({
                  queryKey: ["/api/composio/toolkit"],
                });
              } else if (statusData.status === "FAILED") {
                clearInterval(pollStatus);
                newWindow.close();
                toast.error(`Failed to connect ${name}.`);
              }
            } catch (error) {
              console.error("Polling error:", error);
              clearInterval(pollStatus);
              newWindow?.close();
              toast.error(`Error checking ${name} connection status.`);
            }
          }, 3000);
        } else {
          toast.error("Failed to open new window for connection.");
        }
      } else {
        toast.success(`${name} connected successfully!`);
        queryClient.invalidateQueries({ queryKey: ["/api/composio/toolkit"] });
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/composio/connect?connectionId=${connectionId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disconnect");
      }
      return data;
    },
    onSuccess: () => {
      toast.success(`${name} disconnected successfully!`);
      queryClient.invalidateQueries({ queryKey: ["/api/composio/toolkit"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const isLoading = connectMutation.isPending || disconnectMutation.isPending;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={name}>
        {logo && (
          <img
            src={logo}
            alt={name}
            width={20}
            height={20}
            onClick={async () => {
              console.log("apps getting", name);
              const res = await fetch("/api/composio/tools");
              const data = await res.json();
              console.log(data, "apps available");
            }}
          />
        )}
        <span className="group-data-[collapsible=icon]:hidden">{name}</span>
      </SidebarMenuButton>
      <SidebarMenuAction
        onClick={
          isConnected
            ? () => disconnectMutation.mutate()
            : () => connectMutation.mutate()
        }
        disabled={isLoading}
        className="flex-1 basis-1"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isConnected ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </SidebarMenuAction>
    </SidebarMenuItem>
  );
};
