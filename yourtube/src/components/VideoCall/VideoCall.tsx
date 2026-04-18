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
  const localContainerRef = useRef<HTMLDivElement>(null);
  const remoteContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = (ref: React.RefObject<HTMLElement | null>) => {
    if (!ref || !ref.current) return;
    
    const element = ref.current;
    if (document.fullscreenElement) {
       document.exitFullscreen();
    } else {
       if (element.requestFullscreen) {
         element.requestFullscreen();
       } else if ((element as any).webkitRequestFullscreen) {
         (element as any).webkitRequestFullscreen();
       } else if ((element as any).msRequestFullscreen) {
         (element as any).msRequestFullscreen();
       }
    }
  };

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
      <div className="flex-1 relative flex flex-col md:flex-row p-2 md:p-4 gap-3 md:gap-4 overflow-hidden overflow-y-auto">
        
        {/* Remote Video / Join Prompt Container */}
        <div 
          ref={remoteContainerRef}
          onDoubleClick={() => toggleFullScreen(remoteContainerRef)}
          className="h-[45vh] md:h-full flex-1 relative bg-zinc-900/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center min-h-[250px] shrink-0"
        >
          {callAccepted && !callEnded ? (
            <>
              <video
                playsInline
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute top-4 right-4 z-30">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={(e) => { e.stopPropagation(); toggleFullScreen(remoteContainerRef); }}
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 hover:bg-black/80 text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center"
                  title="Full Screen Participant"
                >
                  <Maximize2 className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-zinc-500 scale-90 md:scale-100 p-6">
               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse shadow-inner">
                  <UserPlus className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <div className="text-center">
                 <p className="text-sm md:text-lg font-bold text-zinc-300">Start Meeting</p>
                 <p className="text-xs md:text-sm text-zinc-500 mt-1 max-w-[200px]">Create or join a room to connect with others</p>
               </div>
            </div>
          )}
          
          {callAccepted && (
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] md:text-sm font-medium">Participant</span>
            </div>
          )}
        </div>

        {/* Local Video Section */}
        <div 
          ref={localContainerRef}
          onDoubleClick={() => toggleFullScreen(localContainerRef)}
          className={`
            ${callAccepted && !callEnded ? 'absolute bottom-4 right-4 w-32 h-44 shadow-2xl z-20' : 'relative h-[30vh] min-h-[200px] w-full'} 
            md:relative md:w-80 md:h-full
            bg-zinc-900 rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 transition-all duration-500 shrink-0
          `}
        >
          {stream && (
            <video
              playsInline
              muted
              ref={myVideoRef}
              autoPlay
              className={`w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800/80 backdrop-blur-sm">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-700 flex items-center justify-center shadow-lg border border-white/5">
                  <span className="text-lg md:text-2xl font-bold text-zinc-300">{userName[0]}</span>
               </div>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
             <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
             <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-300">You</span>
          </div>
          
          <div className="absolute top-3 right-3 md:top-4 md:right-4">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={(e) => { e.stopPropagation(); toggleFullScreen(localContainerRef); }}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 text-white transition-all shadow-lg active:scale-95 flex items-center justify-center"
              title="Full Screen Your View"
            >
               <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 md:p-8 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center gap-3 md:gap-0 shrink-0">
        
        {/* Media Group - Separate card on mobile */}
        <div className="bg-white/95 backdrop-blur-3xl border border-white/20 px-4 md:px-10 py-3 md:py-4 rounded-full flex items-center justify-center gap-3 md:gap-8 shadow-2xl transition-all">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={toggleMute}
              className={`w-10 h-10 md:w-13 md:h-13 rounded-full transition-all duration-300 transform active:scale-90 shadow-sm ${!isMuted ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900' : 'text-white'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>

            <Button
              size="icon"
              variant={isVideoOff ? "destructive" : "secondary"}
              onClick={toggleVideo}
              className={`w-10 h-10 md:w-13 md:h-13 rounded-full transition-all duration-300 transform active:scale-90 shadow-sm ${!isVideoOff ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900' : 'text-white'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
            </Button>

            <Button
              size="icon"
              variant="secondary"
              onClick={toggleScreenShare}
              className={`w-10 h-10 md:w-13 md:h-13 rounded-full transition-all duration-300 transform active:scale-90 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 shadow-sm ${isScreenSharing ? 'bg-blue-600 text-white' : ''}`}
            >
              <ScreenShare className="w-5 h-5 md:w-6 md:h-6" />
            </Button>

            <Button
              size="icon"
              variant="secondary"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-10 h-10 md:w-13 md:h-13 rounded-full transition-all duration-300 transform active:scale-90 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}
            >
              <Disc className="w-5 h-5 md:w-6 md:h-6" />
            </Button>

            {/* End Call Button integrated in the same bar for desktop, but we handle the Join section separately below for mobile */}
            {connectionStatus !== 'idle' && (
              <div className="hidden md:flex ml-4 pl-4 border-l border-zinc-200">
                <Button
                  variant="destructive"
                  onClick={leaveCall}
                  className="rounded-full px-8 h-12 font-black shadow-lg shadow-red-900/20 hover:bg-red-600 transform active:scale-95 transition-all text-sm tracking-widest uppercase border-none"
                >
                  <PhoneOff className="w-5 h-5 mr-2" /> End Call
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Call Lifecycle Group (Join/End on Mobile) */}
        <div className="w-full max-w-[90vw] md:hidden">
          {connectionStatus !== 'idle' ? (
            <Button
              variant="destructive"
              onClick={leaveCall}
              className="w-full rounded-2xl h-12 font-black shadow-xl shadow-red-900/20 hover:bg-red-700 transform active:scale-95 transition-all text-sm tracking-widest uppercase"
            >
              <PhoneOff className="w-5 h-5 mr-2" /> End Call
            </Button>
          ) : (
             <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
                <Input 
                  placeholder="Join Room ID" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-zinc-100 border-none rounded-xl h-10 flex-1 text-sm focus:ring-1 focus:ring-zinc-300 placeholder:text-zinc-400 text-zinc-900"
                />
                <Button
                  onClick={() => joinRoom(roomId)}
                  disabled={!roomId}
                  className="bg-zinc-900 hover:bg-zinc-800 rounded-xl px-6 h-10 font-black text-xs uppercase tracking-widest text-white"
                >
                  Join
                </Button>
             </div>
          )}
        </div>

        {/* Laptop Join Section (Visible when idle) */}
        <div className={`hidden md:flex mt-4 ${connectionStatus !== 'idle' ? 'md:hidden' : ''}`}>
           <div className="bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2">
                <Input 
                  placeholder="Enter Room ID to start or join" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="bg-transparent border-none rounded-full h-10 w-64 text-sm focus:ring-0 placeholder:text-zinc-400 text-zinc-900 px-6"
                />
                <Button
                  onClick={() => joinRoom(roomId)}
                  disabled={!roomId}
                  className="bg-zinc-900 hover:bg-zinc-800 rounded-full px-8 h-10 font-black text-sm uppercase tracking-widest text-white shadow-lg"
                >
                  Join Meeting
                </Button>
             </div>
        </div>
      </div>
      {/* Floating Info (Connection ID) */}
      <div className="absolute top-20 md:top-24 left-4 md:left-1/2 md:-translate-x-1/2 z-50">
         <div 
           className="group bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-1.5 md:p-2 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 transition-all hover:bg-zinc-800 cursor-pointer shadow-2xl" 
           onClick={() => {
             if (me) {
               navigator.clipboard.writeText(me);
               toast.success("ID Copied");
             }
           }}
         >
            <div className="px-2 md:px-3 py-1 bg-zinc-800 rounded-lg md:rounded-xl text-[10px] md:text-xs font-mono text-zinc-400">
               {me ? `${me.substring(0, 6)}...` : "..."}
            </div>
            <div className="p-1.5 md:p-2 bg-red-600/10 text-red-500 rounded-lg md:rounded-xl">
               <Copy className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            
            <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-3 scale-0 group-hover:scale-100 transition-all origin-top">
               <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-56 md:w-64 text-center">
                  <p className="text-[10px] text-zinc-400 mb-1 tracking-wider font-bold">YOUR CONNECTION ID</p>
                  <p className="text-xs font-mono break-all bg-black/40 p-2 rounded-lg text-red-400 border border-red-500/20">{me || "..."}</p>
               </div>
            </div>
         </div>
      </div>
      </div>
    </div>
  );
};

export default VideoCallComponent;
