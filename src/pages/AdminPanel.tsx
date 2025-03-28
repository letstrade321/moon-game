import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Users, Wallet, Settings, LogOut } from "lucide-react";
import { Transaction } from "@/lib/types";
import { approveTransaction, denyTransaction, getPendingTransactions } from "@/lib/wallet";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "deny">("approve");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = () => {
    const transactionData = getPendingTransactions();
    setTransactions(transactionData);
  };

  useEffect(() => {
    loadTransactions();
    // Refresh transactions every 30 seconds
    const interval = setInterval(loadTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleConfirmApprove = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setConfirmAction("approve");
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDeny = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setConfirmAction("deny");
    setIsConfirmDialogOpen(true);
  };

  const executeAction = () => {
    if (!selectedTransaction) return;

    if (confirmAction === "approve") {
      approveTransaction(selectedTransaction.id);
      toast.success(`${selectedTransaction.type === "deposit" ? "Deposit" : "Withdrawal"} approved successfully`);
    } else {
      denyTransaction(selectedTransaction.id);
      toast.success(`${selectedTransaction.type === "deposit" ? "Deposit" : "Withdrawal"} denied`);
    }

    // Update local state
    setTransactions(prev => prev.filter(tx => tx.id !== selectedTransaction.id));
    setIsConfirmDialogOpen(false);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "win":
        return "Win";
      case "loss":
        return "Loss";
      default:
        return type;
    }
  };

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('admin_session');
    navigate('/admin-login');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Control Panel</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center">
            <Wallet className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Transactions</CardTitle>
                  <CardDescription>Review and approve deposits and withdrawals</CardDescription>
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
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 font-medium border-b bg-muted/50">
                  <div className="col-span-3">Reference ID</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-3">Actions</div>
                </div>
                
                {transactions.length > 0 ? (
                  transactions.map((transaction, index) => (
                    <div key={transaction.id} className={`grid grid-cols-12 p-4 ${index !== transactions.length - 1 ? "border-b" : ""}`}>
                      <div className="col-span-3 truncate font-mono text-sm">
                        {transaction.referenceId || transaction.id.slice(0, 12)}
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === "deposit" ? "bg-green-100 text-green-800" : 
                          transaction.type === "withdrawal" ? "bg-blue-100 text-blue-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </div>
                      <div className="col-span-2">${transaction.amount.toFixed(2)}</div>
                      <div className="col-span-2">{new Date(transaction.timestamp).toLocaleDateString()}</div>
                      <div className="col-span-3 flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfirmApprove(transaction)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfirmDeny(transaction)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No pending transactions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                User management features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                System settings features coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve Transaction" : "Deny Transaction"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction} this transaction?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction === "approve" ? "default" : "destructive"}
              onClick={executeAction}
            >
              {confirmAction === "approve" ? "Approve" : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel; 