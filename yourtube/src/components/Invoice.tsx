import React from "react";
import { Button } from "./ui/button";
import { CheckCircle2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Invoice = ({ user, transactionId, plan, amount, date, onClose }: any) => {
  const handleDownload = () => {
    // Simulate invoice download by creating a simple text file
    const content = `Invoice ID: ${transactionId}\nCustomer: ${user?.name}\nEmail: ${user?.email}\nPlan: ${plan}\nAmount Paid: ₹${amount}\nDate: ${new Date(date).toLocaleDateString()}\n\nThank you for choosing YourTube Premium!`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${transactionId}.txt`;
    a.click();
    toast.success("Invoice text file downloaded!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-card border-4 border-primary/20 rounded-[2.5rem] p-10 space-y-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-zinc-400/10 blur-[80px] -z-10 rounded-full" />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 mb-2">
             <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Payment Approved!</h1>
          <p className="text-muted-foreground font-medium">Successfully billed to <span className="text-foreground font-bold">{user?.email}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-y-8 gap-x-12 py-8 border-y-2 border-dashed border-border/80 relative">
          <div className="space-y-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Subscription Plan</span>
             <p className="text-lg font-black text-primary uppercase">{plan}</p>
          </div>
          <div className="space-y-1 text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Price Paid</span>
             <p className="text-2xl font-black">₹{amount}</p>
          </div>
          <div className="space-y-1">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Transaction ID</span>
             <p className="text-sm font-bold truncate pr-4">{transactionId}</p>
          </div>
          <div className="space-y-1 text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Date of Purchase</span>
             <p className="text-sm font-bold">{new Date(date).toLocaleDateString()}</p>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200/40 text-7xl font-black uppercase -rotate-12 pointer-events-none select-none tracking-tighter">
             PAID
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
           <Button 
             onClick={handleDownload}
             className="flex-1 h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black group transition-all"
           >
              <Download className="w-5 h-5 mr-3 group-hover:translate-y-1 transition-transform" />
              Download (PDF-Text)
           </Button>
           <Button 
             variant="outline"
             onClick={onClose}
             className="flex-1 h-14 rounded-2xl font-black border-2 hover:bg-secondary/50 group transition-all"
           >
              <ExternalLink className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Done
           </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">
           <ShieldCheck className="w-3 h-3 text-green-500" />
           <span>Legally Valid Demo Invoice</span>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
