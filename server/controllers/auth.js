import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const southernStates = ["Tamil Nadu", "Tamilnadu", "Kerala", "Karnataka", "Andhra Pradesh", "Andhra", "Telangana", "Telungana"];

export const login = async (req, res) => {
  const { email, name, image, locationData } = req.body;
  const state = locationData?.region || "Unknown";

  try {
    let existingUser = await users.findOne({ email });

    if (!existingUser) {
      existingUser = await users.create({ email, name, image, location: state });
    } else {
      existingUser.location = state;
      await existingUser.save();
    }

    // OTP Generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existingUser.otp = otp;
    existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await existingUser.save();

    // Check if user is from Southern States
    const isSouthern = southernStates.some(s => 
      state.toLowerCase().includes(s.toLowerCase())
    );

    if (isSouthern) {
      // Trigger Email OTP
      await sendEmailOTP(email, otp);
      return res.status(200).json({ result: existingUser, otpRequired: true, method: "email" });
    } else {
      // Trigger SMS OTP (Mocked)
      console.log(`[SMS OTP] To: ${existingUser.phone || "User"}, Content: Your OTP is ${otp}`);
      return res.status(200).json({ result: existingUser, otpRequired: true, method: "sms" });
    }

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Demo/Master OTP Check: 123456
    if ((user.otp === otp || otp === "123456") && user.otpExpiry > new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(200).json({ message: "OTP Verified", result: user });
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function sendEmailOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-password",
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER || "your-email@gmail.com",
    to: email,
    subject: "OTP Verification - YourTube",
    text: `Your OTP for login is ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description, phone } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
          phone: phone
        },
      },
      { new: true }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const subscribeChannel = async (req, res) => {
  const { channelId, userId } = req.body;
  
  if (channelId === userId) {
    return res.status(400).json({ message: "You cannot subscribe to your own channel" });
  }

  try {
    const channel = await users.findById(channelId);
    const user = await users.findById(userId);

    if (!channel || !user) {
      return res.status(404).json({ message: "Channel or User not found" });
    }

    const subIndex = channel.subscribers.indexOf(userId);
    if (subIndex === -1) {
      // Subscribe
      channel.subscribers.push(userId);
      user.subscribedTo.push(channelId);
    } else {
      // Unsubscribe
      channel.subscribers.splice(subIndex, 1);
      const userSubIndex = user.subscribedTo.indexOf(channelId);
      if (userSubIndex !== -1) user.subscribedTo.splice(userSubIndex, 1);
    }

    await channel.save();
    await user.save();

    return res.status(200).json({ 
      success: true, 
      subscribers: channel.subscribers.length,
      isSubscribed: channel.subscribers.includes(userId)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getChannelData = async (req, res) => {
  const { id } = req.params;
  try {
    const channel = await users.findById(id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    return res.status(200).json({
      subscribers: channel.subscribers.length,
      name: channel.name,
      image: channel.image
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
