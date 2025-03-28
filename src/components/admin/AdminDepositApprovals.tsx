import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getPendingTransactions, approveTransaction, denyTransaction } from "@/lib/wallet";
import { Transaction } from "@/lib/types";

const AdminDepositApprovals = () => {
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDeposits = () => {
    const pendingDeposits = getPendingTransactions();
    setDeposits(pendingDeposits);
  };

  useEffect(() => {
    loadDeposits();
    // Refresh every 30 seconds
    const interval = setInterval(loadDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDeposits();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleApprove = (transactionId: string) => {
    if (approveTransaction(transactionId)) {
      loadDeposits();
      toast.success("Deposit approved successfully");
    } else {
      toast.error("Failed to approve deposit");
    }
  };

  const handleDeny = (transactionId: string) => {
    if (denyTransaction(transactionId)) {
      loadDeposits();
      toast.success("Deposit denied");
    } else {
      toast.error("Failed to deny deposit");
    }
  };

  const filteredDeposits = deposits.filter(deposit =>
    deposit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deposit.userId && deposit.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (deposit.userEmail && deposit.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Deposits</CardTitle>
            <CardDescription>Review and approve user deposit requests</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, user ID, or email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
            <div className="col-span-3">Transaction ID</div>
            <div className="col-span-3">User</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {filteredDeposits.length > 0 ? (
            filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="grid grid-cols-12 p-4 border-b">
                <div className="col-span-3 truncate font-mono text-sm">
                  {deposit.id}
                </div>
                <div className="col-span-3 truncate">
                  {deposit.userEmail || deposit.userId || 'Unknown User'}
                </div>
                <div className="col-span-2">${deposit.amount.toFixed(2)}</div>
                <div className="col-span-2">
                  {new Date(deposit.timestamp).toLocaleDateString()}
                </div>
                <div className="col-span-2 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleApprove(deposit.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeny(deposit.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No pending deposits
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDepositApprovals; 