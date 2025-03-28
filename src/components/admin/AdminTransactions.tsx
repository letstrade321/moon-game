
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoveDown, MoveUp, Check, X } from "lucide-react";
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

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "deny">("approve");

  useEffect(() => {
    // Load pending transactions
    const transactionData = getPendingTransactions();
    setTransactions(transactionData);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc"); // Default to newest first for timestamp
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.referenceId && tx.referenceId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "timestamp") {
      return sortOrder === "asc" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    } else if (sortBy === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === "type") {
      return sortOrder === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
    }
    return 0;
  });

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardDescription>Review and approve deposits and withdrawals</CardDescription>
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
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("type")}
              >
                Type
                {sortBy === "type" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount
                {sortBy === "amount" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div 
                className="col-span-2 flex items-center cursor-pointer"
                onClick={() => handleSort("timestamp")}
              >
                Date
                {sortBy === "timestamp" && (
                  sortOrder === "asc" ? <MoveUp className="ml-1 h-4 w-4" /> : <MoveDown className="ml-1 h-4 w-4" />
                )}
              </div>
              <div className="col-span-3">Actions</div>
            </div>
            
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction, index) => (
                <div key={transaction.id} className={`grid grid-cols-12 p-4 ${index !== sortedTransactions.length - 1 ? "border-b" : ""}`}>
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
                      className="flex items-center border-green-500 hover:bg-green-50 text-green-600" 
                      onClick={() => handleConfirmApprove(transaction)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center border-red-500 hover:bg-red-50 text-red-600" 
                      onClick={() => handleConfirmDeny(transaction)}
                    >
                      <X className="h-4 w-4 mr-1" /> Deny
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No pending transactions found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" ? "Approve Transaction" : "Deny Transaction"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction} this {selectedTransaction?.type}?
              {selectedTransaction && (
                <div className="mt-2 p-3 bg-muted/30 rounded-md">
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="font-medium">Amount:</div>
                    <div>${selectedTransaction.amount.toFixed(2)}</div>
                    <div className="font-medium">Reference:</div>
                    <div className="font-mono">{selectedTransaction.referenceId || selectedTransaction.id.slice(0, 12)}</div>
                    <div className="font-medium">Date:</div>
                    <div>{new Date(selectedTransaction.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeAction}
              variant={confirmAction === "approve" ? "default" : "destructive"}
            >
              {confirmAction === "approve" ? "Approve" : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTransactions;
