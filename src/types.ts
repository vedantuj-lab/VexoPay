export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: any; // Firestore Timestamp
  description?: string;
  createdAt: any;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  studentId?: string; // Optional: link to a specific student account
}

export interface Budget {
  userId: string;
  monthlyLimit: number;
  categoryLimits?: Record<string, number>;
  monthlySavings?: number; // Added: monthly savings goal
  goalName?: string;
  targetAmount?: number;
  currentSaved?: number;
  updatedAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  provider: string;
  amount: number;
  nextRenewal: any; // Firestore Timestamp or Date string
  active: boolean;
  status: 'paid' | 'pending' | 'overdue'; // Added: subscription status
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  theme?: 'dark' | 'light';
  currency?: string; // default 'USD'
  language?: 'en' | 'hi' | 'mr'; // Added for multi-language support
  twoFactorEnabled?: boolean;
  biometricEnabled?: boolean;
  membershipPlan?: 'basic' | 'pro' | 'elite';
  appLogo?: string; // Added: custom app logo
  createdAt: any;
}

export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  isPrimary: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: any;
}

export interface StudentAccount {
  id: string;
  userId: string; // Linked to parent
  name: string;
  studentId: string;
  balance: number;
  avatarUrl?: string;
}

export interface Card {
  id: string;
  userId: string;
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cardType: 'debit' | 'credit' | 'other';
  bankName: string;
  balance: number;
  limit?: number;
}

export interface CalendarNote {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  message: string;
  type: 'important' | 'task' | 'reminder' | 'other';
}

export interface Loan {
  id: string;
  userId: string;
  type: 'housing' | 'education' | 'vehicle' | 'travel' | 'personal';
  amount: number;
  interestRate: number;
  tenure: number; // in months
  status: 'pending' | 'active' | 'closed' | 'rejected';
  bankName: string;
  createdAt: any;
}

export interface BankOffer {
  id: string;
  bankName: string;
  title: string;
  description: string;
  type: 'loan' | 'card' | 'savings';
  interestRate?: number;
  validUntil: any;
}
