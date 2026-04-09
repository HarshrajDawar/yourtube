import express from "express";
import { getallvideo, uploadvideo, updateVideoView as updateVideoDetails, deleteVideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/", getallvideo);
routes.patch("/:id", updateVideoDetails);
routes.delete("/:id", deleteVideo);
export default routes;
