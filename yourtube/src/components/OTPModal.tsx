import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useUser } from "@/lib/AuthContext";

const OTPModal = () => {
  const { otpRequired, verifyOTP, tempUser } = useUser();
  const [otp, setOtp] = useState("");

  if (!otpRequired) return null;

  return (
    <Dialog open={otpRequired}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OTP Verification</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Please enter the OTP sent to your registered email or mobile for {tempUser?.email}.
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input 
            placeholder="Enter 6-digit OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <Button onClick={() => verifyOTP(otp)}>Verify OTP</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
