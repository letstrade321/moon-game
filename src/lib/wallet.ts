import { Transaction, WalletState } from "./types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { getCurrentUser, updateUserDepositStatus } from "./auth";

// Default initial wallet state
export const initialWalletState: WalletState = {
  status: 'connected',
  address: 'Demo Account',
  balance: 0,
  transactions: [],
  initialDeposit: 0,
  gameCount: 0
};

// Load wallet state from local storage
export const loadWalletState = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const walletData = localStorage.getItem(`moonshot_wallet_${user.id}`);
  return walletData ? JSON.parse(walletData) : null;
};

// Save wallet state to local storage
export const saveWalletState = (walletState: any) => {
  const user = getCurrentUser();
  if (!user) return;
  
  localStorage.setItem(`moonshot_wallet_${user.id}`, JSON.stringify(walletState));
  localStorage.setItem('moonshot_wallet', JSON.stringify(walletState)); // Also save to active wallet
};

// Get all pending transactions across users
export const getPendingTransactions = (): Transaction[] => {
  // Get all users
  const storedUsers = localStorage.getItem('moonshot_users');
  if (!storedUsers) return [];
  
  const users = JSON.parse(storedUsers);
  let pendingTransactions: Transaction[] = [];
  
  // Loop through each user's wallet to find pending transactions
  Object.values(users).forEach((userData: any) => {
    const userId = userData.userData.id;
    const walletData = localStorage.getItem(`moonshot_wallet_${userId}`);
    
    if (walletData) {
      const wallet = JSON.parse(walletData);
      const userPendingTransactions = wallet.transactions.filter(
        (tx: Transaction) => tx.status === 'pending'
      );
      
      // Add user information to each transaction
      const transactionsWithUser = userPendingTransactions.map(tx => ({
        ...tx,
        userId,
        userEmail: userData.userData.email,
        username: userData.userData.username
      }));
      
      pendingTransactions = [...pendingTransactions, ...transactionsWithUser];
    }
  });
  
  return pendingTransactions;
};

// Approve a transaction
export const approveTransaction = (transactionId: string): boolean => {
  // Get all users
  const storedUsers = localStorage.getItem('moonshot_users');
  if (!storedUsers) return false;
  
  const users = JSON.parse(storedUsers);
  let approved = false;
  
  // Loop through each user to find and approve the transaction
  Object.values(users).forEach((userData: any) => {
    const userId = userData.userData.id;
    const walletData = localStorage.getItem(`moonshot_wallet_${userId}`);
    
    if (walletData) {
      const wallet = JSON.parse(walletData);
      const txIndex = wallet.transactions.findIndex((tx: Transaction) => tx.id === transactionId);
      
      if (txIndex >= 0) {
        // Found the transaction
        const transaction = wallet.transactions[txIndex];
        transaction.status = 'completed';
        
        // Update wallet balance for deposits
        if (transaction.type === 'deposit') {
          wallet.balance += transaction.amount;
          
          // Mark user as having deposited
          const user = users[userData.userData.email];
          if (user) {
            user.userData.hasDeposited = true;
            userData.userData.hasDeposited = true;
            updateUserDepositStatus(true);
          }
        }
        
        // Save updated wallet
        localStorage.setItem(`moonshot_wallet_${userId}`, JSON.stringify(wallet));
        approved = true;
      }
    }
  });
  
  // Save updated users
  if (approved) {
    localStorage.setItem('moonshot_users', JSON.stringify(users));
  }
  
  return approved;
};

// Deny a transaction
export const denyTransaction = (transactionId: string): boolean => {
  // Get all users
  const storedUsers = localStorage.getItem('moonshot_users');
  if (!storedUsers) return false;
  
  const users = JSON.parse(storedUsers);
  let denied = false;
  
  // Loop through each user to find and deny the transaction
  Object.values(users).forEach((userData: any) => {
    const userId = userData.userData.id;
    const walletData = localStorage.getItem(`moonshot_wallet_${userId}`);
    
    if (walletData) {
      const wallet = JSON.parse(walletData);
      const txIndex = wallet.transactions.findIndex((tx: Transaction) => tx.id === transactionId);
      
      if (txIndex >= 0) {
        // Found the transaction
        const transaction = wallet.transactions[txIndex];
        transaction.status = 'failed';
        
        // For withdrawals, refund the amount back to balance
        if (transaction.type === 'withdrawal') {
          wallet.balance += transaction.amount;
        }
        
        // Save updated wallet
        localStorage.setItem(`moonshot_wallet_${userId}`, JSON.stringify(wallet));
        denied = true;
      }
    }
  });
  
  return denied;
};

// Mock cryptocurrency deposit function
export const depositCrypto = async (amount: number): Promise<Transaction> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = getCurrentUser();
      if (!user) {
        toast.error("User not logged in");
        return;
      }

      const transaction: Transaction = {
        id: uuidv4(),
        type: 'deposit',
        amount,
        timestamp: Date.now(),
        status: 'pending',
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      };
      
      // Get current wallet state
      const walletData = localStorage.getItem(`moonshot_wallet_${user.id}`);
      const wallet = walletData ? JSON.parse(walletData) : initialWalletState;
      
      // Add transaction to wallet
      wallet.transactions.push(transaction);
      
      // Save updated wallet
      localStorage.setItem(`moonshot_wallet_${user.id}`, JSON.stringify(wallet));
      localStorage.setItem('moonshot_wallet', JSON.stringify(wallet));
      
      toast.success(`Deposit request of $${amount.toFixed(2)} submitted for approval`);
      resolve(transaction);
    }, 1500);
  });
};

// Mock crypto withdrawal function
export const withdrawCrypto = async (amount: number, currentBalance: number): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (amount <= 0) {
        toast.error("Please enter a valid amount");
        reject(new Error("Invalid amount"));
        return;
      }
      
      if (amount > currentBalance) {
        toast.error("Insufficient balance");
        reject(new Error("Insufficient balance"));
        return;
      }
      
      const transaction: Transaction = {
        id: uuidv4(),
        type: 'withdrawal',
        amount,
        timestamp: Date.now(),
        status: 'pending',
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      };
      
      toast.success(`Withdrawal request of $${amount.toFixed(2)} submitted`);
      resolve(transaction);
    }, 1500);
  });
};

// Register game result
export const registerGameResult = async (result: 'win' | 'loss', amount: number): Promise<Transaction> => {
  return {
    id: uuidv4(),
    type: result,
    amount,
    timestamp: Date.now(),
    status: 'completed'
  };
};

// Send email for deposit approval
export const sendDepositApprovalEmail = async (data: { 
  email: string | undefined;
  amount: string;
  txId: string;
  crypto: string;
}): Promise<string> => {
  // In a real app, this would send an actual email
  console.log("Email would be sent to: ticketmaster251200@gmail.com");
  console.log("Deposit details:", {
    user: data.email,
    amount: data.amount,
    txId: data.txId,
    crypto: data.crypto,
    timestamp: new Date().toISOString()
  });
  
  // Return a reference ID
  return `DEP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
};

// Send email for withdrawal approval
export const sendWithdrawalApprovalEmail = async (data: {
  email: string | undefined;
  amount: string;
  walletAddress: string;
  crypto: string;
}): Promise<string> => {
  // In a real app, this would send an actual email
  console.log("Email would be sent to: ticketmaster251200@gmail.com");
  console.log("Withdrawal details:", {
    user: data.email,
    amount: data.amount,
    walletAddress: data.walletAddress,
    crypto: data.crypto,
    timestamp: new Date().toISOString()
  });
  
  // Return a reference ID
  return `WD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
};
