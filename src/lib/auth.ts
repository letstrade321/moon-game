
import { toast } from "sonner";
import { UserState, WalletState } from "./types";

// Mock authentication service with persistent storage
export const login = async (email: string, password: string): Promise<UserState> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      // Check for admin account to create if not exists
      if (email === "admin@moonshot.com" && password === "admin123") {
        // Check if admin exists
        const existingUsers = localStorage.getItem('moonshot_users');
        const users = existingUsers ? JSON.parse(existingUsers) : {};
        
        // If admin doesn't exist, create it
        if (!users[email]) {
          const adminData: UserState = {
            id: `admin_${Date.now()}`,
            email,
            username: "Administrator",
            isLoggedIn: true,
            isNewUser: false,
            hasDeposited: true,
          };
          
          // Initialize admin wallet state
          const adminWalletState: WalletState = {
            status: 'connected',
            address: 'Admin Account',
            balance: 10000, // Admin gets a big balance
            transactions: [],
            initialDeposit: 10000,
            gameCount: 0
          };
          
          // Store admin in users registry
          users[email] = {
            password,
            userData: adminData
          };
          localStorage.setItem('moonshot_users', JSON.stringify(users));
          
          // Store wallet state
          localStorage.setItem(`moonshot_wallet_${adminData.id}`, JSON.stringify(adminWalletState));
          localStorage.setItem('moonshot_wallet', JSON.stringify(adminWalletState));
          
          // Store active user
          localStorage.setItem('moonshot_user', JSON.stringify(adminData));
          
          resolve(adminData);
          toast.success("Welcome, Administrator!");
          return;
        }
      }
      
      if (email && password) {
        // Check if user exists in local storage
        const existingUsers = localStorage.getItem('moonshot_users');
        const users = existingUsers ? JSON.parse(existingUsers) : {};
        
        if (users[email] && users[email].password === password) {
          // Load existing user data
          const userData = users[email].userData;
          
          // Load user's wallet state if exists
          const walletData = localStorage.getItem(`moonshot_wallet_${userData.id}`);
          if (walletData) {
            const wallet = JSON.parse(walletData);
            // Update wallet in localStorage to ensure it's accessible elsewhere
            localStorage.setItem('moonshot_wallet', JSON.stringify(wallet));
          }
          
          // Update active user
          localStorage.setItem('moonshot_user', JSON.stringify(userData));
          
          resolve(userData);
          toast.success("Welcome back!");
        } else {
          reject(new Error("Invalid credentials"));
          toast.error("Login failed. Please check your credentials.");
        }
      } else {
        reject(new Error("Invalid credentials"));
        toast.error("Login failed. Please check your credentials.");
      }
    }, 1000);
  });
};

export const signup = async (email: string, password: string): Promise<UserState> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        // Check if user already exists
        const existingUsers = localStorage.getItem('moonshot_users');
        const users = existingUsers ? JSON.parse(existingUsers) : {};
        
        if (users[email]) {
          reject(new Error("User already exists"));
          toast.error("Email already registered. Please log in instead.");
          return;
        }
        
        // Set 60 minute expiry for deposit bonus
        const bonusExpiryTime = Date.now() + (60 * 60 * 1000);
        
        // Create new user with bonus expiry
        const userData: UserState = {
          id: `user_${Date.now()}`,
          email,
          username: email.split('@')[0],
          isLoggedIn: true,
          isNewUser: true,
          depositBonusExpiry: bonusExpiryTime,
          hasDeposited: false,
        };
        
        // Initialize default wallet state
        const walletState: WalletState = {
          status: 'connected',
          address: userData.username || 'Demo Account',
          balance: 0,
          transactions: [],
          initialDeposit: 0,
          gameCount: 0
        };
        
        // Store user in users registry
        users[email] = {
          password,
          userData
        };
        localStorage.setItem('moonshot_users', JSON.stringify(users));
        
        // Store wallet state
        localStorage.setItem(`moonshot_wallet_${userData.id}`, JSON.stringify(walletState));
        localStorage.setItem('moonshot_wallet', JSON.stringify(walletState));
        
        // Store active user
        localStorage.setItem('moonshot_user', JSON.stringify(userData));
        
        resolve(userData);
        toast.success("Account created successfully!");
      } else {
        reject(new Error("Invalid credentials"));
        toast.error("Signup failed. Please try again.");
      }
    }, 1000);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    // Clear active user from localStorage
    localStorage.removeItem('moonshot_user');
    localStorage.removeItem('moonshot_wallet');
    toast.success("Logged out successfully");
    resolve();
  });
};

export const getCurrentUser = (): UserState | null => {
  const storedUser = localStorage.getItem('moonshot_user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.isLoggedIn;
};

// Update user deposit status
export const updateUserDepositStatus = (hasDeposited: boolean): void => {
  const user = getCurrentUser();
  if (user) {
    user.hasDeposited = hasDeposited;
    
    // Update in active user storage
    localStorage.setItem('moonshot_user', JSON.stringify(user));
    
    // Update in users registry
    const existingUsers = localStorage.getItem('moonshot_users');
    if (existingUsers) {
      const users = JSON.parse(existingUsers);
      if (users[user.email!]) {
        users[user.email!].userData = user;
        localStorage.setItem('moonshot_users', JSON.stringify(users));
      }
    }
  }
};
