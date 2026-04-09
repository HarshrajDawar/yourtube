import React from "react";
import Videogrid from "@/components/Videogrid";

const ExplorePage = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2 pb-4 border-b">
        {["Trending", "Music", "Gaming", "Movies"].map((tab) => (
          <button key={tab} className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80">
            {tab}
          </button>
        ))}
      </div>
      <h2 className="text-xl font-bold px-2">Explore the best of YourTube</h2>
      <Videogrid />
    </div>
  );
};

export default ExplorePage;
