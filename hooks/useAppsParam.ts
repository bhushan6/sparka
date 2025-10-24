import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useAppsParam(defaultValue: string = "") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL param
  const [apps, setAppsState] = useState<string>(() => {
    return searchParams.get("apps") || defaultValue;
  });

  // Sync state when URL changes
  useEffect(() => {
    const urlApps = searchParams.get("apps") || defaultValue;
    setAppsState(urlApps);
  }, [searchParams, defaultValue]);

  // Update both state and URL
  const setApps = useCallback(
    (value: string) => {
      setAppsState(value);

      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("apps", value);
      } else {
        params.delete("apps");
      }

      console.log("apps", pathname, params);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return [apps, setApps] as const;
}
