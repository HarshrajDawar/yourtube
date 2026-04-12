import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useUser } from "@/lib/AuthContext";

interface StateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATES = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Delhi",
  "Maharashtra",
  "Gujarat",
  "Rajasthan",
  "Others"
];

const StateSelectionModal = ({ isOpen, onClose }: StateSelectionModalProps) => {
  const [selectedState, setSelectedState] = React.useState("");
  const { handlegooglesignin } = useUser();

  const handleLogin = async () => {
    if (!selectedState) return;
    onClose();
    await handlegooglesignin(selectedState);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Your State</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please select your location to proceed with login.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <select 
            className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white ring-offset-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="" disabled className="bg-zinc-800">Choose a state...</option>
            {STATES.map((state) => (
              <option key={state} value={state} className="bg-zinc-800">
                {state}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleLogin} 
            disabled={!selectedState}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-11"
          >
            Continue to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StateSelectionModal;
