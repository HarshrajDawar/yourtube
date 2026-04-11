import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";
import EditVideoModal from "./EditVideoModal";
import { useRouter } from "next/router";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  const isOwner = user?._id === video?.uploader;

  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          await axiosInstance.post(`/history/views/${video?._id}`);
        } catch (error) {
          console.log(error);
        }
      }
    };

    // Delay view counting by 30 seconds to avoid inflation
    const viewTimeout = setTimeout(() => {
      handleviews();
    }, 30000);

    return () => clearTimeout(viewTimeout);
  }, [video._id, user?._id]);

  useEffect(() => {
    const fetchChannelData = async () => {
      if (!video?.uploader) return;
      try {
        const res = await axiosInstance.get(`/user/channel/${video.uploader}`);
        setSubscriberCount(res.data.subscribers);
        
        // Use user data to check if subscribed
        if (user) {
          const resSub = await axiosInstance.get(`/user/channel/${video.uploader}`);
          // Note: In real app, you'd check user.subscribedTo array or specific sub status
          // For now, we'll implement a toggle on click
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };
    fetchChannelData();
  }, [video?.uploader]);

  // Sync isSubscribed if user changes or video uploader changes
  useEffect(() => {
    if (user && video?.uploader) {
      // Logic to check if user follows uploader
      // The user object contains subscribedTo array (from Auth context logic / backend update)
      setIsSubscribed(user?.subscribedTo?.includes(video.uploader));
    }
  }, [user, video?.uploader]);
  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDownload = async () => {
    if (!user) return toast.error("Please login to download");
    try {
      const res = await axiosInstance.post("/premium/download", {
        userid: user._id,
        videoid: video._id
      });
      if (res.data.success) {
        toast.success("Download started on website!");
        // Simulate file download
        const link = document.createElement("a");
        link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://yourtube-zg73.onrender.com'}/${video.filepath}`;
        link.download = video.videotitle + ".mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Download failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) return;
    
    try {
      await axiosInstance.delete(`/video/${video._id}`, {
        data: { userId: user?._id }
      });
      toast.success("Video deleted successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };

  const handleSubscribe = async () => {
    if (!user) return toast.error("Please login to subscribe");
    if (isOwner) return toast.error("You cannot subscribe to yourself");

    try {
      const res = await axiosInstance.post("/user/subscribe", {
        channelId: video.uploader,
        userId: user._id
      });
      if (res.data.success) {
        setIsSubscribed(res.data.isSubscribed);
        setSubscriberCount(res.data.subscribers);
        
        // Update global user state with new subscribedTo list
        const updatedSubscribedTo = res.data.isSubscribed 
          ? [...(user.subscribedTo || []), video.uploader]
          : (user.subscribedTo || []).filter((id: string) => id !== video.uploader);
        
        const updatedUser = { ...user, subscribedTo: updatedSubscribedTo };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(res.data.isSubscribed ? "Subscribed!" : "Unsubscribed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">
        {video.videotitle || "Untitled Video"}
      </h1>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 py-2">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <Avatar className="w-12 h-12 border-2 border-border shadow-sm group-hover:border-primary transition-all duration-300">
              <AvatarFallback className="bg-secondary text-foreground text-lg font-black uppercase border border-border">
              {(video.videochanel || video.uploader || "A")[0].toUpperCase()}
            </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 border-2 border-background rounded-full" title="Online" />
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-foreground hover:opacity-80 transition-opacity">
              {video.videochanel || "Anonymous Creator"}
              {(video.isVerified || true) && (
                <span className="text-blue-500 bg-blue-500/10 p-0.5 rounded-full" title="Verified Creator">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </span>
              )}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              {(subscriberCount || 0).toLocaleString()} subscribers
            </p>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSubscribe}
            className={`rounded-full px-6 font-bold transition-all ml-2 ${
              isSubscribed 
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                : "bg-foreground text-background hover:bg-foreground/90"
            }`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 xl:pb-0 scrollbar-hide">
          <div className="flex items-center bg-muted/60 hover:bg-muted transition-colors rounded-full border border-border p-0.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full hover:bg-white/10 px-4 transition-colors"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
              <span className="text-foreground font-bold">{likes.toLocaleString()}</span>
            </Button>
            <div className="w-[1px] h-6 bg-border/80" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full hover:bg-white/10 px-4 transition-colors"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 ${
                  isDisliked ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className={`rounded-full px-4 font-semibold transition-all border border-border flex shrink-0 ${
              isWatchLater ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 hover:bg-muted text-foreground"
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isWatchLater ? "Saved" : "Save"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-4 font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground flex shrink-0"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-4 font-semibold border border-border bg-muted/40 hover:bg-muted text-foreground flex shrink-0"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-9 w-9 shrink-0 border border-border bg-muted/40 hover:bg-muted text-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-muted shadow-sm rounded-2xl p-5 transition-all hover:bg-muted/80 border border-border/50">
        <div className="flex gap-4 text-sm font-black mb-3 text-foreground tracking-wide">
          <span>{(video.views || 0).toLocaleString()} views</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-foreground/80">
            {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : "just now"}
          </span>
        </div>
        
        <div className={`text-sm leading-relaxed ${showFullDescription ? "" : "line-clamp-3"} text-foreground/90`}>
          <p className="whitespace-pre-wrap font-medium">
            {video.videodescription || "Explore more in this video! No detailed description provided by the creator yet."}
          </p>
          {video.tags && video.tags.length > 0 && (
             <div className="mt-4 flex flex-wrap gap-2">
                {video.tags.map((tag: string) => (
                  <span key={tag} className="text-primary hover:underline cursor-pointer font-bold">#{tag}</span>
                ))}
             </div>
          )}
        </div>

        <Button
          variant="link"
          size="sm"
          className="mt-3 p-0 h-auto font-black text-foreground hover:text-primary transition-all duration-200 uppercase tracking-tighter"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "...more"}
        </Button>
      </div>

      <EditVideoModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        video={video}
        userId={user?._id}
        onUpdate={(updatedData) => {
          // Update local state if necessary or trigger a page refresh
          // For now, refreshing is simplest to ensure all data is synced
          router.replace(router.asPath);
        }}
      />
    </div>
  );
};

export default VideoInfo;
