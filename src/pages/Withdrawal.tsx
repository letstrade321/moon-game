
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Copy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { loadWalletState, saveWalletState, sendWithdrawalApprovalEmail } from "@/lib/wallet";
import { CryptoOption, Transaction } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const formSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid amount"
  }),
  walletAddress: z.string().min(10, "Wallet address must be at least 10 characters"),
  cryptoType: z.enum(["btc", "xmr", "zec"]),
});

type FormValues = z.infer<typeof formSchema>;

const Withdrawal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [walletState, setWalletState] = useState(() => loadWalletState() || {
    status: 'connected',
    address: user?.username || 'Demo Account',
    balance: 0,
    transactions: [],
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      walletAddress: "",
      cryptoType: "btc",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(data.amount);
      
      if (!walletState.balance || amount > walletState.balance) {
        toast.error("Insufficient balance");
        setIsSubmitting(false);
        return;
      }
      
      // Generate reference ID and simulate email sending
      const refId = await sendWithdrawalApprovalEmail({
        email: user?.email,
        amount: data.amount,
        walletAddress: data.walletAddress,
        crypto: data.cryptoType.toUpperCase(),
      });
      
      // Create a pending transaction
      const newTransaction: Transaction = {
        id: `wd-${Date.now()}`,
        type: 'withdrawal',
        amount,
        timestamp: Date.now(),
        status: 'pending',
        referenceId: refId
      };
      
      // Update wallet state with the new transaction
      const updatedWalletState = {
        ...walletState,
        balance: walletState.balance - amount,
        transactions: [newTransaction, ...walletState.transactions]
      };
      
      // Save updated wallet state
      saveWalletState(updatedWalletState);
      setWalletState(updatedWalletState);
      setReferenceId(refId);
      
      toast.success("Withdrawal request submitted successfully!");
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setReferenceId(null);
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState}
        openWalletModal={() => {}} 
      />
      
      <main className="page-container pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("/game")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
              <p className="text-muted-foreground">Transfer crypto to your wallet</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Withdraw Cryptocurrency</CardTitle>
                <CardDescription>Send funds to your wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="cryptoType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Cryptocurrency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select crypto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                              <SelectItem value="xmr">Monero (XMR)</SelectItem>
                              <SelectItem value="zec">Zcash (ZEC)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="walletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your {form.watch("cryptoType").toUpperCase()} Wallet Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your wallet address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="0.00" />
                              <div className="absolute right-3 top-2.5 text-muted-foreground">
                                USD
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground mt-1">
                            Maximum withdrawal: ${walletState.balance?.toFixed(2) || "0.00"}
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting || !walletState.balance || walletState.balance <= 0}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="mr-2">Processing</span>
                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
                        </span>
                      ) : (
                        "Submit Withdrawal Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Card className="glass h-full">
              <CardHeader>
                <CardTitle>Withdrawal Information</CardTitle>
                <CardDescription>Important details about your withdrawal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Processing Time</h3>
                  <p className="text-sm text-muted-foreground">
                    All withdrawals require manual approval and typically take 1-24 hours to process.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Withdrawal Steps</h3>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                    <li>Enter your cryptocurrency wallet address</li>
                    <li>Specify the amount you wish to withdraw</li>
                    <li>Submit the withdrawal request</li>
                    <li>Save your reference ID for tracking</li>
                    <li>Wait for manual approval (1-24 hours)</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Current Balance</h3>
                  <p className="text-2xl font-bold">${walletState.balance?.toFixed(2) || "0.00"}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you encounter any issues with your withdrawal, please contact support.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Reference ID Dialog */}
      <AlertDialog open={!!referenceId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdrawal Request Submitted</AlertDialogTitle>
            <AlertDialogDescription>
              Your withdrawal request has been submitted for processing. Please save your reference ID for tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted/20 rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-1">Reference ID</p>
            <p className="text-xl font-mono font-bold">{referenceId}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDialog}>
              Return to Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Withdrawal;
