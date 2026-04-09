import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function DemoPaymentModal({ isOpen, onClose, plan, amount, onPaymentSuccess }: any) {
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  const handlePayment = () => {
    setStatus("processing");
    
    // Simulate real payment delay
    setTimeout(() => {
      setStatus("success");
      const fakeTransactionId = `DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      // Notify parent after short delay to show success state
      setTimeout(() => {
        onPaymentSuccess({
          transactionId: fakeTransactionId,
          plan,
          amount,
          date: new Date().toISOString()
        });
        setStatus("idle");
        onClose();
      }, 1500);
    }, 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-8 rounded-3xl border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce-subtle">
             {status === "success" ? <CheckCircle2 className="w-10 h-10 text-green-500" /> : <CreditCard className="w-10 h-10 text-primary" />}
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight">
            {status === "idle" && "Secure Checkout"}
            {status === "processing" && "Processing Payment"}
            {status === "success" && "Payment Successful!"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
             {status === "idle" && (
                <div className="space-y-4 py-2">
                   <p className="opacity-80">You're upgrading to the <span className="text-primary font-bold">{plan} Plan</span></p>
                   <div className="bg-secondary/40 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                      <span className="font-bold">Total Amount</span>
                      <span className="text-2xl font-black text-primary">₹{amount}</span>
                   </div>
                   <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground pt-2">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      <span>Secured Demo Payment Gateway</span>
                   </div>
                </div>
             )}
             {status === "processing" && (
                <div className="py-10 flex flex-col items-center gap-4">
                   <Loader2 className="w-12 h-12 text-primary animate-spin" />
                   <p className="animate-pulse font-bold text-muted-foreground uppercase tracking-widest text-xs">Communicating with Bank...</p>
                </div>
             )}
             {status === "success" && (
                <div className="py-6 space-y-2">
                   <p className="text-green-600 font-bold">Your subscription is now active.</p>
                   <p className="text-xs text-muted-foreground italic">Generating your premium invoice...</p>
                </div>
             )}
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <div className="flex flex-col gap-3 mt-6">
            <Button 
               onClick={handlePayment} 
               className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              Pay Now (Demo)
            </Button>
            <Button 
               variant="ghost" 
               onClick={onClose}
               className="font-bold text-muted-foreground hover:text-foreground"
            >
              Cancel Transaction
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
