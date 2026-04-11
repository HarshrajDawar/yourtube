import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Languages, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  city?: string;
  userState?: string;
  likes: string[];
  dislikes: string[];
  translatedBody?: string;
  showTranslated?: boolean;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ city: "Unknown City", state: "Unknown State" });

  useEffect(() => {
    loadComments();
    fetchLocationData();
  }, [videoId]);

  const fetchLocationData = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        setLocation({
          city: data.city || "Mumbai",
          state: data.region || "Maharashtra"
        });
      } else {
        throw new Error("Location service unavailable");
      }
    } catch (error) {
      console.warn("Location fetch blocked or failed. Using default location.");
      setLocation({ city: "Mumbai", state: "Maharashtra" }); // Consistent fallback
    }
  };

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    // Special characters validation policy (allow standard punctuation, block others)
    const restrictedChars = /[#$%\^&*()_+\=\[\]{};':"\\|<>\/~]/g;
    if (restrictedChars.test(newComment)) {
      toast.error("Special characters (#, %, &, etc.) are not allowed in comments");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        city: location.city, // Exact city name from IP
        userState: location.state,
      });
      if (res.data.comment) {
        toast.success(`Commented from ${location.city}!`);
        loadComments();
      }
      setNewComment("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error adding comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!user) return toast.error("Please login to like");
    try {
      await axiosInstance.patch(`/comment/likecomment/${id}`, { userid: user._id });
      loadComments();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async (id: string) => {
    if (!user) return toast.error("Please login to dislike");
    try {
      const res = await axiosInstance.patch(`/comment/dislikecomment/${id}`, { userid: user._id });
      
      // Auto-removal logic: If dislikes reach 2 or backend returns deleted
      const updatedComments = await axiosInstance.get(`/comment/${videoId}`);
      const targetComment = updatedComments.data.find((c: any) => c._id === id);
      
      if (!targetComment || targetComment.dislikes.length >= 2 || res.data.deleted) {
        // Trigger deletion if it reaches the threshold
        if (targetComment && targetComment.dislikes.length >= 2) {
          try {
            await axiosInstance.delete(`/comment/deletecomment/${id}`);
            toast.info("Comment automatically removed (2+ dislikes)");
          } catch (e) {
            console.error("Auto-delete failed:", e);
          }
        }
        setComments((prev) => prev.filter((c) => c._id !== id));
      } else {
        setComments(updatedComments.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const translateComment = async (comment: Comment, lang = 'en') => {
    try {
      toast.info(`Translating to ${lang === 'en' ? 'English' : 'Hindi'}...`);
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(comment.commentbody)}&langpair=auto|${lang}`);
      const data = await res.json();
      const translated = data.responseData.translatedText;
      
      setComments((prev) => 
        prev.map((c) => c._id === comment._id ? { ...c, translatedBody: translated, showTranslated: true } : c)
      );
    } catch (error) {
      toast.error("Translation service temporarily unavailable");
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;
    if (specialChars.test(editText)) {
      toast.error("Special characters are not allowed");
      return;
    }
    try {
      await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === editingCommentId ? { ...c, commentbody: editText } : c
        )
      );
      setEditingCommentId(null);
      setEditText("");
      toast.success("Comment updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating comment");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
        toast.success("Comment deleted");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mx-auto" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div id="comments-section" className="space-y-8 py-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {comments.length} Comments
        </h2>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
           <span>Sort by</span>
           <button className="hover:text-foreground">Top</button>
           <button className="hover:text-foreground">Newest</button>
        </div>
      </div>

      <div className="flex gap-4">
        <Avatar className="w-10 h-10 border shadow-sm shrink-0">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {user?.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="Add a public comment... (No special characters)"
            value={newComment}
            onChange={(e: any) => setNewComment(e.target.value)}
            className="min-h-[40px] max-h-[200px] resize-none border-0 border-b border-border rounded-none focus-visible:ring-0 focus:border-primary transition-all duration-200 bg-transparent text-foreground placeholder:text-muted-foreground/60 p-0 text-sm md:text-base"
          />
          {newComment.trim() && (
            <div className="flex gap-3 justify-end items-center animate-in fade-in slide-in-from-top-1">
              <Button
                variant="ghost"
                size="sm"
                className="font-bold rounded-full px-4"
                onClick={() => setNewComment("")}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-full px-6 font-bold bg-primary text-primary-foreground shadow-sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8 mt-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-base text-muted-foreground font-medium">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <Avatar className="w-10 h-10 shrink-0 border border-border mt-1 transition-transform group-hover:scale-105">
                <AvatarFallback className="bg-secondary/80 text-secondary-foreground font-black text-sm">
                  {(comment.usercommented?.[0] || "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-foreground hover:underline cursor-pointer">
                    {comment.usercommented || "anonymous"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <MapPin className="w-3 h-3 text-red-500" /> {comment.city || "Mumbai"}
                  </span>
                  <span className="text-xs text-muted-foreground/80 font-medium ml-1">
                    {comment.commentedon ? formatDistanceToNow(new Date(comment.commentedon), { addSuffix: true }) : "recently"}
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-3 mt-2 animate-in fade-in">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[80px] bg-muted/40 border-border text-foreground rounded-lg"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full px-4"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full px-5 bg-primary text-primary-foreground"
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm md:text-base leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap break-words">
                      {comment.commentbody}
                    </p>
                    {comment.showTranslated && comment.translatedBody && (
                       <div className="bg-primary/5 p-3 rounded-lg border-l-2 border-primary animate-in fade-in slide-in-from-left-2">
                        <p className="text-sm italic text-foreground/80">
                          {comment.translatedBody}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => translateComment(comment, 'en')} className="text-[10px] font-bold text-primary hover:underline uppercase">English</button>
                          <button onClick={() => translateComment(comment, 'hi')} className="text-[10px] font-bold text-primary hover:underline uppercase">Hindi</button>
                          <button onClick={() => setComments(prev => prev.map(c => c._id === comment._id ? {...c, showTranslated: false} : c))} className="text-[10px] font-bold text-muted-foreground hover:underline uppercase">Hide</button>
                        </div>
                       </div>
                    )}
                    <div className="flex items-center gap-4 text-foreground/70">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleLike(comment._id)}
                          className={`p-1.5 rounded-full hover:bg-muted transition-all active:scale-90 ${comment.likes?.includes(user?._id) ? 'text-blue-500 fill-blue-500/20' : 'hover:text-foreground'}`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${comment.likes?.includes(user?._id) ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-xs font-bold w-6 text-center tabular-nums">
                           {comment.likes?.length || 0}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleDislike(comment._id)}
                        className={`p-1.5 rounded-full hover:bg-muted transition-all active:scale-90 ${comment.dislikes?.includes(user?._id) ? 'text-red-500 fill-red-500/20' : 'hover:text-foreground'}`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${comment.dislikes?.includes(user?._id) ? 'fill-current' : ''}`} />
                      </button>

                      <button 
                        onClick={() => translateComment(comment, 'en')}
                        className="flex items-center gap-1.5 text-[11px] font-black text-foreground hover:bg-muted transition-all py-1.5 px-3 rounded-full border border-border bg-background shadow-sm hover:scale-105 active:scale-95"
                      >
                        <Languages className="w-3.5 h-3.5 text-primary" /> 
                        <span className="uppercase tracking-tight">Translate</span>
                      </button>
                      
                      {comment.userid === user?._id && (
                        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(comment)}
                            className="text-xs font-bold p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(comment._id)}
                            className="text-xs font-bold p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
