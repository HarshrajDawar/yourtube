import React, { useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "@/lib/AuthContext";
import { Check, Star, Zap, Crown, Shield } from "lucide-react";
import DemoPaymentModal from "./DemoPaymentModal";
import Invoice from "./Invoice";
import { toast } from "sonner";

const plans = [
  { 
    name: "Free", 
    price: 0, 
    icon: <Zap className="w-6 h-6 text-slate-400" />,
    limit: "5 mins Watch time", 
    description: "Standard access with basic limits",
    features: ["Standard Resolution", "5 mins Watch Time", "1 Daily Download", "Ad-supported"],
    gradient: "from-slate-500/10 to-slate-500/5",
    border: "border-slate-200"
  },
  { 
    name: "Bronze", 
    price: 10, 
    icon: <Star className="w-6 h-6 text-amber-500" />,
    limit: "7 mins Watch time", 
    description: "Extended viewing for regular users",
    features: ["HD Resolution", "7 mins Watch Time", "Unlimited Downloads", "Priority Support"],
    gradient: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-200"
  },
  { 
    name: "Silver", 
    price: 50, 
    icon: <Shield className="w-6 h-6 text-indigo-500" />,
    limit: "10 mins Watch time", 
    description: "Premium duration for power viewers",
    features: ["4K Resolution", "10 mins Watch Time", "Unlimited Downloads", "Direct Chat Support"],
    gradient: "from-indigo-500/10 to-indigo-500/5",
    border: "border-indigo-200/50"
  },
  { 
    name: "Gold", 
    price: 100, 
    icon: <Crown className="w-6 h-6 text-yellow-500" />,
    limit: "Unlimited Watch time", 
    description: "The ultimate unrestricted package",
    features: ["8K Ultra HD", "Unlimited Watch Time", "Unlimited Downloads", "24/7 Dedicated Support", "Zero Ads Forever"],
    gradient: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-400/50",
    popular: true
  },
];

const planPrices: any = {
  Free: 0,
  Bronze: 10,
  Silver: 50,
  Gold: 100
};

const PremiumPlans = () => {
  const { user, verifyDemoPayment } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const handleUpgradeClick = (plan: any) => {
    if (!user) return toast.error("Please login first to upgrade.");
    
    // Restriction: Golden plan users cannot buy anything else
    if (user.plan === "Gold") {
      return toast.info("You already have the highest plan.");
    }

    // Restriction: Downgrade not allowed
    const currentPrice = planPrices[user.plan] || 0;
    if (plan.price < currentPrice) {
      return toast.warning("Downgrading is not supported at this time.");
    }

    const upgradeAmount = plan.price - currentPrice;
    
    setSelectedPlan({ ...plan, upgradeAmount });
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      const updatedUser = await verifyDemoPayment(details);
      setInvoiceData({
        user: updatedUser,
        ...details
      });
      toast.success(`Upgraded to ${details.plan} Plan!`, {
        description: "Invoice generated successfully."
      });
    } catch (error) {
      toast.error("Failed to upgrade subscription.");
    }
  };

  return (
    <div className="py-20 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="text-center mb-16 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Pricing Plans</h2>
        <h1 className="text-4xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/40 leading-tight">
          Elevate Your Session
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto px-4 font-medium opacity-80">
          Unlock unlimited playback and exclusive premium features in seconds. Simple, transparent, and demo-ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative group rounded-[2.5rem] p-10 flex flex-col border-2 bg-card/60 backdrop-blur-xl transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_45px_90px_-15px_rgba(0,0,0,0.4)] ${plan.border} ${plan.popular ? 'ring-2 ring-yellow-400/50 shadow-2xl lg:-translate-y-6' : 'hover:border-primary/30'} ${user?.plan === plan.name ? 'opacity-95 ring-4 ring-green-500/20 border-green-500/40' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-yellow-400/20 border-2 border-white/20">
                Most Popular
              </div>
            )}

            <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-8 border-2 border-white/20 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
              {plan.icon}
            </div>

            <div className="mb-10">
              <h3 className="text-3xl font-black mb-3 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">₹{plan.price}</span>
                <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-5 leading-relaxed font-bold opacity-70">
                {plan.description}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 pb-3 border-b-2 border-dashed border-border/50 mb-4">Core Benefits</div>
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-4 text-sm font-bold">
                  <div className="w-6 h-6 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Check className="w-3.5 h-3.5 text-primary stroke-[4px]" />
                  </div>
                  <span className="text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>

            {(() => {
              const currentPlanPrice = planPrices[user?.plan || "Free"];
              const targetPlanPrice = plan.price;
              const isCurrent = user?.plan === plan.name;
              const isGold = user?.plan === "Gold";
              const isDowngrade = targetPlanPrice < currentPlanPrice && !isCurrent;
              const upgradeCost = targetPlanPrice - currentPlanPrice;

              let buttonText = `Apply ${plan.name}`;
              let isDisabled = false;

              if (isCurrent) {
                buttonText = "Active Plan";
                isDisabled = true;
              } else if (isGold) {
                buttonText = "Already Gold Plan";
                isDisabled = true;
              } else if (isDowngrade) {
                buttonText = "Downgrade Prohibited";
                isDisabled = true;
              } else if (upgradeCost > 0 && currentPlanPrice > 0) {
                buttonText = `Upgrade (₹${upgradeCost})`;
              }

              return (
                <Button 
                  className={`w-full py-8 rounded-[1.5rem] font-black text-lg transition-all duration-500 shadow-xl ${
                    plan.popular ? 'bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-yellow-400/20' : ''
                  } ${isCurrent ? 'bg-green-500/10 text-green-600 border-2 border-green-500/30 cursor-default scale-95 shadow-none' : 'hover:scale-[1.02] active:scale-95'}`}
                  variant={isCurrent ? "ghost" : plan.popular ? "default" : "outline"}
                  disabled={isDisabled}
                  onClick={() => handleUpgradeClick(plan)}
                >
                  {buttonText}
                </Button>
              );
            })()}
          </div>
        ))}
      </div>
      
      {/* Modals & Overlays */}
      {selectedPlan && (
        <DemoPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={selectedPlan.name}
          amount={selectedPlan.upgradeAmount || selectedPlan.price}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {invoiceData && (
        <Invoice
          {...invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}

      <div className="mt-28 p-8 rounded-[2rem] bg-secondary/30 backdrop-blur-md border-2 border-border/50 text-center space-y-4 max-w-3xl mx-auto shadow-2xl">
         <div className="flex justify-center gap-4 mb-2">
            <Shield className="w-8 h-8 text-primary opacity-50" />
         </div>
         <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Internship Demo System</p>
         <h3 className="text-xl font-black">Secure Simulated Transactions</h3>
         <p className="text-sm text-muted-foreground font-medium opacity-80">
            This module uses a protected simulation engine for educational purposes. No real bank accounts or cards are required. All features are fully functional in demonstration mode.
         </p>
      </div>
    </div>
  );
};

export default PremiumPlans;
