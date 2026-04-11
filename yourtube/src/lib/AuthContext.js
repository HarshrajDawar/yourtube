import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { toast } from "sonner";

const UserContext = createContext();

const SOUTH_INDIAN_STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState("Unknown");
  const [otpRequired, setOtpRequired] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpMethod, setOtpMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme logic moved to useDynamicTheme.ts to prevent conflicts and ensure consistent next-themes usage.

  useEffect(() => {
    const savedState = localStorage.getItem("userState");
    if (savedState) setUserState(savedState);
  }, []);

  useEffect(() => {
    if (userState !== "Unknown") {
      localStorage.setItem("userState", userState);
    }
  }, [userState]);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const fetchLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return { region: data.region, country: data.country_name };
    } catch (error) {
      console.error("Location fetch failed:", error);
      return { region: "Unknown" };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handlegooglesignin = async (selectedState) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      
      setUserState(selectedState);
      
      const isSouthIndia = SOUTH_INDIAN_STATES.includes(selectedState);
      const method = isSouthIndia ? "Email" : "Mobile";
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      setGeneratedOtp(otp);
      setOtpMethod(method);
      setTempUser({ 
        email: firebaseuser.email, 
        name: firebaseuser.displayName, 
        image: firebaseuser.photoURL || "https://github.com/shadcn.png" 
      });

      console.log(`DEMO OTP [${method}]: ${otp}`);
      toast.info(`OTP generated! Check console. Method: ${method} OTP`);
      setOtpRequired(true);
      
    } catch (error) {
      console.error(error);
      toast.error("Sign in failed");
    }
  };

  const verifyOTP = async (otp) => {
    if (otp === generatedOtp) {
      const payload = { ...tempUser, locationData: { region: userState } };
      try {
        const response = await axiosInstance.post("/user/login", payload);
        login(response.data.result);
        setOtpRequired(false);
        setTempUser(null);
        setGeneratedOtp(null);
        toast.success("Login successful!");
      } catch (err) {
        toast.error("Backend login failed");
      }
    } else {
      toast.error("Invalid OTP");
    }
  };

  const upgradePlan = async (plan, amount) => {
    if (!user) return toast.error("Please login first");
    try {
      const { data: order } = await axiosInstance.post("/premium/create-order", { amount, plan });
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyId",
        amount: order.amount,
        currency: "INR",
        name: "YourTube Premium",
        description: `${plan} Plan Subscription`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post("/premium/verify-payment", {
              ...response,
              userid: user._id,
              plan,
              amount: Number(amount)
            });
            login(verifyRes.data.user);
            toast.success(`Upgraded to ${plan} successfully! Check your email for invoice.`);
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#FF0000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };

  const verifyDemoPayment = async (details) => {
    if (!user) return toast.error("Please login first");
    try {
      const response = await axiosInstance.post("/premium/verify-demo-payment", {
        ...details,
        userid: user._id
      });
      
      const updatedUser = response.data.user;
      login(updatedUser);
      console.log("DEMO EMAIL SIMULATION: Sending invoice to", updatedUser.email, "for", details.plan, "plan.");
      return updatedUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        const saved = localStorage.getItem("user");
        if (saved) setUser(JSON.parse(saved));
      }
      setLoading(false);
    });
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, handlegooglesignin, otpRequired, verifyOTP, upgradePlan, verifyDemoPayment, tempUser, userState, setUserState, generatedOtp, otpMethod }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
