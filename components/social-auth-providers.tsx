"use client";

import { GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import authClient from "@/lib/auth-client";

export function SocialAuthProviders() {
  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={() => authClient.signIn.social({ provider: "google" })}
        type="button"
        variant="outline"
      >
        <GoogleLogo className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
