import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

// Peer and RecordRTC will be loaded dynamically on client side
let Peer: any = null;
let RecordRTC: any = null;
if (typeof window !== "undefined") {
  // Polyfills for simple-peer compatibility in Next.js
  const { Buffer } = require("buffer");
  window.Buffer = Buffer;
  
  if (!window.process) {
    (window as any).process = { 
      nextTick: (fn: Function) => setTimeout(fn, 0),
      browser: true,
      env: {}
    };
  } else if (!window.process.nextTick) {
    (window.process as any).nextTick = (fn: Function) => setTimeout(fn, 0);
  }

  const SimplePeer = require("simple-peer");
  Peer = SimplePeer.default || SimplePeer;
  RecordRTC = require("recordrtc");
}

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useWebRTC = (userName: string) => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [currentRoom, setCurrentRoom] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const connectionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        localStreamRef.current = currentStream;
      })
      .catch(err => {
        console.error("Media access error:", err);
        toast.error("Please allow camera and mic permissions");
      });

    socketRef.current.on("me", (id: string) => setMe(id));

    socketRef.current.on("user-joined", ({ id }) => {
      console.log("User joined:", id);
      setConnectionStatus("connecting");
      callUser(id);
    });

    socketRef.current.on("signal", (data) => {
      if (connectionRef.current) {
        connectionRef.current.signal(data.signal);
      } else {
        // This person was called by the new joiner? No, usually the joiner waits.
        // But if we get a signal and have no peer, we are the 'answerer'
        answerCall(data.from, data.signal);
      }
    });

    socketRef.current.on("callEnded", () => {
      setCallEnded(true);
      setConnectionStatus("idle");
      if (connectionRef.current) connectionRef.current.destroy();
      connectionRef.current = null;
      setRemoteStream(null);
    });

    return () => {
      socketRef.current?.disconnect();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (!roomId) return;
    setCurrentRoom(roomId);
    socketRef.current?.emit("join-room", roomId);
    setConnectionStatus("connecting");
    toast.info(`Joined room: ${roomId}`);
  }, []);

  const callUser = (id: string) => {
    if (!localStreamRef.current || !Peer) return;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: localStreamRef.current,
    });

    peer.on("signal", (data: any) => {
      socketRef.current?.emit("signal", {
        roomId: currentRoom,
        to: id,
        from: me,
        signal: data,
      });
    });

    peer.on("stream", (remote: MediaStream) => {
      setRemoteStream(remote);
      setCallAccepted(true);
      setConnectionStatus("connected");
    });

    connectionRef.current = peer;
  };

  const answerCall = (from: string, incomingSignal: any) => {
    if (!localStreamRef.current || !Peer) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: localStreamRef.current,
    });

    peer.on("signal", (data: any) => {
      socketRef.current?.emit("signal", {
        to: from,
        from: me,
        signal: data,
      });
    });

    peer.on("stream", (remote: MediaStream) => {
      setRemoteStream(remote);
      setCallAccepted(true);
      setConnectionStatus("connected");
    });

    peer.signal(incomingSignal);
    connectionRef.current = peer;
  };

  const leaveCall = useCallback(() => {
    setCallEnded(true);
    setConnectionStatus("idle");
    if (connectionRef.current) connectionRef.current.destroy();
    socketRef.current?.emit("endCall", { roomId: currentRoom });
    window.location.reload();
  }, [currentRoom]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
        screenStreamRef.current = screenStream;
        
        if (connectionRef.current) {
          const videoTrack = localStreamRef.current?.getVideoTracks()[0];
          const screenTrack = screenStream.getVideoTracks()[0];
          
          if (videoTrack && screenTrack) {
            connectionRef.current.replaceTrack(videoTrack, screenTrack, localStreamRef.current!);
          }
        }
        
        setStream(screenStream);
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }, [isScreenSharing]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((newStream) => {
        if (connectionRef.current && localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const newVideoTrack = newStream.getVideoTracks()[0];
          if (videoTrack && newVideoTrack) {
            connectionRef.current.replaceTrack(videoTrack, newVideoTrack, localStreamRef.current);
          }
        }
        localStreamRef.current = newStream;
        setStream(newStream);
        setIsScreenSharing(false);
      });
  }, []);

  const startRecording = useCallback(async () => {
    if (!stream || !RecordRTC) return;
    const streamsToRecord = remoteStream ? [stream, remoteStream] : [stream];
    try {
      const recorder = new RecordRTC(streamsToRecord, {
        type: "video",
        mimeType: "video/webm",
      });
      recorder.startRecording();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.info("Recording started");
    } catch (err) {
      console.error("Recording error:", err);
    }
  }, [stream, remoteStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stopRecording(() => {
        const blob = mediaRecorderRef.current.getBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        setIsRecording(false);
        toast.success("Recording saved!");
      });
    }
  }, [isRecording]);

  return {
    me,
    stream,
    remoteStream,
    callAccepted,
    callEnded,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    connectionStatus,
    joinRoom,
    leaveCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    startRecording,
    stopRecording,
  };
};
