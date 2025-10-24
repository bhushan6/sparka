import { ChatSDKError } from "@/lib/ai/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import composio from "../../../lib/composio";

// Using custom types since they're not exported from @composio/core
export type ToolkitResponse = {
  name: string;
  slug: string;
  meta?: {
    description?: string;
    logo?: string;
    categories?: Array<{
      name: string;
      slug: string;
    }>;
  };
};

export type ConnectedAccount = {
  id: string;
  toolkit: {
    slug: string;
  };
};

// Hardcoded list of supported toolkits
const SUPPORTED_TOOLKITS = ["GMAIL", "GOOGLECALENDAR", "GOOGLEDOCS", "GITHUB"];

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const userId = user?.id || null;
  const isAuthenticated = userId !== null;

  if (!isAuthenticated) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  try {
    // Fetch connected accounts for the user
    const connectedToolkitMap: Map<string, string> = new Map(); // slug -> connectionId

    try {
      const connectedAccounts = await composio.connectedAccounts.list({
        userIds: [user!.id],
      });

      // Extract toolkit slugs and connection IDs from connected accounts
      connectedAccounts.items.forEach((account: ConnectedAccount) => {
        if (account.toolkit?.slug && account.id) {
          connectedToolkitMap.set(
            account.toolkit.slug.toUpperCase(),
            account.id,
          );
        }
      });
    } catch (error) {
      console.error("Failed to fetch connected accounts:", error);
      // Continue without connection status if this fails
    }

    // Fetch all toolkits in parallel
    const toolkitPromises = SUPPORTED_TOOLKITS.map(async (slug) => {
      try {
        const toolkit = (await composio.toolkits.get(slug)) as ToolkitResponse;
        const upperSlug = slug.toUpperCase();
        const connectionId = connectedToolkitMap.get(upperSlug);

        return {
          name: toolkit.name,
          slug: toolkit.slug,
          description: toolkit.meta?.description,
          logo: toolkit.meta?.logo,
          categories: toolkit.meta?.categories,
          isConnected: !!connectionId,
          connectionId: connectionId || undefined,
        };
      } catch (error) {
        console.error(`Failed to fetch toolkit ${slug}:`, error);
        return null;
      }
    });

    const results = await Promise.all(toolkitPromises);
    const toolkits = results.filter((t) => t !== null);

    return NextResponse.json({ toolkits });
  } catch (error) {
    console.error("Failed to fetch toolkits:", error);
    return NextResponse.json(
      { error: "Failed to fetch toolkits" },
      { status: 500 },
    );
  }
}
