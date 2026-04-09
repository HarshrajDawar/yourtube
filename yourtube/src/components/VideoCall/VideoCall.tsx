import React, { useRef, useEffect, useState } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Disc, 
  Copy, 
  Check,
  UserPlus,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";

const VideoCallComponent = () => {
  const { user } = useUser();
  const userName = user?.name || "Anonymous";
  const {
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
  } = useWebRTC(userName);

  const [roomId, setRoomId] = useState("");
  
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (callAccepted && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted, callEnded]);

  return (
    <div 
      className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-inter select-none video-call-container"
      style={{ "--foreground": "#fafafa" } as React.CSSProperties}
    >
      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-outfit tracking-tight">YourTube Meet</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-600'}`} />
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                   {connectionStatus}
                </span>
             </div>
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-[10px] font-mono opacity-40 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => { navigator.clipboard.writeText(me); toast.success("ID Copied"); }}>
               {me ? `ID: ${me.substring(0, 8)}...` : "Connecting..."}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
             {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-700 font-bold">{userName[0]}</div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        
        {/* Remote Video (Main) */}
        <div className="flex-1 relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center">
          {callAccepted && !callEnded ? (
            <video
              playsInline
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-500">
               <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
                  <UserPlus className="w-10 h-10" />
               </div>
               <p className="text-lg font-medium">
                  {connectionStatus === 'connecting' ? 'Connecting to peer...' : 'Create or join a room to start'}
               </p>
            </div>
          )}
          
          {callAccepted && (
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 outline-none">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Remote Participant</span>
            </div>
          )}
        </div>

        {/* Local Video (Floating/Sidebar) */}
        <div className="md:w-80 relative bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/5 h-60 md:h-auto min-h-[200px]">
          {stream && (
            <video
              playsInline
              muted
              ref={myVideoRef}
              autoPlay
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
          )}
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
               <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
                  <span className="text-2xl font-bold">{userName[0]}</span>
               </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 outline-none">
             <span className="text-xs font-medium">You</span>
          </div>
          
          <div className="absolute top-4 right-4 group">
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 outline-none">
               <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent flex justify-center items-center">
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-4 md:gap-6 shadow-2xl">
          <Button
            size="icon"
            variant={isMuted ? "destructive" : "secondary"}
            onClick={toggleMute}
            className="w-12 h-12 rounded-full transition-all transform active:scale-90 outline-none"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant={isVideoOff ? "destructive" : "secondary"}
            onClick={toggleVideo}
            className="w-12 h-12 rounded-full transition-all transform active:scale-90 outline-none"
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            size="icon"
            variant={isScreenSharing ? "default" : "secondary"}
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full transition-all transform active:scale-90 outline-none ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            <ScreenShare className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant={isRecording ? "destructive" : "secondary"}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-full transition-all transform active:scale-90 outline-none ${isRecording ? 'animate-pulse ring-2 ring-red-500 ring-offset-2 ring-offset-zinc-900' : ''}`}
          >
            <Disc className="w-5 h-5" />
          </Button>

          <div className="w-[1px] h-8 bg-white/10 mx-2" />

          {connectionStatus !== 'idle' ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={leaveCall}
              className="rounded-full px-8 h-12 font-bold shadow-lg shadow-red-900/20 transform active:scale-95 outline-none"
            >
              <PhoneOff className="w-5 h-5 mr-2" /> End
            </Button>
          ) : (
             <div className="flex gap-2">
                <Input 
                  placeholder="Enter Room ID" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-zinc-800 border-white/5 rounded-2xl h-12 w-48 text-sm focus:ring-red-500"
                />
                <Button
                  onClick={() => joinRoom(roomId)}
                  disabled={!roomId}
                  className="bg-red-600 hover:bg-red-700 rounded-full px-6 h-12 font-bold transition-all transform active:scale-95 outline-none"
                >
                  <Phone className="w-5 h-5 mr-2" /> Start / Join
                </Button>
             </div>
          )}
        </div>
      </div>
      {/* Floating Info */}
      <div className="absolute bottom-10 right-10 z-50">
         <div 
           className="group bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-3 transition-all hover:bg-zinc-800 cursor-pointer shadow-xl outline-none" 
           onClick={() => {
             if (me) {
               navigator.clipboard.writeText(me);
               toast.success("ID Copied to clipboard");
             }
           }}
         >
            <div className="px-3 py-1 bg-zinc-800 rounded-xl text-xs font-mono text-zinc-400">
               {me ? `${me.substring(0, 8)}...` : "Loading..."}
            </div>
            <div className="p-2 bg-red-600/10 text-red-500 rounded-xl">
               <Copy className="w-4 h-4" />
            </div>
            
            <div className="absolute bottom-full right-0 mb-4 scale-0 group-hover:scale-100 transition-all origin-bottom-right">
               <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
                  <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest font-bold">Your Connection ID</p>
                  <p className="text-sm font-mono break-all bg-black/40 p-2 rounded-lg text-red-400 border border-red-500/20">{me || "Initializing..."}</p>
                  <p className="text-[10px] text-zinc-500 mt-2">Share this ID with the friend you want to meet, or use a Room ID below.</p>
               </div>
            </div>
         </div>
      </div>
      </div>
    </div>
  );
};

export default VideoCallComponent;
