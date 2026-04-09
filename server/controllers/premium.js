import Razorpay from "razorpay";
import crypto from "crypto";
import users from "../Modals/Auth.js";
import download from "../Modals/download.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyId",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YourKeySecret",
});

const planPrices = {
  Free: 0,
  Bronze: 10,
  Silver: 50,
  Gold: 100
};

export const getUpgradeCost = (req, res) => {
  const { currentPlan, targetPlan } = req.body;
  const currentPrice = planPrices[currentPlan] || 0;
  const targetPrice = planPrices[targetPlan] || 0;
  
  if (currentPlan === "Gold") {
    return res.status(400).json({ message: "You already have the highest plan" });
  }

  if (targetPrice <= currentPrice) {
    return res.status(400).json({ message: "Downgrade or re-purchase of same plan is not allowed" });
  }
  
  const cost = targetPrice - currentPrice;
  return res.status(200).json({ cost });
};

export const createOrder = async (req, res) => {
  const { amount, plan } = req.body;
  try {
    const options = {
      amount: amount * 100, // paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userid, plan, amount } = req.body;
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "YourKeySecret";
  const expectedSign = crypto.createHmac("sha256", keySecret).update(sign.toString()).digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      const user = await users.findById(userid);
      if (!user) return res.status(404).json({ message: "User not found" });
      user.isPremium = true;
      user.plan = plan;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.planExpiry = expiry;
      await user.save();
      const log = new Subscription({ userId: userid, plan, amount, paymentId: razorpay_payment_id, orderId: razorpay_order_id, status: "Success", expiryDate: expiry });
      await log.save();
      await sendInvoiceEmail(user, plan, amount, razorpay_payment_id);
      return res.status(200).json({ message: "Payment verified successfully", user });
    } catch (error) { return res.status(500).json({ message: error.message }); }
  } else { return res.status(400).json({ message: "Invalid signature" }); }
};export const verifyDemoPayment = async (req, res) => {
  const { transactionId, plan, amount, userid } = req.body;
  try {
    const user = await users.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validation
    const currentPrice = planPrices[user.plan] || 0;
    const targetPrice = planPrices[plan] || 0;

    if (user.plan === "Gold") {
      return res.status(400).json({ message: "You already have the highest plan" });
    }

    if (targetPrice <= currentPrice) {
      return res.status(400).json({ message: "Downgrade or re-purchase not allowed" });
    }

    // Update user plan
    user.isPremium = true;
    user.plan = plan;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    user.planExpiry = expiry;
    
    await user.save();

    // Log the simulated subscription
    const log = new Subscription({
       userId: userid,
       plan,
       amount: Number(amount),
       paymentId: transactionId,
       orderId: `ORDER-${transactionId}`,
       status: "Success",
       expiryDate: expiry
    });
    await log.save();

    // 📧 Simulate sending email (Logging to console for Intern Project Demo)
    console.log(`
      *************************************************
      DEMO EMAIL SIMULATOR: INVOICE GENERATED
      To: ${user.email}
      Customer: ${user.name}
      Plan: ${plan}
      Amount: ₹${amount}
      Transaction ID: ${transactionId}
      Status: ACTIVE (Expiring: ${expiry.toLocaleDateString()})
      *************************************************
    `);

    // We can also call the real email function if process.env.EMAIL_USER is set
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
       try {
          await sendInvoiceEmail(user, plan, amount, transactionId);
       } catch (e) {
          console.warn("Real email failed in demo, but it's okay for demo.");
       }
    }

    return res.status(200).json({ message: "Demo payment successful", user });
  } catch (error) {
    console.error("Demo verification error:", error);
    return res.status(500).json({ message: "Server error during demo verification" });
  }
};

export const handleDownload = async (req, res) => {
  const { userid, videoid } = req.body;
  try {
    const user = await users.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toDateString();
    const lastDL = user.lastDownloadDate ? user.lastDownloadDate.toDateString() : null;

    if (user.isPremium || user.plan !== "Free") {
      // Unlimited for premium plans
      const newDL = new download({ userid, videoid });
      await newDL.save();
      return res.status(200).json({ message: "Download started", success: true });
    }

    if (lastDL === today) {
      if (user.downloadsToday >= 1) {
        return res.status(403).json({ message: "Free plan limit reached! Only 1 download per day allowed. Upgrade to Premium for more.", success: false });
      }
      user.downloadsToday += 1;
    } else {
      user.downloadsToday = 1;
      user.lastDownloadDate = new Date();
    }

    await user.save();
    const newDL = new download({ userid, videoid });
    await newDL.save();

    res.status(200).json({ message: "Download started", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import videofiles from "../Modals/video.js";

export const getUserDownloads = async (req, res) => {
  const { userid } = req.params;
  try {
    const downloads = await download.find({ userid }).populate("videoid");
    const videos = downloads.map(d => d.videoid);
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function sendInvoiceEmail(user, plan, cost, paymentId) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-password",
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER || "your-email@gmail.com",
    to: user.email,
    subject: `Payment Successful - YourTube Premium ${plan} Plan`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #FF0000;">YourTube Premium</h1>
        <p>Hi ${user.name},</p>
        <p>Your payment for the <strong>${plan} Plan</strong> has been successfully processed.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Amount Paid:</strong> ₹${cost}</p>
          <p><strong>Transaction ID:</strong> ${paymentId}</p>
          <p><strong>Plan Duration:</strong> 30 Days</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Enjoy unlimited watch time and exclusive premium features!</p>
        <p>Best Regards,<br/>The YourTube Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Invoice email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
