import express from "express";
import { createOrder, verifyPayment, verifyDemoPayment, handleDownload, getUserDownloads, getUpgradeCost } from "../controllers/premium.js";

const routes = express.Router();
routes.post("/create-order", createOrder);
routes.post("/verify-payment", verifyPayment);
routes.post("/verify-demo-payment", verifyDemoPayment);
routes.post("/upgrade-cost", getUpgradeCost);
routes.post("/download", handleDownload);
routes.get("/user-downloads/:userid", getUserDownloads);

export default routes;
