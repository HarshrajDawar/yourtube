import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useUser } from "@/lib/AuthContext";

const OTPModal = () => {
  const { otpRequired, verifyOTP, tempUser, generatedOtp, otpMethod, setOtpRequired } = useUser();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!otpRequired) return null;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    await verifyOTP(otp);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <Dialog open={otpRequired} onOpenChange={(open) => !loading && setOtpRequired(open)}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border shadow-2xl p-0 overflow-hidden">
        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <DialogTitle className="text-2xl font-black text-center">Security Verification</DialogTitle>
            
            <div className="bg-secondary/50 border border-border p-5 rounded-2xl text-center space-y-2 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Live Demo Verification Code</p>
               <p className="text-5xl font-black text-primary tracking-[0.2em] font-mono drop-shadow-sm select-all">
                 {generatedOtp || '------'}
               </p>
               <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Method: {otpMethod || 'Identity Service'}</p>
               </div>
            </div>

            <p className="text-center text-sm text-muted-foreground px-4">
              We've sent a verification code to <br/>
              <span className="font-bold text-foreground inline-block mt-1">{tempUser?.email}</span>
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Input 
              className="text-center h-16 text-3xl font-black tracking-[0.3em] rounded-xl border-border bg-secondary/30 text-foreground focus-visible:ring-primary focus-visible:ring-offset-2 transition-all shadow-inner"
              placeholder="000000" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={handleKeyDown}
              maxLength={6}
              disabled={loading}
              autoFocus
            />
            <Button 
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-black text-lg transition-all active:scale-95 disabled:opacity-50"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                  Verifying...
                </div>
              ) : "Unlock & Continue"}
            </Button>
            <button 
              onClick={() => !loading && setOtpRequired(false)}
              className="py-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors w-full text-center"
            >
              Cancel Login
            </button>
          </div>
        </div>
        <div className="bg-primary/5 py-3 px-6 text-center border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Secure YourTube Auth System</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
