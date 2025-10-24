import { ChatSDKError } from "@/lib/ai/errors";
import { auth } from "@/lib/auth";
import { TOOLKIT_AUTH_CONFIG } from "@/lib/toolkit-config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import composio from "../../../lib/composio";

type ConnectionRequestResponse = {
  id: string;
  redirectUrl?: string | null;
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const userId = user?.id || null;
  const isAuthenticated = userId !== null;

  if (!isAuthenticated) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const { toolkitSlug } = await request.json();

  if (!toolkitSlug) {
    return NextResponse.json(
      { error: "toolkitSlug is required" },
      { status: 400 },
    );
  }

  const authConfigId = TOOLKIT_AUTH_CONFIG[toolkitSlug.toUpperCase()];

  if (!authConfigId) {
    return NextResponse.json(
      { error: "Invalid toolkit slug" },
      { status: 400 },
    );
  }

  try {
    const connectionData = (await composio.connectedAccounts.initiate(
      user!.id,
      authConfigId,
    )) as ConnectionRequestResponse;

    return NextResponse.json({ ...connectionData });
  } catch (error) {
    console.error(`Failed to get connect link for ${toolkitSlug}:`, error);
    return NextResponse.json(
      { error: "Failed to get connect link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  const userId = user?.id || null;
  const isAuthenticated = userId !== null;

  if (!isAuthenticated) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connectionId");

  if (!connectionId) {
    return new ChatSDKError(
      "bad_request:api",
      "Connection ID is required",
    ).toResponse();
  }

  try {
    // Delete the connection
    await composio.connectedAccounts.delete(connectionId);

    return NextResponse.json({
      success: true,
      message: "Connection deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete connection:", error);

    if (error instanceof Error && "code" in error) {
      // Handle Composio specific errors
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to delete connection" },
      { status: 500 },
    );
  }
}
