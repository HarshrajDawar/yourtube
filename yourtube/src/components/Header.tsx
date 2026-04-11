import { Bell, Menu, Mic, Search, Upload, User, VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import HeaderUploader from "./HeaderUploader";
import { toast } from "sonner";
import StateSelectionModal from "./StateSelectionModal";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { user, logout, handlegooglesignin } = useUser();
  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const router = useRouter();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };
  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      toast.success(`Search for: ${transcript}`);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error("Voice search failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-background border-b border-border sticky top-0 z-50 transition-all duration-300 h-14">
      <div className={`flex items-center gap-4 transition-all duration-300 ${isSearchFocused ? "hidden sm:flex" : "flex"}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0 rounded-full hover:bg-secondary/80 transition-all active:scale-95 cursor-pointer focus-visible:ring-1 focus-visible:ring-primary h-10 w-10"
          onClick={onToggleSidebar}
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-red-600 p-1 rounded shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter hidden lg:inline-block">YourTube</span>
        </Link>
      </div>

      <div className={`flex-1 transition-all duration-300 flex items-center gap-2 ${isSearchFocused ? "ml-0" : "ml-2 md:ml-4"} max-w-[720px]`}>
        {isSearchFocused && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="sm:hidden rounded-full"
            onClick={() => setIsSearchFocused(false)}
          >
             <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
          </Button>
        )}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center relative group"
        >
          <div className="flex flex-1 items-center relative">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onKeyPress={handleKeypress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-l-full border border-input border-r-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 bg-secondary/10 hover:bg-secondary/20 transition-all pl-9 md:pl-10 h-9 md:h-10 text-sm"
            />
            <Search className="absolute left-3 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground pointer-events-none" />
            <Button
              type="submit"
              variant="secondary"
              className="rounded-r-full px-3 md:px-6 h-9 md:h-10 border border-l-0 bg-secondary text-muted-foreground hover:bg-secondary-foreground/10 border-input transition-all shadow-sm active:scale-95"
              title="Search"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            type="button"
            onClick={startVoiceSearch}
            className={`rounded-full shrink-0 transition-all hover:scale-105 shadow-sm active:scale-90 h-9 w-9 md:h-11 md:w-11 ml-2 hidden sm:flex ${
              isListening ? "bg-red-600/10 text-red-600 animate-pulse border-red-600/50" : "bg-secondary/80 hover:bg-secondary"
            }`}
            title="Search with your voice"
          >
            <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isListening ? "animate-bounce" : ""}`} />
          </Button>
        </form>
      </div>

      <div className={`flex items-center gap-1 sm:gap-3 transition-all duration-300 ${isSearchFocused ? "hidden sm:flex" : "flex"}`}>
        {user ? (
          <>
            <Link href="/video-call" title="Video Meeting & Sharing">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary hover:scale-105 transition-all h-9 w-9 sm:h-10 sm:w-10">
                <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </Link>

            {user?.channelname && <HeaderUploader />}
            
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary hover:scale-105 transition-all h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:scale-110 p-0 transition-transform shadow-sm active:scale-95"
                >
                  <Avatar className="h-9 w-9 border border-border/60">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 bg-background text-foreground shadow-2xl border border-border p-2 rounded-xl z-[100]" align="end" forceMount>
                <DropdownMenuItem className="p-4 focus:bg-secondary text-foreground border-none outline-none cursor-pointer">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">{user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                         <span className="font-bold text-sm truncate">{user.name}</span>
                         <span className="text-xs text-muted-foreground truncate">@{user.email?.split('@')[0]}</span>
                      </div>
                   </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/premium" className="cursor-pointer flex justify-between items-center py-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan</span>
                      <span className="text-sm font-black text-foreground">
                        {user.plan || "Individual Free"}
                      </span>
                    </div>
                    {(!user.plan || user.plan === "Free") && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">UPGRADE</span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.channelname ? (
                  <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full font-bold h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 text-foreground focus:bg-secondary focus:text-foreground">
                  <Link href="/downloads">Downloads</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 text-foreground focus:bg-secondary focus:text-foreground">
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 text-foreground focus:bg-secondary focus:text-foreground">
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 text-foreground focus:bg-secondary focus:text-foreground">
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-bold py-2.5">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className="flex items-center gap-2 h-9 rounded-full border border-border shadow-sm font-bold text-black bg-white hover:bg-white/90 transition-all"
              onClick={() => setIsStateModalOpen(true)}
            >
              <User className="w-5 h-5" />
              Sign in
            </Button>
            <StateSelectionModal 
              isOpen={isStateModalOpen} 
              onClose={() => setIsStateModalOpen(false)} 
            />
          </>
        )}{" "}
      </div>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;
