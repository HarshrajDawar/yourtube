import comment from "../Modals/comment.js";
import mongoose from "mongoose";

export const postcomment = async (req, res) => {
  const { videoid, userid, commentbody, usercommented, city, userState } = req.body;
  
  // Task-1: Special characters validation
  const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;
  if (specialChars.test(commentbody)) {
    return res.status(400).json({ message: "Special characters are not allowed in comments" });
  }

  const postcomment = new comment({
    videoid,
    userid,
    commentbody,
    usercommented,
    city,
    userState,
  });

  try {
    const savedComment = await postcomment.save();
    return res.status(200).json({ comment: true, data: savedComment });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid }).sort({ commentedon: -1 });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  
  const specialChars = /[!@#$%^&*(),.?":{}|<>]/g;
  if (specialChars.test(commentbody)) {
    return res.status(400).json({ message: "Special characters are not allowed in comments" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    }, { new: true });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const comm = await comment.findById(_id);
    const likeIndex = comm.likes.findIndex((id) => id === String(userid));
    const dislikeIndex = comm.dislikes.findIndex((id) => id === String(userid));

    if (likeIndex === -1) {
      comm.likes.push(userid);
      if (dislikeIndex !== -1) {
        comm.dislikes = comm.dislikes.filter((id) => id !== String(userid));
      }
    } else {
      comm.likes = comm.likes.filter((id) => id !== String(userid));
    }
    await comm.save();
    res.status(200).json(comm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const dislikecomment = async (req, res) => {
  const { id: _id } = req.params;
  const { userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const comm = await comment.findById(_id);
    const dislikeIndex = comm.dislikes.findIndex((id) => id === String(userid));
    const likeIndex = comm.likes.findIndex((id) => id === String(userid));

    if (dislikeIndex === -1) {
      comm.dislikes.push(userid);
      if (likeIndex !== -1) {
        comm.likes = comm.likes.filter((id) => id !== String(userid));
      }
    } else {
      comm.dislikes = comm.dislikes.filter((id) => id !== String(userid));
    }

    // Task-1: Remove comment automatically if it gets 2 dislikes
    if (comm.dislikes.length >= 2) {
      await comment.findByIdAndDelete(_id);
      return res.status(200).json({ message: "Comment deleted due to dislikes", deleted: true });
    }

    await comm.save();
    res.status(200).json(comm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
