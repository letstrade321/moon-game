
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatDistance } from "date-fns";

interface BonusTimerProps {
  className?: string;
  compact?: boolean;
}

const BonusTimer = ({ className = "", compact = false }: BonusTimerProps) => {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!user || !user.depositBonusExpiry) {
      setExpired(true);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expiry = user.depositBonusExpiry as number;
      
      if (now >= expiry) {
        setExpired(true);
        setTimeLeft("Expired");
        return;
      }
      
      setTimeLeft(formatDistance(expiry, now, { addSuffix: false }));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // If the user is not new, has already deposited, or the bonus has expired, don't show the timer
  if (!user?.isNewUser || user?.hasDeposited || expired) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium ${className}`}>
        <span className="inline-block h-2 w-2 bg-primary rounded-full animate-pulse"></span>
        <span>Bonus: {timeLeft}</span>
      </div>
    );
  }

  return (
    <div className={`glass p-4 rounded-lg text-center ${className}`}>
      <div className="text-lg font-bold mb-1">50% Deposit Bonus</div>
      <div className="text-sm text-muted-foreground mb-3">Offer expires in:</div>
      <div className="text-2xl font-bold text-primary">{timeLeft}</div>
      <div className="text-xs text-muted-foreground mt-2">Make your first deposit to claim!</div>
    </div>
  );
};

export default BonusTimer;
