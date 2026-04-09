import express from "express";
import { login, updateprofile, verifyOTP, subscribeChannel, getChannelData } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateprofile);
routes.post("/verify-otp", verifyOTP);
routes.post("/subscribe", subscribeChannel);
routes.get("/channel/:id", getChannelData);
export default routes;
