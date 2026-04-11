import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useUser } from "@/lib/AuthContext";

const OTPModal = () => {
  const { otpRequired, verifyOTP, tempUser, generatedOtp, otpMethod } = useUser();
  const [otp, setOtp] = useState("");

  if (!otpRequired) return null;

  return (
    <Dialog open={otpRequired}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-white border-zinc-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center text-white">OTP Verification</DialogTitle>
          <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-center space-y-2 mt-4">
             <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Demo OTP System</p>
             <p className="text-3xl font-black text-white tracking-[0.5em]">{generatedOtp}</p>
             <p className="text-[11px] font-bold text-zinc-500 uppercase">Method: {otpMethod || 'Email/Mobile'}</p>
          </div>
          <p className="text-center text-sm text-zinc-400 pt-4">
            We've generated a demo OTP for <span className="font-bold text-white">{tempUser?.email}</span>.
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input 
            className="text-center h-14 text-2xl font-black tracking-[0.5em] rounded-xl border-zinc-700 bg-zinc-800 text-white focus-visible:ring-zinc-500"
            placeholder="000000" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <Button 
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-lg transition-all active:scale-95"
            onClick={() => verifyOTP(otp)}
          >
            Verify & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
