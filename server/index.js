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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("YourTube backend is working");
});

// Proxy for location to avoid CORS
app.get("/location", async (req, res) => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Location proxy error:", error);
    res.status(500).json({ region: "Unknown", city: "Unknown" });
  }
});

// Dedicated Streaming route for better video support (Range requests)
app.get("/stream/:filename", (req, res) => {
  const filePath = path.join("uploads", req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Video file not found" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Determine Content-Type based on extension
  const ext = path.extname(filePath).toLowerCase();
  let contentType = "video/mp4";
  if (ext === ".webm") contentType = "video/webm";
  if (ext === ".ogg") contentType = "video/ogg";

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.use("/user", userroutes);
app.use("/video", videoroutes);
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
