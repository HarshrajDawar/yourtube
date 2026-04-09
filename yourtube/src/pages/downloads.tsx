import React, { useEffect, useState } from "react";
import Videogrid from "@/components/Videogrid";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const DownloadsPage = () => {
  const { user } = useUser();
  const [downloadedVideos, setDownloadedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axiosInstance.get(`/premium/user-downloads/${user._id}`)
        .then(res => {
          setDownloadedVideos(res.data.videos);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div className="p-8">Loading downloads...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Downloads</h1>
      {downloadedVideos.length > 0 ? (
        <Videogrid vids={downloadedVideos} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No videos downloaded yet.
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
