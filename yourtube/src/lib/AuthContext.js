import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { toast } from "sonner";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const fetchCity = async () => {
    // Suppress flaky external IP fetch
    setCity("Unknown City");
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


  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const locationData = await fetchLocation();

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
        locationData
      };

      const response = await axiosInstance.post("/user/login", payload);
      
      if (response.data.otpRequired) {
        setTempUser({ email: firebaseuser.email, ...response.data.result });
        setOtpRequired(true);
        toast.info(`OTP sent via ${response.data.method}`);
      } else {
        login(response.data.result);
      }
    } catch (error) {
      console.error(error);
      toast.error("Sign in failed");
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const res = await axiosInstance.post("/user/verify-otp", { email: tempUser.email, otp });
      login(res.data.result);
      setOtpRequired(false);
      setTempUser(null);
      toast.success("OTP Verified! Login successful.");
    } catch (error) {
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
    <UserContext.Provider value={{ user, setUser, login, logout, handlegooglesignin, otpRequired, verifyOTP, upgradePlan, verifyDemoPayment, tempUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
