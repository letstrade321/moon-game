import { toast } from "sonner";
import { UserState, WalletState } from "./types";
import { storage } from "./storage";
import { encryption } from "./encryption";

// Mock authentication service with persistent storage
export const login = async (email: string, password: string): Promise<UserState> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Check for admin account
        if (email === "admin@moonshot.com" && password === "admin123") {
          // Get existing users
          const users = storage.getUsers();
          
          // Create or update admin data
          const adminData: UserState = {
            id: `admin_${Date.now()}`,
            email: "admin@moonshot.com",
            username: "Administrator",
            isLoggedIn: true,
            isNewUser: false,
            hasDeposited: true,
            isAdmin: true
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
          
          // Store admin in users registry with encrypted password
          users["admin@moonshot.com"] = {
            password: encryption.encrypt(password),
            userData: adminData
          };
          storage.setUsers(users);
          
          // Store wallet state
          storage.setUserWallet(adminData.id!, adminWalletState);
          storage.setWallet(adminWalletState);
          
          // Store active user
          storage.setUser(adminData);
          
          resolve(adminData);
          toast.success("Welcome, Administrator!");
          return;
        }
        
        if (email && password) {
          // Check if user exists in storage
          const users = storage.getUsers();
          
          if (users[email] && encryption.decrypt(users[email].password) === password) {
            // Load existing user data
            const userData = users[email].userData;
            
            // Load user's wallet state if exists
            const walletData = storage.getUserWallet(userData.id!);
            if (walletData) {
              storage.setWallet(walletData);
            }
            
            // Update active user
            storage.setUser(userData);
            
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
      } catch (error) {
        console.error('Login error:', error);
        reject(new Error("An error occurred during login"));
        toast.error("An error occurred during login. Please try again.");
      }
    }, 1000);
  });
};

export const signup = async (email: string, password: string): Promise<UserState> => {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      try {
        if (email && password) {
          // Check if user already exists
          const users = storage.getUsers();
          
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
          
          // Store user in users registry with encrypted password
          users[email] = {
            password: encryption.encrypt(password),
            userData
          };
          storage.setUsers(users);
          
          // Store wallet state
          storage.setUserWallet(userData.id!, walletState);
          storage.setWallet(walletState);
          
          // Store active user
          storage.setUser(userData);
          
          resolve(userData);
          toast.success("Account created successfully!");
        } else {
          reject(new Error("Invalid credentials"));
          toast.error("Signup failed. Please try again.");
        }
      } catch (error) {
        console.error('Signup error:', error);
        reject(new Error("An error occurred during signup"));
        toast.error("An error occurred during signup. Please try again.");
      }
    }, 1000);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Clear active user data
      storage.clearUserData();
      toast.success("Logged out successfully");
      resolve();
    } catch (error) {
      console.error('Logout error:', error);
      resolve(); // Still resolve even if there's an error
    }
  });
};

export const getCurrentUser = (): UserState | null => {
  try {
    const user = storage.getUser();
    // If it's an admin user, ensure admin flag is set
    if (user?.email === 'admin@moonshot.com') {
      user.isAdmin = true;
      storage.setUser(user);
    }
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Check if user is logged in
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.isLoggedIn;
};

// Update user deposit status
export const updateUserDepositStatus = (hasDeposited: boolean): void => {
  try {
    const user = getCurrentUser();
    if (user) {
      user.hasDeposited = hasDeposited;
      
      // Update in active user storage
      storage.setUser(user);
      
      // Update in users registry
      const users = storage.getUsers();
      if (users[user.email!]) {
        users[user.email!].userData = user;
        storage.setUsers(users);
      }
    }
  } catch (error) {
    console.error('Update deposit status error:', error);
  }
};
