import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any;
  onUpdate: (updatedVideo: any) => void;
  userId: string;
}

const EditVideoModal = ({ isOpen, onClose, video, onUpdate, userId }: EditVideoModalProps) => {
  const [formData, setFormData] = useState({
    videotitle: "",
    videodescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData({
        videotitle: video.videotitle || "",
        videodescription: video.videodescription || "",
      });
    }
  }, [video, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videotitle.trim()) return toast.error("Title is required");

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.patch(`/video/${video._id}`, {
        ...formData,
        userId
      });
      toast.success("Video updated successfully");
      onUpdate(response.data);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update video");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Video Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="videotitle">Video Title</Label>
            <Input
              id="videotitle"
              name="videotitle"
              value={formData.videotitle}
              onChange={handleChange}
              placeholder="Enter video title"
              className="bg-muted/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videodescription">Description</Label>
            <Textarea
              id="videodescription"
              name="videodescription"
              value={formData.videodescription}
              onChange={handleChange}
              rows={6}
              placeholder="Tell viewers about your video..."
              className="bg-muted/50 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoModal;
