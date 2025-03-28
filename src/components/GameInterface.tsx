
import React, { useEffect } from "react";
import PlinkoGame from "./PlinkoGame";
import { WalletState } from "@/lib/types";
import { saveWalletState } from "@/lib/wallet";

interface GameInterfaceProps {
  walletState: WalletState;
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ walletState, setWalletState }) => {
  // Save wallet state when it changes
  useEffect(() => {
    saveWalletState(walletState);
  }, [walletState]);

  return <PlinkoGame walletState={walletState} setWalletState={setWalletState} />;
};

export default GameInterface;
