import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

const VideoUploader = ({ channelId: propId, channelName: propName }: any) => {
  const { user } = useUser();
  const channelId = propId || user?._id;
  const channelName = propName || user?.channelname || user?.name || "Unknown Creator";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit.");
        return;
      }
      setVideoFile(file);
      const filename = file.name;
      if (!videoTitle) {
        setVideoTitle(filename);
      }
    }
  };
  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setVideoDescription("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const cancelUpload = () => {
    if (isUploading) {
      toast.error("Your video upload has been cancelled");
    }
  };
  const handleUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide file and title");
      return;
    }
    const formdata = new FormData();
    formdata.append("file", videoFile);
    formdata.append("videotitle", videoTitle);
    formdata.append("videodescription", videoDescription);
    formdata.append("videochanel", channelName);
    formdata.append("uploader", channelId);
    console.log(formdata)
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const res = await axiosInstance.post("/video/upload", formdata, {
         headers: {
    "Content-Type": "multipart/form-data", // ✅ MUST for FormData
  },
        onUploadProgress: (progresEvent: any) => {
          const progress = Math.round(
            (progresEvent.loaded * 100) / progresEvent.total
          );
          setUploadProgress(progress);
        },
      });
      toast.success("Upload successfully");
      resetForm();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("There was an error uploading your video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="bg-muted/30 border border-border/50 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">Upload New Video</h2>

      <div className="grid gap-6">
        {!videoFile ? (
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center cursor-pointer hover:bg-muted/50 transition-all group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-base font-semibold">Click to select or drag and drop</p>
            <p className="text-sm text-muted-foreground mt-2">MP4, WebM up to 100MB</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handlefilechange}
            />
          </div>
        ) : (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{videoFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && !uploadComplete && (
                <Button variant="ghost" size="icon" onClick={resetForm} className="hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              )}
              {uploadComplete && <Check className="w-5 h-5 text-green-600" />}
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Title</Label>
                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isUploading || uploadComplete}
                  className="bg-background/50 border-border/50 focus:ring-primary/20 h-11"
                  placeholder="Give your video a catchy title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</Label>
                <textarea
                  id="description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  disabled={isUploading || uploadComplete}
                  className="w-full h-32 p-3 rounded-xl border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  placeholder="Tell viewers about your video"
                />
              </div>
            </div>

            {isUploading && (
              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Uploading Content...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              {!uploadComplete && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={resetForm} 
                    disabled={isUploading}
                    className="hover:bg-muted font-semibold"
                  >
                    Discard
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading || !videoTitle.trim()}
                    className="px-8 font-bold"
                  >
                    {isUploading ? "Processing..." : "Publish Video"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
