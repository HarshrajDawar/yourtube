import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download,
  Crown,
  Video,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

import { useRouter } from "next/router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path: string) => router.pathname === path;

  const [isdialogeopen, setisdialogeopen] = useState(false);

  // Hide on scroll logic for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router, onClose]);

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/" },
    { icon: <Compass className="w-5 h-5" />, label: "Explore", path: "/explore" },
    { icon: <PlaySquare className="w-5 h-5" />, label: "Subscriptions", path: "/subscriptions" },
    { icon: <Video className="w-5 h-5" />, label: "Video Call", path: "/video-call" },
  ];

  const userItems = [
    { icon: <History className="w-5 h-5" />, label: "History", path: "/history" },
    { icon: <ThumbsUp className="w-5 h-5" />, label: "Liked videos", path: "/liked" },
    { icon: <Clock className="w-5 h-5" />, label: "Watch later", path: "/watch-later" },
    { icon: <Download className="w-5 h-5" />, label: "Downloads", path: "/downloads" },
    { icon: <Crown className="w-5 h-5 text-amber-500" />, label: "Premium Upgrade", path: "/premium" },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed md:sticky top-[56px] left-0 h-[calc(100vh-56px)] 
        bg-background/95 backdrop-blur-md border-r border-border p-3 z-[45]
        transition-all duration-300 ease-in-out flex-shrink-0
        ${isOpen 
          ? "w-[72px] md:w-[240px] translate-x-0" 
          : "w-0 md:w-[72px] -translate-x-full md:translate-x-0 overflow-hidden md:overflow-visible"
        }
        shadow-2xl md:shadow-none
      `}>
      <nav className="space-y-4 md:space-y-1">
        {sidebarItems.map((item) => (
          <Link href={item.path} key={item.path}>
            <Button 
              variant="ghost" 
              className={`w-full h-11 md:h-10 px-3 rounded-xl md:rounded-lg transition-all duration-300 group relative flex items-center
                ${isOpen ? "justify-center md:justify-start gap-0 md:gap-4" : "justify-center gap-0"}
                ${isActive(item.path) 
                  ? "bg-secondary text-foreground font-bold shadow-sm" 
                  : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground active:scale-95"}
              `}
              title={item.label}
            >
              <span className={`transition-all duration-300 flex-shrink-0 ${isActive(item.path) ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-primary"}`}>
                {item.icon}
              </span>
              <span className={`
                text-[14px] tracking-tight truncate transition-all duration-500 hidden md:block
                ${isOpen ? "opacity-100 flex-1 text-left ml-4" : "opacity-0 w-0 h-0 overflow-hidden"}
              `}>
                {item.label}
              </span>
              {isOpen && isActive(item.path) && (
                <div className="absolute right-3 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)] hidden lg:block" />
              )}
            </Button>
          </Link>
        ))}

        {user && (
          <div className={`mt-6 pt-6 md:mt-3 md:pt-3 space-y-4 md:space-y-1 ${isOpen ? "border-t md:border-t-0 lg:border-t border-border" : ""}`}>
            <h3 className={`
              px-4 py-2 text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest truncate
              ${isOpen ? "block md:hidden lg:block" : "hidden"}
            `}>
              You
            </h3>
            {userItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <Button 
                  variant="ghost" 
                  className={`w-full h-11 md:h-10 px-3 rounded-xl md:rounded-lg transition-all duration-300 group relative flex items-center
                    ${isOpen ? "justify-center md:justify-start gap-0 md:gap-4" : "justify-center gap-0"}
                    ${isActive(item.path) 
                      ? "bg-secondary text-foreground font-bold shadow-sm" 
                      : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground active:scale-95"}
                  `}
                  title={item.label}
                >
                  <span className={`transition-all duration-300 flex-shrink-0 ${isActive(item.path) ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-primary"}`}>
                    {item.icon}
                  </span>
                  <span className={`
                    text-[14px] tracking-tight truncate transition-all duration-500 hidden md:block
                    ${isOpen ? "opacity-100 flex-1 text-left ml-4" : "opacity-0 w-0 h-0 overflow-hidden"}
                  `}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            ))}

            {user?.channelname ? (
              <Link href={`/channel/${user._id}`}>
                <Button 
                  variant="ghost" 
                  className={`w-full h-11 md:h-10 px-3 rounded-xl md:rounded-lg hover:bg-secondary/80 hover:scale-[1.02] transition-all text-muted-foreground hover:text-foreground group flex items-center
                    ${isOpen ? "justify-center md:justify-start gap-0 md:gap-4" : "justify-center gap-0"}
                  `}
                >
                  <User className="w-5 h-5 flex-shrink-0 shadow-sm group-hover:text-primary transition-colors" />
                  <span className={`
                    text-[14px] font-medium truncate transition-all duration-500 hidden md:block
                    ${isOpen ? "opacity-100 flex-1 text-left ml-4" : "opacity-0 w-0 h-0 overflow-hidden"}
                  `}>
                    Your channel
                  </span>
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                className={`w-full h-11 md:h-10 px-3 rounded-xl md:rounded-lg transition-all duration-300 group relative flex items-center mt-2
                  ${isOpen ? "justify-center md:justify-start gap-0 md:gap-4" : "justify-center gap-0"}
                  hover:bg-secondary/80 text-muted-foreground hover:text-foreground active:scale-95
                `}
                title="Create Channel"
                onClick={() => setisdialogeopen(true)}
              >
                <span className="transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:text-primary">
                  <UserPlus className="w-5 h-5" />
                </span>
                <span className={`
                  text-[14px] tracking-tight truncate transition-all duration-500 hidden md:block
                  ${isOpen ? "opacity-100 flex-1 text-left ml-4" : "opacity-0 w-0 h-0 overflow-hidden"}
                `}>
                  Create Channel
                </span>
              </Button>
            )}
          </div>
        )}
      </nav>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
    </>
  );
};

export default Sidebar;
