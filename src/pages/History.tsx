
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, ArrowUpRight, ArrowDownRight, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Transaction } from "@/lib/types";
import { loadWalletState } from "@/lib/wallet";

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletState, setWalletState] = useState(() => loadWalletState() || {
    status: 'connected',
    address: user?.username || 'Demo Account',
    balance: 0,
    transactions: [],
  });
  
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredTransactions = walletState.transactions.filter(tx => {
    // First apply type filter
    if (filter !== "all" && tx.type !== filter) {
      return false;
    }
    
    // Then apply search term if any
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.id.toLowerCase().includes(searchLower) ||
        (tx.referenceId && tx.referenceId.toLowerCase().includes(searchLower)) ||
        (tx.hash && tx.hash.toLowerCase().includes(searchLower)) ||
        tx.amount.toString().includes(searchLower) ||
        tx.status.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Group transactions by date
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.timestamp).toLocaleDateString();
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(tx);
  });
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-amber-500" />;
      case 'win':
        return <Trophy className="h-4 w-4 text-blue-500" />;
      case 'loss':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        walletState={walletState} 
        setWalletState={setWalletState}
        openWalletModal={() => {}} 
      />
      
      <main className="page-container pt-24">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/game")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">View your past deposits, withdrawals, and game results</p>
          </div>
        </div>
        
        <Card className="glass">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>View all your account activity</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select defaultValue="all" onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="deposit">Deposits</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="win">Wins</SelectItem>
                    <SelectItem value="loss">Losses</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedTransactions).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedTransactions).map(([date, transactions]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">{date}</h3>
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card/50 backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-3 mb-3 sm:mb-0">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card flex items-center justify-center">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium capitalize">{tx.type}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(tx.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {tx.hash ? (
                                  <span className="font-mono">
                                    ID: {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                                  </span>
                                ) : tx.referenceId ? (
                                  <span className="font-mono">
                                    Ref: {tx.referenceId}
                                  </span>
                                ) : (
                                  <span className="font-mono">
                                    ID: {tx.id.slice(0, 8)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="text-right">
                              <div className={`font-medium ${
                                tx.type === 'win' ? 'text-green-500' : 
                                tx.type === 'loss' ? 'text-red-500' : ''
                              }`}>
                                {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}
                                ${tx.amount.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(tx.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No transactions found</p>
                <p className="text-sm">
                  {searchTerm || filter !== "all" 
                    ? "Try adjusting your filters" 
                    : "Make a deposit or play a game to start building your history"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default History;
