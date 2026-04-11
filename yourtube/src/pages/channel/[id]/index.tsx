import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";

import axiosInstance from "@/lib/axiosinstance";
import { useState, useEffect } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [videos, setVideos] = useState<any[]>([]);
  const [downloadedVideos, setDownloadedVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        // Filter videos by this channel (using uploader name for simplicity as per existing schema)
        const channelVideos = res.data.filter((v: any) => v.videochanel === user?.channelname || v.uploader === user?.name);
        setVideos(channelVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDownloads = async () => {
      try {
        const res = await axiosInstance.get(`/premium/user-downloads/${user._id}`);
        setDownloadedVideos(res.data.videos);
      } catch (error) {
        console.error("Error fetching downloads:", error);
      }
    };

    if (user) {
      fetchVideos();
      fetchDownloads();
    }
  }, [user, id]);

  const channel = user;

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChannelHeader channel={channel} user={user} />
        <Channeltabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-8">
          {activeTab === "videos" && (
            <>
              <div className="mb-12">
                <h2 className="text-xl font-bold mb-6">Upload New Video</h2>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-secondary/10">
                  <VideoUploader channelId={id} channelName={channel?.channelname} />
                </div>
              </div>
              
              <div className="pb-12">
                <h2 className="text-xl font-bold mb-6">Channel Content</h2>
                {loading ? (
                  <div className="py-20 text-center text-muted-foreground animate-pulse">Loading channel content...</div>
                ) : videos.length > 0 ? (
                  <ChannelVideos videos={videos} />
                ) : (
                  <div className="text-center py-20 border rounded-2xl bg-secondary/5 text-muted-foreground">
                    <p className="text-lg font-medium">No videos uploaded yet</p>
                    <p className="text-sm">Start your journey by uploading your first video!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "downloads" && (
            <div className="pb-12">
              <h2 className="text-xl font-bold mb-6">Your Downloads</h2>
              {downloadedVideos.length > 0 ? (
                <ChannelVideos videos={downloadedVideos} />
              ) : (
                <div className="text-center py-20 border rounded-2xl bg-secondary/5 text-muted-foreground">
                  <p className="text-lg font-medium">No videos downloaded yet</p>
                  <p className="text-sm">Search and download videos to watch them here later!</p>
                </div>
              )}
            </div>
          )}

          {(activeTab !== "videos" && activeTab !== "downloads") && (
            <div className="py-20 text-center text-muted-foreground border rounded-2xl bg-secondary/5">
              This section is coming soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default index;
