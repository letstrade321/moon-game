import { UserState, WalletState, Transaction } from "./types";

const STORAGE_KEYS = {
  USERS: "moonshot_users",
  ACTIVE_USER: "moonshot_active_user",
  WALLET: "moonshot_wallet",
  USER_WALLET: "moonshot_user_wallet",
  TRANSACTIONS: "moonshot_transactions"
};

// Fallback to localStorage if remote storage fails
const fallbackStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Local storage error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
      // Also store in sessionStorage for redundancy
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Local storage error:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Local storage error:', error);
    }
  }
};

const storage = {
  // User management
  getUsers: (): Record<string, any> => {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error('Error getting users:', error);
      return {};
    }
  },

  setUsers: (users: Record<string, any>): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error setting users:', error);
    }
  },

  getUser: (): UserState | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  setUser: (user: UserState): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Wallet management
  getWallet: (): WalletState | null => {
    try {
      const wallet = localStorage.getItem(STORAGE_KEYS.WALLET);
      return wallet ? JSON.parse(wallet) : null;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  },

  setWallet: (wallet: WalletState): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    } catch (error) {
      console.error('Error setting wallet:', error);
    }
  },

  getUserWallet: (userId: string): WalletState | null => {
    try {
      const wallet = localStorage.getItem(`${STORAGE_KEYS.USER_WALLET}_${userId}`);
      return wallet ? JSON.parse(wallet) : null;
    } catch (error) {
      console.error('Error getting user wallet:', error);
      return null;
    }
  },

  setUserWallet: (userId: string, wallet: WalletState): void => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.USER_WALLET}_${userId}`, JSON.stringify(wallet));
    } catch (error) {
      console.error('Error setting user wallet:', error);
    }
  },

  // Transaction management
  getTransactions: (): Transaction[] => {
    try {
      const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  setTransactions: (transactions: Transaction[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error setting transactions:', error);
    }
  },

  // Clear all data
  clearUserData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEYS.WALLET);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
};

export default storage; 