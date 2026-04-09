import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
  userId: { type: String, required: true },
  plan: { type: String, enum: ["Bronze", "Silver", "Gold"], required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: ["Success", "Failed"], required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
