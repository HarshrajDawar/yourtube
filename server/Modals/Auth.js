import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  
  // Task 2, 3 & 4 additions
  plan: { 
    type: String, 
    enum: ["Free", "Bronze", "Silver", "Gold"], 
    default: "Free" 
  },
  isPremium: { type: Boolean, default: false },
  downloadsToday: { type: Number, default: 0 },
  lastDownloadDate: { type: Date, default: null },
  planExpiry: { type: Date },
  location: { type: String },
  phone: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  subscribers: { type: [String], default: [] },
  subscribedTo: { type: [String], default: [] }
});

export default mongoose.model("user", userschema);
