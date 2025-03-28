import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Copy, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import BonusTimer from "@/components/BonusTimer";
import { loadWalletState, saveWalletState, sendDepositApprovalEmail } from "@/lib/wallet";
import { Transaction, CryptoOption } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const formSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 20, {
    message: "Minimum deposit amount is $20"
  }),
  txId: z.string().min(6, "Transaction ID must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// Mock crypto conversion rates
const CRYPTO_RATES = {
  btc: 65000, // 1 BTC = $65,000
  xmr: 170    // 1 XMR = $170
};

const Deposit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>("btc");
  const [countdown, setCountdown] = useState(30 * 60); // 30 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [walletState, setWalletState] = useState(() => loadWalletState() || {
    status: 'connected',
    address: user?.username || 'Demo Account',
    balance: 0,
    transactions: [],
  });
  
  // Get wallet addresses
  const walletAddresses = {
    btc: "bc1q5gzl43p5w5sxqrsl2nlrcgv49jxe5cqryxe4tq",
    xmr: "45HDWvpWjRGb3fDZ5ztonz2frYBqzcRcEQRnjDso2g7NRH5aVZdQuZdheCXGka6C9QT69WeMtc49bS3JEPuz3z5VDGErApM",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      txId: "",
    },
  });

  useEffect(() => {
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Deposit session expired. Redirecting to game page.");
          setTimeout(() => navigate("/game"), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  // Update crypto amount whenever USD amount changes
  useEffect(() => {
    const usdAmount = parseFloat(form.watch("amount") || "0");
    if (!isNaN(usdAmount) && usdAmount > 0) {
      const rate = CRYPTO_RATES[selectedCrypto];
      const amount = (usdAmount / rate).toFixed(8);
      setCryptoAmount(amount);
    } else {
      setCryptoAmount("");
    }
  }, [form.watch("amount"), selectedCrypto]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddresses[selectedCrypto]);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Send email for approval
      const refId = await sendDepositApprovalEmail({
        email: user?.email,
        amount: data.amount,
        txId: data.txId,
        crypto: selectedCrypto.toUpperCase(),
      });
      
      // Create a pending transaction
      const newTransaction: Transaction = {
        id: `dep-${Date.now()}`,
        type: 'deposit',
        amount: parseFloat(data.amount),
        timestamp: Date.now(),
        status: 'pending',
        hash: data.txId,
        referenceId: refId
      };
      
      // Update wallet state with the new transaction
      const updatedWalletState = {
        ...walletState,
        transactions: [newTransaction, ...walletState.transactions]
      };
      
      // Save updated wallet state
      saveWalletState(updatedWalletState);
      setWalletState(updatedWalletState);
      setReferenceId(refId);
      
      toast.success("Deposit request submitted successfully!");
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to submit deposit request. Please try again.");
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
              <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
              <p className="text-muted-foreground">Add crypto to your account</p>
            </div>
          </div>
          
          {user?.isNewUser && <BonusTimer compact />}
          
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Session expires in: </span>
            <span className="ml-2 font-mono font-bold">{formatTime(countdown)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>Choose your preferred cryptocurrency</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="btc" onValueChange={(value) => setSelectedCrypto(value as CryptoOption)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="btc" className="w-full">Bitcoin (BTC)</TabsTrigger>
                    <TabsTrigger value="xmr" className="w-full">Monero (XMR)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="btc" className="mt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">BTC Deposit Address</h3>
                      <div className="relative">
                        <div className="p-4 bg-muted rounded-lg font-mono text-xs break-all">
                          {walletAddresses.btc}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={copyAddress}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Only send BTC to this address. Minimum deposit: $20 (≈ {(20 / CRYPTO_RATES.btc).toFixed(8)} BTC).
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="xmr" className="mt-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">XMR Deposit Address</h3>
                      <div className="relative">
                        <div className="p-4 bg-muted rounded-lg font-mono text-xs break-all">
                          {walletAddresses.xmr}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={copyAddress}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Only send XMR to this address. Minimum deposit: $20 (≈ {(20 / CRYPTO_RATES.xmr).toFixed(8)} XMR).
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="0.00" min="20" />
                              <div className="absolute right-3 top-2.5 text-muted-foreground">
                                USD
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Crypto conversion display */}
                    {cryptoAmount && (
                      <div className="bg-muted/20 p-3 rounded-md flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Approx. {selectedCrypto.toUpperCase()} amount:</span>
                          <div className="font-mono font-medium">
                            {cryptoAmount} {selectedCrypto.toUpperCase()}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" title="Refresh rate">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="txId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID (after sending)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter transaction ID" />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground mt-1">
                            Enter the transaction ID after you've sent the payment
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="mr-2">Processing</span>
                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
                        </span>
                      ) : (
                        "Submit Deposit Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-5">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Deposit Information</CardTitle>
                <CardDescription>Important details about your deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Processing Time</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCrypto === "btc" 
                      ? "Bitcoin deposits require 2 confirmations (approximately 20 minutes)." 
                      : "Monero deposits require 10 confirmations (approximately 20 minutes)."}
                  </p>
                </div>
                
                {user?.isNewUser && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h3 className="font-medium mb-1 text-primary">New Player Bonus Active!</h3>
                    <p className="text-sm">
                      You're eligible for a 50% bonus on your first deposit.
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-1">Deposit Steps</h3>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                    <li>Copy the {selectedCrypto.toUpperCase()} address above</li>
                    <li>Send your deposit to this address from your wallet</li>
                    <li>Enter the transaction ID from your wallet</li>
                    <li>Submit the form and wait for confirmation</li>
                    <li>Once approved, your balance will be updated</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    If you encounter any issues with your deposit, please contact support.
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
            <AlertDialogTitle>Deposit Request Submitted</AlertDialogTitle>
            <AlertDialogDescription>
              Your deposit request has been submitted for processing. Please save your reference ID for tracking.
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

export default Deposit;
