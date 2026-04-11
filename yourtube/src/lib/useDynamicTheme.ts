import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { useUser } from "./AuthContext";
import { toast } from "sonner";

export const useDynamicTheme = () => {
  const { setTheme } = useTheme();
  const { userState: authState } = useUser();
  const [ipState, setIpState] = useState<string | null>(null);

  useEffect(() => {
    // Comprehensive southern states list with common spelling variations
    const southernStates = [
      "Tamil Nadu", "Tamilnadu", "Tamil nadu",
      "Kerala", 
      "Karnataka", 
      "Andhra Pradesh", "Andhra", 
      "Telangana", "Telungana"
    ];
    
    const checkTheme = async () => {
      // 1. Priority: AuthContext Selected State
      if (authState !== "Unknown") {
        applyThemeLogic(authState);
        return;
      }

      // 2. Secondary: Cached Location
      const cached = localStorage.getItem('user_location_cache');
      if (cached) {
        try {
          const { state: cachedState, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { // 24h cache
            applyThemeLogic(cachedState);
            setIpState(cachedState);
            return;
          }
        } catch (e) { localStorage.removeItem('user_location_cache'); }
      }

      // 3. Fallback: Network Fetch (with protection)
      let state = "Unknown";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const locRes = await fetch("https://ipapi.co/json/", { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);

        if (locRes.ok) {
          const locData = await locRes.json();
          state = locData.region || "Unknown";
          // Cache the successful result
          localStorage.setItem('user_location_cache', JSON.stringify({
            state,
            city: locData.city || "Mumbai",
            timestamp: Date.now()
          }));
          setIpState(state);
        }
      } catch (error) {
        console.debug("[DynamicTheme] Location fetch bypassed.");
      }
      applyThemeLogic(state);
    };

    const applyThemeLogic = (stateToUse: string) => {
      try {
        const isSouthern = southernStates.some(s => 
          stateToUse.toLowerCase().includes(s.toLowerCase())
        );
        
        const hour = new Date().getHours();
        const isTargetTime = hour >= 10 && hour < 12;

        console.log(`[DynamicTheme] Final State: ${stateToUse}, Southern: ${isSouthern}, Hour: ${hour}, TargetTime: ${isTargetTime}`);
        setTheme(isSouthern && isTargetTime ? "light" : "dark");
      } catch (error) {
        setTheme("dark"); 
      }
    };

    checkTheme();
    const interval = setInterval(checkTheme, 600000); // Check every 10 mins
    return () => clearInterval(interval);
  }, [setTheme, authState, ipState]);

  return authState !== "Unknown" ? authState : ipState;
};
