import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/lib/types";
import { ArrowDown, ArrowUp, Check, X, Trophy, Coins } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TransactionHistoryProps {
  transactions: Transaction[];
  className?: string;
}

const TransactionHistory = ({ transactions, className = "" }: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        No transactions yet
      </div>
    );
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDown className="h-4 w-4 text-primary" />;
      case 'withdrawal':
        return <ArrowUp className="h-4 w-4 text-destructive" />;
      case 'win':
        return <Trophy className="h-4 w-4 text-[#FFD700]" />;
      case 'loss':
        return <Coins className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-success" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
      case 'pending':
        return (
          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-muted-foreground animate-spin"></div>
        );
      default:
        return null;
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'win':
        return 'Game Win';
      case 'loss':
        return 'Game Loss';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className={`divide-y ${className}`}>
      {transactions.map((tx) => (
        <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="rounded-full p-2 bg-muted">
              {getTransactionIcon(tx.type)}
            </div>
            <div>
              <div className="font-medium">{getTransactionLabel(tx.type)}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`font-medium ${
                tx.type === 'withdrawal' || tx.type === 'loss' 
                  ? 'text-destructive' 
                  : tx.type === 'win' 
                    ? 'text-success' 
                    : ''
              }`}>
                {tx.type === 'withdrawal' || tx.type === 'loss' ? '-' : tx.type === 'win' ? '+' : ''}${tx.amount.toFixed(2)}
              </div>
              <div className="flex items-center justify-end space-x-1 text-xs">
                <span>{getStatusIcon(tx.status)}</span>
                <span className="text-muted-foreground">{tx.status}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
