"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useChatId } from "@/providers/chat-id-provider";
import { AppWindowMac } from "lucide-react";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useQueryState } from "nuqs";

export function SidebarTopRow() {
  const { setOpenMobile, open, openMobile } = useSidebar();
  const { refreshChatID } = useChatId();

  const [app, setApp] = useQueryState("app");

  return (
    <>
      {app !== "open" && (
        <Link
          className="flex flex-row items-center gap-2"
          href="/"
          onClick={() => {
            setOpenMobile(false);
            refreshChatID();
          }}
        >
          <span className="flex cursor-pointer items-center gap-2 rounded-md p-1 font-semibold text-lg hover:bg-muted">
            <Image
              alt="Sparka AI"
              className="h-6 w-6"
              height={24}
              src="/icon.svg"
              width={24}
            />
            {(open || openMobile) && (
              <span>
                <span>Sparka</span>
                <span className="text-zinc-500 text-xs mx-1">(swissknife)</span>
              </span>
            )}
          </span>
        </Link>
      )}
      {app === "open" && (
        <span className="flex cursor-pointer items-center gap-2 rounded-md p-1 font-semibold text-lg hover:bg-muted">
          <ArrowLeftIcon
            className="size-4 group-data-[collapsible=icon]:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setApp("close");
            }}
          />
          <AppWindowMac className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Apps</span>
        </span>
      )}
    </>
  );
}
