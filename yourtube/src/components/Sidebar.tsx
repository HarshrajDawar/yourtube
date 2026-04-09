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

  const isActive = (path: string) => router.pathname === path;

  const [isdialogeopen, setisdialogeopen] = useState(false);

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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-[56px] left-0 h-[calc(100vh-56px)] 
        w-64 bg-background border-r border-border p-3 z-[70] lg:z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"}
        ${!isOpen && "lg:w-0 lg:p-0 lg:border-none overflow-hidden"}
      `}>
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <Link href={item.path} key={item.path}>
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-4 h-10 px-3 rounded-lg transition-all duration-300 group relative
                ${isActive(item.path) 
                  ? "bg-white text-zinc-950 font-black shadow-lg border border-black/10 ring-1 ring-black/5" 
                  : "hover:bg-gray-100/80 hover:scale-[1.02] text-muted-foreground hover:text-foreground active:scale-95"}
              `}
              title={item.label}
            >
              <span className={`transition-all duration-300 ${isActive(item.path) ? "text-red-600 scale-110" : "group-hover:scale-110 group-hover:text-red-600"}`}>
                {item.icon}
              </span>
              <span className="text-[14px] tracking-tight">{item.label}</span>
              {isActive(item.path) && <div className="absolute right-3 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
            </Button>
          </Link>
        ))}

        {user && (
          <div className="border-t border-border mt-3 pt-3 space-y-1">
            <h3 className="px-4 py-2 text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">You</h3>
            {userItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start gap-4 h-10 px-3 rounded-lg transition-all duration-300 group relative
                    ${isActive(item.path) 
                      ? "bg-white text-zinc-950 font-black shadow-lg border border-black/10 ring-1 ring-black/5" 
                      : "hover:bg-gray-100/80 hover:scale-[1.02] text-muted-foreground hover:text-foreground active:scale-95"}
                  `}
                  title={item.label}
                >
                  <span className={`transition-all duration-300 ${isActive(item.path) ? "text-red-600 scale-110" : "group-hover:scale-110 group-hover:text-red-600"}`}>
                    {item.icon}
                  </span>
                  <span className="text-[14px] tracking-tight">{item.label}</span>
                  {isActive(item.path) && <div className="absolute right-3 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </Button>
              </Link>
            ))}

            {user?.channelname ? (
              <Link href={`/channel/${user._id}`}>
                <Button variant="ghost" className="w-full justify-start gap-4 h-10 px-3 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all text-muted-foreground hover:text-foreground group">
                  <User className="w-5 h-5 shadow-sm group-hover:text-red-600 transition-colors" />
                  <span className="text-[14px] font-medium">Your channel</span>
                </Button>
              </Link>
            ) : (
              <div className="px-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center rounded-full font-bold h-9 border hover:bg-gray-100 transition-all duration-300"
                  onClick={() => setisdialogeopen(true)}
                >
                  Create Channel
                </Button>
              </div>
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
