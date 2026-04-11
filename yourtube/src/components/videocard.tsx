"use client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useEffect, useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function VideoCard({ video, onEdit, onDelete }: any) {
  const [duration, setDuration] = useState("0:00");

  useEffect(() => {
    if (!video?.filepath) return;

    const videoEl = document.createElement("video");
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const normalizedPath = video.filepath.replace(/\\/g, '/').replace(/^\//, '');
    const encodedPath = normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    videoEl.src = `${baseUrl}/${encodedPath}`;

    videoEl.onloadedmetadata = () => {
      const seconds = Math.floor(videoEl.duration);
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hrs > 0) {
        setDuration(`${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      } else {
        setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    };
  }, [video?.filepath]);

  return (
    <div className="relative group">
      <Link 
        href={`/watch/${video?._id}`} 
        className="group block transition-all duration-300 relative"
      >
        <div className="flex flex-col gap-3 h-full">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group-hover:scale-105 group-hover:shadow-lg transition-all duration-300 ease-in-out border border-transparent group-hover:border-border/50">
            <video
              src={video?.filepath ? (() => {
                const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
                const normalizedPath = video.filepath.replace(/\\/g, '/').replace(/^\//, '');
                const encodedPath = normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
                return `${baseUrl}/${encodedPath}#t=1`;
              })() : ''}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-black text-[11px] font-black px-1.5 py-0.5 rounded-sm shadow-md z-20">
              {duration}
            </div>
          </div>

          <div className="flex gap-3 px-1">
            <Avatar className="w-10 h-10 flex-shrink-0 border border-border/50 shadow-sm transition-transform duration-300 group-hover:scale-95">
              <AvatarFallback className="bg-secondary text-foreground text-xs font-black uppercase border border-border">
                {(video?.videochanel?.[0] || 'V').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-bold text-sm md:text-base line-clamp-2 text-foreground leading-tight group-hover:text-red-600 transition-colors duration-300">
                {video?.videotitle || "Untitled Video"}
              </h3>

              <div className="flex flex-col opacity-90">
                 <p className="text-sm text-foreground/70 font-bold hover:text-foreground transition-all cursor-pointer flex items-center gap-1">
                  {video?.videochanel && video?.videochanel !== "undefined" ? video.videochanel : "Anonymous Creator"}
                  <span className="text-blue-600 bg-blue-600/10 p-0.5 rounded-full scale-75 border border-blue-600/20 shadow-sm">
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

      {/* Edit/Delete Actions */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-lg border border-border/50 hover:bg-primary hover:text-primary-foreground transform active:scale-90 transition-all duration-200"
              title="Edit Video"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 bg-background/90 backdrop-blur-md rounded-full shadow-lg border border-border/50 hover:bg-destructive hover:text-destructive-foreground transform active:scale-90 transition-all duration-200"
              title="Delete Video"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}