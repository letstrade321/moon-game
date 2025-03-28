
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { depositCrypto, withdrawCrypto } from "@/lib/wallet";
import { WalletState } from "@/lib/types";
import TransactionHistory from "./TransactionHistory";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletState: WalletState;
  setWalletState: React.Dispatch<React.SetStateAction<WalletState>>;
}

const WalletModal = ({ isOpen, onClose, walletState, setWalletState }: WalletModalProps) => {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    try {
      setIsProcessing(true);
      const amount = parseFloat(depositAmount);
      
      const transaction = await depositCrypto(amount);
      
      setWalletState(prev => ({
        ...prev,
        balance: (prev.balance || 0) + amount,
        transactions: [transaction, ...prev.transactions]
      }));
      
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);
      const amount = parseFloat(withdrawAmount);
      
      if (!walletState.balance) {
        toast.error("Balance unavailable");
        return;
      }
      
      const transaction = await withdrawCrypto(amount, walletState.balance);
      
      setWalletState(prev => ({
        ...prev,
        balance: (prev.balance || 0) - amount,
        transactions: [transaction, ...prev.transactions]
      }));
      
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] glass">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
          <DialogDescription>
            Manage your crypto deposits and withdrawals
          </DialogDescription>
        </DialogHeader>

        {walletState.status === 'connected' && (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Address</Label>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyAddress}
                    className="h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    asChild
                  >
                    <a
                      href={`https://etherscan.io/address/${walletState.address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="p-2 bg-muted rounded-md text-xs font-mono">
                {walletState.address ? (
                  <>
                    {walletState.address.slice(0, 16)}...
                    {walletState.address.slice(-16)}
                  </>
                ) : (
                  "Address unavailable"
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Balance</Label>
              <span className="text-xl font-bold">
                {walletState.balance?.toFixed(4)} ETH
              </span>
            </div>

            {/* Deposit and Withdraw Tabs */}
            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Amount (ETH)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                    />
                    <Button
                      onClick={handleDeposit}
                      disabled={
                        isProcessing ||
                        !depositAmount ||
                        parseFloat(depositAmount) <= 0
                      }
                    >
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Deposit
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="withdraw" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount (ETH)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      max={walletState.balance?.toString()}
                    />
                    <Button
                      onClick={handleWithdraw}
                      disabled={
                        isProcessing ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0 ||
                        !walletState.balance ||
                        parseFloat(withdrawAmount) > walletState.balance
                      }
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Recent Transactions */}
            <div className="pt-4">
              <Label className="mb-2 block">Recent Transactions</Label>
              <div className="border rounded-md h-[200px] overflow-y-auto">
                <TransactionHistory transactions={walletState.transactions.slice(0, 10)} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
