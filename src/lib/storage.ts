import { UserState, WalletState } from "./types";

const STORAGE_KEYS = {
  USERS: 'moonshot_users',
  WALLET: 'moonshot_wallet',
  USER: 'moonshot_user',
  WALLET_PREFIX: 'moonshot_wallet_'
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
    } catch (error) {
      console.error('Local storage error:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Local storage error:', error);
    }
  }
};

export const storage = {
  getUsers: (): Record<string, any> => {
    const data = fallbackStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : {};
  },

  setUsers: (users: Record<string, any>): void => {
    fallbackStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getUser: (): UserState | null => {
    const data = fallbackStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: UserState): void => {
    fallbackStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getWallet: (): WalletState | null => {
    const data = fallbackStorage.getItem(STORAGE_KEYS.WALLET);
    return data ? JSON.parse(data) : null;
  },

  setWallet: (wallet: WalletState): void => {
    fallbackStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
  },

  getUserWallet: (userId: string): WalletState | null => {
    const data = fallbackStorage.getItem(`${STORAGE_KEYS.WALLET_PREFIX}${userId}`);
    return data ? JSON.parse(data) : null;
  },

  setUserWallet: (userId: string, wallet: WalletState): void => {
    fallbackStorage.setItem(`${STORAGE_KEYS.WALLET_PREFIX}${userId}`, JSON.stringify(wallet));
  },

  clearUserData: (): void => {
    fallbackStorage.removeItem(STORAGE_KEYS.USER);
    fallbackStorage.removeItem(STORAGE_KEYS.WALLET);
  }
}; 