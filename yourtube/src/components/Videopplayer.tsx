"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";
import { Crown, Play, Pause, FastForward, Rewind, MessageSquare, X, SkipForward, Volume2, VolumeX, Maximize, Clock, MoreVertical, SkipBack } from "lucide-react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useUser();
  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const limitRef = useRef(5);
  const [overlayAction, setOverlayAction] = useState<{ icon: string; side?: 'left' | 'right' | 'center' } | null>(null);
  const overlayTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Custom Controls State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRemaining, setShowRemaining] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Task-3: Watch time limit logic
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      const currentTimeInMins = videoElement.currentTime / 60;
      
      let limit = 5; // Default for Free
      if (user?.plan === "Bronze") limit = 7;
      else if (user?.plan === "Silver") limit = 10;
      else if (user?.plan === "Gold") limit = Infinity;

      limitRef.current = limit;

      if (currentTimeInMins >= limit) {
        videoElement.pause();
        videoElement.currentTime = limit * 60 - 0.1; // Snap back
        setShowLimitModal(true);
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    return () => videoElement.removeEventListener("timeupdate", handleTimeUpdate);
  }, [user?.plan, video?._id]);

  // Persistent Volume Logic
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Load saved volume
    const savedVolume = localStorage.getItem("videoPlayerVolume");
    if (savedVolume !== null) {
      videoElement.volume = parseFloat(savedVolume);
    }

    const handleVolumeChange = () => {
      if (videoElement) {
        setVolume(videoElement.volume);
        setIsMuted(videoElement.muted);
        localStorage.setItem("videoPlayerVolume", videoElement.volume.toString());
      }
    };

    videoElement.addEventListener("volumechange", handleVolumeChange);
    return () => videoElement.removeEventListener("volumechange", handleVolumeChange);
  }, [video?._id]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (showLimitModal) return; // Disable gestures when modal is shown
    const now = Date.now();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : (e as React.TouchEvent).touches[0].clientX) - rect.left;
    const width = rect.width;
    
    if (now - lastTapTime < 300) {
      setTapCount((prev) => prev + 1);
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);

    if (tapTimeout.current) clearTimeout(tapTimeout.current);

    tapTimeout.current = setTimeout(() => {
      processGestures(tapCount + 1, x, width);
      setTapCount(0);
    }, 400);
  };

  const triggerOverlay = (icon: string, side?: 'left' | 'right' | 'center') => {
    if (overlayTimeout.current) clearTimeout(overlayTimeout.current);
    setOverlayAction({ icon, side });
    overlayTimeout.current = setTimeout(() => setOverlayAction(null), 800);
  };

  const processGestures = (count: number, x: number, width: number) => {
    if (!videoRef.current) return;

    if (count === 1) {
      // Single tap in middle: Pause/Play
      if (x > width / 3 && x < (2 * width) / 3) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
          triggerOverlay('play', 'center');
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
          triggerOverlay('pause', 'center');
        }
      }
    } else if (count === 2) {
      // Double tap Right: +10s
      if (x > (2 * width) / 3) {
        videoRef.current.currentTime += 10;
        triggerOverlay('forward', 'right');
      }
      // Double tap Left: -10s
      else if (x < width / 3) {
        videoRef.current.currentTime -= 10;
        triggerOverlay('backward', 'left');
      }
    } else if (count === 3) {
      // Three taps Middle: Next video
      if (x > width / 3 && x < (2 * width) / 3) {
        triggerOverlay('next', 'center');
        setTimeout(() => router.push("/"), 500);
      }
      // Three taps Right: Close website
      else if (x > (2 * width) / 3) {
        triggerOverlay('close', 'right');
        setTimeout(() => {
          if (confirm("Close website?")) window.location.href = "https://google.com";
        }, 500);
      }
      // Three taps Left: Show comment section
      else if (x < width / 3) {
        triggerOverlay('comments', 'left');
        const commentSection = document.getElementById("comments-section");
        if (commentSection) {
          commentSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = false;
      setVolume(val);
      setIsMuted(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
      toast.success(`Speed: ${rate}x`);
    }
  };

  const skipRelative = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      triggerOverlay(seconds > 0 ? 'forward' : 'backward', seconds > 0 ? 'right' : 'left');
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div 
      className="aspect-video bg-black rounded-lg overflow-hidden relative group/player shadow-2xl"
      onClick={handleTap}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        key={video?._id}
        ref={videoRef}
        autoPlay
        playsInline
        disablePictureInPicture
        controlsList="nopictureinpicture"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-pointer"
        poster={`/placeholder.svg?height=480&width=854`}
        src={`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/${video?.filepath}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
      >
        Your browser does not support the video tag.
      </video>

      {/* Control Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 transition-all duration-300 z-30 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {/* Progress Bar (Timeline) */}
        <div className="group/timeline relative flex items-center mb-4 h-5">
           <input
             type="range"
             min="0"
             max={duration || 0}
             value={currentTime}
             onChange={handleSeek}
             onClick={(e) => e.stopPropagation()}
             className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-red-600 hover:h-1.5 transition-all outline-none"
             style={{
               background: `linear-gradient(to right, #ef4444 ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.2) ${(currentTime / duration) * 100}%)`
             }}
           />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); skipRelative(-10); }}
              className="text-white/60 hover:text-white transition-colors"
            >
               <Rewind className="w-3 h-3 fill-current" />
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isPlaying) videoRef.current?.pause();
                else videoRef.current?.play();
              }}
              className="text-white/90 hover:scale-110 hover:text-white transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); skipRelative(10); }}
              className="text-white/60 hover:text-white transition-colors"
            >
               <FastForward className="w-3 h-3 fill-current" />
            </button>

            <div className="flex items-center gap-2 group/volume ml-1">
              <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white/80">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeSlide}
                onClick={(e) => e.stopPropagation()}
                className="w-0 group-hover/volume:w-16 transition-all duration-300 h-1 accent-white appearance-none bg-white/20 rounded-full cursor-pointer"
              />
            </div>

            <span 
              onClick={(e) => { e.stopPropagation(); setShowRemaining(!showRemaining); }}
              className="text-white text-[11px] font-bold tabular-nums ml-2 cursor-pointer transition-colors"
              title={showRemaining ? "Show Total Duration" : "Show Remaining Time"}
            >
              {formatTime(currentTime)} / {showRemaining ? `-${formatTime(Math.max(0, duration - currentTime))}` : formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showSettings && (
                <div 
                  className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1.5 w-28 shadow-2xl animate-in slide-in-from-bottom-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 py-1 mb-1">Speed</p>
                  {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${playbackRate === rate ? 'bg-red-600/90 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/70 hover:text-white transition-transform">
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gesture Overlays */}
      {overlayAction && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20`}>
          <div className="bg-black/40 backdrop-blur-sm p-8 rounded-full animate-in zoom-in-50 fade-in duration-300">
            {overlayAction.icon === 'play' && <Play className="w-16 h-16 text-white fill-current" />}
            {overlayAction.icon === 'pause' && <Pause className="w-16 h-16 text-white fill-current" />}
            {overlayAction.icon === 'forward' && (
              <div className="flex flex-col items-center gap-2">
                <FastForward className="w-16 h-16 text-white fill-current" />
                <span className="text-white font-black">+10s</span>
              </div>
            )}
            {overlayAction.icon === 'backward' && (
              <div className="flex flex-col items-center gap-2">
                <Rewind className="w-16 h-16 text-white fill-current" />
                <span className="text-white font-black">-10s</span>
              </div>
            )}
            {overlayAction.icon === 'next' && (
              <div className="flex flex-col items-center gap-2">
                <SkipForward className="w-16 h-16 text-white" />
                <span className="text-white font-black">NEXT</span>
              </div>
            )}
            {overlayAction.icon === 'comments' && (
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="w-16 h-16 text-white" />
                <span className="text-white font-black">COMMENTS</span>
              </div>
            )}
            {overlayAction.icon === 'close' && (
              <div className="flex flex-col items-center gap-2">
                <X className="w-16 h-16 text-red-500" />
                <span className="text-white font-black">EXIT</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Semi-transparent center play button on pause */}
      {!isPlaying && !showLimitModal && !overlayAction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-full border border-white/20">
             <Play className="w-12 h-12 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="absolute inset-0 flex items-center justify-center animate-in fade-in duration-300">
          {/* Backdrop/Overlay */}
          <div className="absolute inset-0 z-40 bg-black/40 transition-opacity" />
          
          {/* Modal Container */}
          <div className="relative z-50 w-full max-w-sm bg-white rounded-2xl p-8 text-center space-y-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto relative z-10">
                <Crown className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-100/50 blur-2xl rounded-full" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Time's Up!</h2>
              <p className="text-gray-600 font-medium px-4 text-sm">
                Unlock unlimited playback for the entire month!
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-full py-2 px-4 mt-4 inline-block">
                <span className="text-blue-700 font-bold text-[11px] uppercase tracking-wider">
                  {user?.plan || "Free"} Plan Limit: {limitRef.current}m
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/premium");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all text-base flex items-center justify-center gap-2 group"
              >
                Upgrade Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/");
                }}
                className="w-full text-gray-500 font-semibold hover:text-gray-800 hover:bg-gray-50 py-2.5 rounded-lg transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
