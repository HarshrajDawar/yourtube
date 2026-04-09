import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const useDynamicTheme = () => {
  const { setTheme } = useTheme();
  const [location, setLocation] = useState<any>(null);

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
      let state = "Unknown";
      try {
        // 1. Get Location with a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const locRes = await fetch("https://ipapi.co/json/", { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);

        if (locRes.ok) {
          const locData = await locRes.json();
          state = locData.region || "Unknown";
          setLocation(state);
        } else {
          // Fallback if ipapi fails
          state = "Unknown";
        }
      } catch (error: any) {
        // Suppress "Failed to fetch" errors to avoid console noise
        if (error.name !== "AbortError") {
          console.debug("[DynamicTheme] Location fetch bypassed due to network/CORS.");
        }
        state = "Unknown";
      }

      try {
        const isSouthern = southernStates.some(s => 
          state.toLowerCase().includes(s.toLowerCase())
        );
        
        // 2. Get Time
        const now = new Date();
        const hour = now.getHours();
        // Target: 10 AM (10:00) to 12 PM (12:00)
        const isTargetTime = hour >= 10 && hour < 12;

        console.log(`[DynamicTheme] State: ${state}, Southern: ${isSouthern}, Hour: ${hour}, TargetTime: ${isTargetTime}`);

        // 3. Apply Logic: Southern State AND 10AM-12PM => Light Theme, else Dark
        if (isSouthern && isTargetTime) {
          setTheme("light");
        } else {
          setTheme("dark");
        }
      } catch (error) {
        setTheme("dark"); 
      }
    };

    checkTheme();
    const interval = setInterval(checkTheme, 600000); // Check every 10 mins
    return () => clearInterval(interval);
  }, [setTheme]);

  return location;
};
