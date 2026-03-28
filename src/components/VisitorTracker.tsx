"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      // Don't track if this device belongs to the admin
      if (pathname.startsWith('/admin')) {
        localStorage.setItem('platform_admin', 'true');
      }

      if (localStorage.getItem('platform_admin') === 'true') {
        return; // Ignore owner traffic
      }

      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email;

        await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            email: email || null
          }),
        });
      } catch (error) {
        // Silent error to not affect user experience
        console.error("Tracking failed:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // This component doesn't render anything
}
