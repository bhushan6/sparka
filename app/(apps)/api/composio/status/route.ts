import composio from "@/app/(apps)/lib/composio";
import { ChatSDKError } from "@/lib/ai/errors";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Type for the connection status response
type ConnectionStatus = {
  id: string;
  status: "INITIALIZING" | "INITIATED" | "ACTIVE" | "FAILED" | "EXPIRED";
  authConfig: {
    id: string;
    isComposioManaged: boolean;
    isDisabled: boolean;
  };
  data: Record<string, unknown>;
  params?: Record<string, unknown>;
};

export async function GET(request: Request) {
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
    // Wait for connection to complete (with timeout)
    const connection = (await composio.connectedAccounts.waitForConnection(
      connectionId,
      // Optional: Add timeout configuration if supported
    )) as ConnectionStatus;

    console.log({ status: connection.status });

    return NextResponse.json({
      id: connection.id,
      status: connection.status,
      authConfig: connection.authConfig,
      data: connection.data,
      params: connection.params,
    });
  } catch (error) {
    console.error("Failed to get connection status:", error);

    if (error instanceof Error && "code" in error) {
      // Handle Composio specific errors
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to get connection status" },
      { status: 500 },
    );
  }
}
