import composio from "@/app/(apps)/lib/composio";
import { ChatSDKError } from "@/lib/ai/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const userId = user?.id || null;
  const isAuthenticated = userId !== null;

  if (!isAuthenticated) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const connectedAccounts = await composio.connectedAccounts.list({
    userIds: [userId],
  });
  const connectedToolkitMap: string[] = [];
  connectedAccounts.items.forEach((account) => {
    connectedToolkitMap.push(account.toolkit.slug.toUpperCase());
  });

  const tools = await composio.tools.get(userId, {
    toolkits: connectedToolkitMap,
    limit: 999999999,
  });

  const availableTools = Object.entries(tools).reduce((acc, [key, value]) => {
    //@ts-expect-error: This is a placeholder for the description property
    acc[key] = value.description || "No description available";
    return acc;
  }, {});

  return NextResponse.json(availableTools);
}
