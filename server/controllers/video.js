import video from "../Modals/video.js";
import fs from "fs";
import path from "path";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const description = req.body.videodescription || "";
      const title = req.body.videotitle || "";

      const file = new video({
        videotitle: title,
        videodescription: description,
        filename: req.file.originalname,
        filepath: req.file.path,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      console.log("Saving video with filepath:", file.filepath);
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const getallvideo = async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search) {
      query = {
        $or: [
          { videotitle: { $regex: search, $options: "i" } },
          { videochanel: { $regex: search, $options: "i" } },
          { videodescription: { $regex: search, $options: "i" } }
        ]
      };
    }
    const files = await video.find(query).sort({ createdAt: -1 });
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateVideoView = async (req, res) => {
  const { id } = req.params;
  const { videotitle, videodescription, userId } = req.body;
  try {
    const v = await video.findById(id);
    if (!v) return res.status(404).json({ message: "Video not found" });
    
    // Authorization: Only the video owner can edit
    if (v.uploader !== userId) {
      return res.status(401).json({ message: "Unauthorized: You are not the owner of this video" });
    }

    const updatedVideo = await video.findByIdAndUpdate(
      id,
      { $set: { videotitle, videodescription } },
      { new: true }
    );
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const v = await video.findById(id);
    if (!v) return res.status(404).json({ message: "Video not found" });

    // Authorization: Only the video owner can delete
    if (v.uploader !== userId) {
      return res.status(401).json({ message: "Unauthorized: You are not the owner of this video" });
    }

    // Remove video file from local storage
    if (v.filepath) {
      const fullPath = path.resolve(v.filepath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await video.findByIdAndDelete(id);
    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
