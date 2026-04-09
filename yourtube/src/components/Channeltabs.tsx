"use client"
import React, { useEffect,useState } from "react";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import VideoCard from "./videocard";
const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "downloads", label: "Downloads" },
  { id: "about", label: "About" },
];
const Channeltabs = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) => {
  return (
    <div className="border-b px-4">
      <div className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`px-0 py-4 border-b-2 rounded-none transition-all ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Channeltabs;
