import VideoCard from "./videocard";
import { Edit2, Trash2 } from "lucide-react";
import { useUser } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import EditVideoModal from "./EditVideoModal";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import { useRouter } from "next/router";
export default function ChannelVideos({ videos: initialVideos }: any) {
  const { user } = useUser();
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos || []);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  useEffect(() => {
    setVideos(initialVideos || []);
  }, [initialVideos]);

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos uploaded yet.</p>
      </div>
    );
  }

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/video/${videoId}`, {
        data: { userId: user?._id }
      });
      toast.success("Video deleted successfully");
      setVideos((prev: any) => prev.filter((v: any) => v._id !== videoId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video: any) => {
          const isOwner = user?._id === video.uploader;
          return (
            <div key={video._id} className="flex flex-col gap-2 relative group">
              <VideoCard 
                video={video} 
                onEdit={isOwner ? () => setEditingVideo(video) : undefined}
                onDelete={isOwner ? () => handleDelete(video._id) : undefined}
              />
            </div>
          );
        })}
      </div>

      {editingVideo && (
        <EditVideoModal
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          video={editingVideo}
          userId={user?._id}
          onUpdate={(updatedV) => {
            setVideos((prev: any) =>
              prev.map((v: any) => (v._id === updatedV._id ? updatedV : v))
            );
          }}
        />
      )}
    </div>
  );
}
