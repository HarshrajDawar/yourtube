import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // shadcn dialog
import { useUser } from "@/lib/AuthContext";

const HeaderUploader = ({ channelId: propId, channelName: propName }: any) => {
  const { user } = useUser();
  const channelId = propId || user?._id;
  const channelName = propName || user?.channelname || user?.name || "Unknown Creator";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [open, setOpen] = useState(false); // Modal state
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
      if (!videoTitle) {
        setVideoTitle(file.name);
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

    try {
      setIsUploading(true);
      setUploadProgress(0);
      await axiosInstance.post("/video/upload", formdata, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      toast.success("Upload successfully");
      setUploadComplete(true);
      setTimeout(() => {
        setOpen(false); 
        resetForm();
      }, 1500);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isUploading && setOpen(val)}>
      <DialogTrigger asChild>
        {/* यह बटन हेडर में दिखेगा */}
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary hover:scale-105 transition-all h-9 w-9 sm:h-10 sm:w-10">
          <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload a video</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4 overflow-y-auto max-h-[80vh] px-1">
          {!videoFile ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium">Click to select or drag and drop</p>
              <p className="text-xs text-gray-400 mt-2">MP4, WebM up to 100MB</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handlefilechange}
              />
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl border border-border/50">
                <FileVideo className="w-6 h-6 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{videoFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && !uploadComplete && (
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                {uploadComplete && <Check className="w-5 h-5 text-green-600" />}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isUploading || uploadComplete}
                  className="bg-muted/30 border-border/50 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <textarea
                  id="description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  disabled={isUploading || uploadComplete}
                  className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none relative z-10"
                  placeholder="Enter video description"
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}

              <div className="flex justify-end gap-2">
                {!uploadComplete && (
                  <>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading || !videoTitle.trim()}>
                      {isUploading ? "Uploading..." : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderUploader;