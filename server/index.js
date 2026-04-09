import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import premiumroutes from "./routes/premium.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://your-frontend.vercel.app",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "https://your-frontend.vercel.app"
}));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("YourTube backend is working");
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/api/videos", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/premium", premiumroutes);

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit("user-joined", { id: socket.id });
  });

  socket.on("signal", (data) => {
    // data contains: roomId, signal, to, from
    if (data.to) {
      io.to(data.to).emit("signal", {
        signal: data.signal,
        from: data.from
      });
    } else {
      socket.to(data.roomId).emit("signal", {
        signal: data.signal,
        from: socket.id
      });
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("endCall", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("callEnded");
    } else if (data.to) {
      io.to(data.to).emit("callEnded");
    }
  });
});

const PORT = process.env.PORT || 5000;
const DBURL = process.env.DB_URL;

mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("DB connection error:", error);
  });
