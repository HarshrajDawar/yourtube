"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState, useRef } from "react";
import React from "react";

export default function VideoCard({ video }: any) {
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    if (!video?.filepath) return;

    const videoEl = document.createElement("video");
    videoEl.src = `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://yourtube-zg73.onrender.com'}/${video.filepath}`;

    videoEl.onloadedmetadata = () => {
      const seconds = Math.floor(videoEl.duration);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
  }, [video?.filepath]);

  return (
    <Link 
      href={`/watch/${video?._id}`} 
      className="group block transition-all duration-300 relative"
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 ease-in-out border border-transparent group-hover:border-border/50">
          <video
            src={`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://yourtube-zg73.onrender.com'}/${video?.filepath}#t=1`}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          
          <div className="absolute bottom-1 right-1 bg-white text-black text-sm font-bold px-1.5 py-0.5 rounded-md shadow-xl z-20">
            {duration}
          </div>
        </div>

        <div className="flex gap-3 px-1">
          <Avatar className="w-10 h-10 flex-shrink-0 border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-95">
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
              {(video?.videochanel?.[0] || 'V').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-bold text-sm md:text-base line-clamp-2 text-foreground leading-tight group-hover:text-red-600 transition-colors duration-300">
              {video?.videotitle || "Untitled Video"}
            </h3>

            <div className="flex flex-col opacity-90">
               <p className="text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors cursor-pointer flex items-center gap-1">
                {video?.videochanel && video?.videochanel !== "undefined" ? video.videochanel : "Anonymous Creator"}
                <span className="text-red-600 bg-red-600/10 p-0.5 rounded-full scale-75 border border-red-600/20 shadow-sm">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M9 16.17L4.83 12l-1.41 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              </p>

              <div className="flex items-center text-xs text-muted-foreground/80 font-bold tabular-nums">
                <span>{video?.views?.toLocaleString() || 0} views • </span>
                <span className="ml-1">{video?.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : "recently"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}