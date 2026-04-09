import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = ({ vids }: { vids?: any[] }) => {
  const [videos, setvideo] = useState<any[]>(vids || []);
  const [loading, setloading] = useState(!vids);
  
  useEffect(() => {
    if (vids) {
      setvideo(vids);
      setloading(false);
      return;
    }
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/api/videos");
        setvideo(res.data || []);
      } catch (error) {
        console.log(error);
        setvideo([]);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, [vids]);

  return (
    <div className="w-full max-w-full px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {loading ? (
        <div className="col-span-full py-10 text-center text-muted-foreground animate-pulse">Loading videos...</div>
      ) : (
        videos?.map((video: any) => <Videocard key={video?._id || Math.random()} video={video} />)
      )}
      {!loading && videos.length === 0 && (
        <div className="col-span-full py-10 text-center text-muted-foreground">No videos found.</div>
      )}
    </div>
  );
};

export default Videogrid;
