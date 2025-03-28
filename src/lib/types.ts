
export type WalletStatus = 'disconnected' | 'connecting' | 'connected';

export type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  hash?: string;
  referenceId?: string;
};

export type GameState = {
  isPlaying: boolean;
  currentBet?: number;
  lastResult?: 'win' | 'loss';
  winAmount?: number;
  gameCount?: number;
  plinkoPath?: number[];
  multiplier?: number;
  ballCount: number;
};

export type WalletState = {
  status: WalletStatus;
  address?: string;
  balance?: number;
  transactions: Transaction[];
  initialDeposit?: number;
  gameCount?: number;
};

export type UserState = {
  id?: string;
  username?: string;
  email?: string;
  isLoggedIn: boolean;
  isNewUser: boolean;
  depositBonusExpiry?: number; // Timestamp when the bonus expires
  hasDeposited: boolean;
};

export type RiskLevel = 0 | 1 | 2; // 0 = Low, 1 = Medium, 2 = High

export type RiskMultipliers = {
  [key: number]: number[];
};

export type RiskColors = {
  [key: number]: string;
};

export type RiskLabels = {
  [key: number]: string;
};

export type MultiplierRarity = {
  value: number;
  probability: number;
};

export type CryptoOption = "btc" | "xmr";

export type TicketStatus = "open" | "in_progress" | "resolved";

export type SupportTicket = {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  createdAt: number;
  status: TicketStatus;
  response?: string;
  respondedAt?: number;
};
