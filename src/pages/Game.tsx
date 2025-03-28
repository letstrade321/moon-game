
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, ArrowDown, Ticket } from "lucide-react";
import Header from "@/components/Header";
import GameInterface from "@/components/GameInterface";
import TransactionHistory from "@/components/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletState } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import BonusTimer from "@/components/BonusTimer";
import SupportTicketModal from "@/components/SupportTicketModal";
import { loadWalletState, initialWalletState, saveWalletState } from "@/lib/wallet";

const Game = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize wallet state from storage or defaults
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const savedState = loadWalletState();
    
    if (savedState) {
      return savedState;
    }
    
    return {
      ...initialWalletState,
      address: user?.username || 'Demo Account',
      balance: user?.hasDeposited ? 1000 : 0,
      initialDeposit: user?.hasDeposited ? 1000 : 0,
    };
  });

  // Update wallet state when it changes and save to localStorage
  useEffect(() => {
    saveWalletState(walletState);
  }, [walletState]);

  // Only update from user data if we don't have a saved state
  useEffect(() => {
    if (user && !loadWalletState()) {
      setWalletState(prev => ({
        ...prev,
        address: user.username || 'Demo Account',
        balance: user.hasDeposited ? 1000 : 0,
        initialDeposit: user.hasDeposited ? 1000 : 0,
      }));
    }
  }, [user]);

  const handleDeposit = () => {
    navigate('/deposit');
  };
  
  const handleWithdrawal = () => {
    navigate('/withdraw');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState} 
        openWalletModal={() => {}} 
      />
      
      <main className="page-container pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Moonballs</h1>
              <p className="text-muted-foreground">Blast off to incredible wins</p>
            </div>
          </div>
          
          {user?.isNewUser && (
            <div className="hidden md:block">
              <BonusTimer />
            </div>
          )}
          
          <div className="flex space-x-4">
            <Button 
              onClick={handleWithdrawal} 
              size="lg" 
              variant="outline"
              className="hover:bg-muted/20 transition-colors"
            >
              <ArrowDown className="mr-2 h-5 w-5" /> Withdraw
            </Button>
            
            <Button 
              onClick={handleDeposit} 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <Wallet className="mr-2 h-5 w-5" /> Deposit Now
            </Button>
          </div>
        </div>
        
        {user?.isNewUser && (
          <div className="md:hidden mb-6">
            <BonusTimer />
          </div>
        )}
        
        {!user?.hasDeposited && (
          <Card className="mb-8 border border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Your next 1000x is here.</h3>
                  <p className="text-muted-foreground">Make a deposit to start playing Moonballs</p>
                </div>
                <Button 
                  onClick={handleDeposit} 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 transition-opacity"
                >
                  <Wallet className="mr-2 h-5 w-5" /> Make Your First Deposit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mx-auto max-w-4xl mb-12">
          <GameInterface walletState={walletState} setWalletState={setWalletState} />
        </div>
        
        <Card className="glass max-w-5xl mx-auto mb-12">
          <CardHeader>
            <CardTitle>Game Rules</CardTitle>
            <CardDescription>
              How to play and win
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>Select your risk level to determine payout multipliers</li>
              <li>Enter the amount you want to bet</li>
              <li>Click "Drop Ball" to start the game</li>
              <li>Watch the ball bounce through the pins</li>
              <li>Win up to 2000x your bet depending on where the ball lands</li>
              <li>Higher risk means higher potential rewards but more chance of losing</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="glass mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Game History</CardTitle>
              <CardDescription>
                Your recent game results
              </CardDescription>
            </div>
            <SupportTicketModal 
              trigger={
                <Button variant="outline" size="sm" className="flex items-center">
                  <Ticket className="mr-2 h-4 w-4" /> Need Support?
                </Button>
              } 
            />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              <TransactionHistory transactions={walletState.transactions} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Game;
