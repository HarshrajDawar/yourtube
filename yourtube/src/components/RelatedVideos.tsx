import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel?: string;
    filepath: string;
    views: number;
    createdAt: string;
  }>;
}

const DurationLabel = ({ filepath }: { filepath: string }) => {
  const [duration, setDuration] = React.useState("0:00");

  React.useEffect(() => {
    if (!filepath) return;
    const videoEl = document.createElement("video");
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const normalizedPath = filepath.replace(/\\/g, '/').replace(/^\//, '');
    videoEl.src = encodeURI(`${baseUrl}/${normalizedPath}`).replace(/%5C/g, '/');
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
  }, [filepath]);

  return (
    <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm text-black text-[10px] font-black px-1 py-0.5 rounded-sm shadow-md z-20">
      {duration}
    </div>
  );
};

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="flex gap-2 group"
        >
          <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <video
              src={video?.filepath ? encodeURI(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath.replace(/\\/g, '/').replace(/^\//, '')}`).replace(/%5C/g, '/') + "#t=1" : ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
              muted
              playsInline
              preload="metadata"
            />
            <DurationLabel filepath={video.filepath} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 leading-tight transition-colors">
              {video.videotitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{video.videochanel || "Unknown Creator"}</p>
            <p className="text-[11px] text-gray-500 font-bold tabular-nums">
              {video.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
