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

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mp4")) {
      res.setHeader("Content-Type", "video/mp4");
    }
  }
}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("YourTube backend is working");
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/premium", premiumroutes);

io.on("connection", (socket) => {
  console.log("New Socket Connection:", socket.id);
  socket.emit("me", socket.id);

  socket.on("join-room", (roomId, userId) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.roomId = roomId; // Store for disconnect handling
    socket.userId = userId || socket.id;
    
    console.log(`User ${socket.userId} (Socket: ${socket.id}) joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit("user-connected", socket.userId);
    socket.to(roomId).emit("user-joined", { id: socket.id }); // Legacy support
  });

  socket.on("signal", (data) => {
    // data contains: roomId, signal, to, from
    console.log(`Signal from ${data.from || socket.id} to ${data.to || 'room ' + data.roomId}`);
    if (data.to) {
      io.to(data.to).emit("signal", {
        signal: data.signal,
        from: data.from || socket.id
      });
    } else if (data.roomId) {
      socket.to(data.roomId).emit("signal", {
        signal: data.signal,
        from: socket.id
      });
    }
  });

  socket.on("ice-candidate", (data) => {
    console.log("Relaying ICE candidate");
    socket.to(data.roomId).emit("ice-candidate", data.candidate);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.roomId) {
      socket.to(socket.roomId).emit("user-disconnected", socket.userId || socket.id);
    }
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
