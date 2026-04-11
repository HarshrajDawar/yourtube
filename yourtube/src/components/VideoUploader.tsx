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
    resetForm();
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
    <div className="bg-muted/20 rounded-xl p-4 sm:p-8 border border-border/50 w-full max-w-full overflow-hidden mb-8">
      <h2 className="text-xl font-bold mb-6 text-foreground">Upload a video</h2>

      <div className="space-y-4">
        {!videoFile ? (
          <div
            className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl p-6 sm:p-12 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all duration-300 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-lg font-bold text-foreground">
              Drag and drop video files to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground mt-4 font-medium">
              MP4, WebM, MOV or AVI • Up to 100MB
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handlefilechange}
            />
          </div>
        ) : (
           <div className="grid gap-6">
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-foreground">{videoFile.name}</p>
                <p className="text-sm text-muted-foreground font-medium">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={cancelUpload} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-5 h-5" />
                </Button>
              )}
              {uploadComplete && (
                <div className="bg-green-500/10 p-1.5 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}
            </div>

            <div className="grid gap-5 py-4 overflow-y-auto max-h-[70vh] sm:max-h-[80vh] px-1 pb-10 sm:pb-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-sm font-bold text-foreground">Title (required)</Label>
                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Add a title that describes your video"
                  disabled={isUploading || uploadComplete}
                  className="mt-1 bg-background border-border/50"
                />
              </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description" className="text-sm font-bold text-foreground">Description</Label>
                  <textarea
                    id="description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Enter video description"
                    disabled={isUploading || uploadComplete}
                    className="w-full h-24 sm:h-32 mt-1 p-3 rounded-md border border-border/50 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none relative z-10 font-medium"
                  />
                </div>
           </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50 bg-background/80 backdrop-blur-sm sticky bottom-0 z-20 pb-2">
              {!uploadComplete && (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={cancelUpload} 
                    disabled={uploadComplete || isUploading}
                    className="font-bold hover:bg-secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      isUploading || !videoTitle.trim() || uploadComplete
                    }
                    className="px-8 font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity rounded-full shadow-lg"
                  >
                    {isUploading ? "Uploading..." : "Save Now"}
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
