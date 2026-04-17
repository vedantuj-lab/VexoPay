import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Repeat, 
  Settings as SettingsIcon, 
  Bell, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PiggyBank,
  Calendar,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
  Smartphone,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Briefcase,
  GraduationCap,
  Car,
  Plane,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard as CardIcon,
  Banknote,
  Languages
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { cn } from '../lib/utils';
import { 
  Transaction, 
  Budget, 
  Subscription, 
  Notification as NotificationType, 
  StudentAccount, 
  Card, 
  CalendarNote, 
  Loan,
  UserProfile,
  TransactionType
} from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AIChat } from './AIChat';

// --- Translations ---
const translations = {
  en: {
    dashboard: "Pulse",
    wallet: "Vault",
    students: "Heirs",
    subscriptions: "Streams",
    loans: "Leverage",
    settings: "Controls",
    income: "Harvest",
    expenses: "Outflow",
    recent_transactions: "Journey",
    total_balance: "Empire Value",
    budget_status: "Boundaries",
    quick_actions: "Impulse",
    currency_rates: "World Pulse",
    notifications: "Echoes",
    apply_loan: "Request Leverage",
    add_student: "Enlist Heir",
    add_card: "Forge Card",
    security: "Fortress",
    two_factor: "Dual-Key Auth",
    biometric: "Bio-Signature",
    language: "Dialect",
    save_changes: "Seal Records",
    pay_now: "Settle Stream",
    transfer: "Distribute Wealth",
    limit_control: "Tether Spirits",
    membership: "Caste",
    basic: "Citizen",
    pro: "Noble",
    elite: "Sovereign"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    wallet: "तिजोरी",
    students: "छात्र",
    subscriptions: "सदस्यता",
    loans: "ऋण",
    settings: "सेटिंग्स",
    income: "आय",
    expenses: "व्यय",
    recent_transactions: "लेन-देन",
    total_balance: "कुल शेष",
    budget_status: "बजट",
    quick_actions: "त्वरित कार्रवाई",
    currency_rates: "मुद्रा दरें",
    notifications: "सूचनाएं",
    apply_loan: "ऋण आवेदन",
    add_student: "छात्र जोड़ें",
    add_card: "कार्ड जोड़ें",
    security: "सुरक्षा",
    two_factor: "दो-चरणीय प्रमाणीकरण",
    biometric: "बायोमेट्रिक",
    language: "भाषा",
    save_changes: "बदलाव सहेजें",
    pay_now: "अभी भुगतान करें",
    transfer: "हस्तांतरण",
    limit_control: "सीमा नियंत्रण",
    membership: "सदस्यता",
    basic: "बुनियादी",
    pro: "प्रो",
    elite: "एलीट"
  },
  mr: {
    dashboard: "मुख्यपृष्ठ",
    wallet: "किसा",
    students: "विद्यार्थी",
    subscriptions: "वर्गणी",
    loans: "कर्ज",
    settings: "नियमन",
    income: "उत्पन्न",
    expenses: "खर्च",
    recent_transactions: "अलीकडचे व्यवहार",
    total_balance: "एकूण रक्कम",
    budget_status: "बजेट",
    quick_actions: "झटपट क्रिया",
    currency_rates: "चलन दर",
    notifications: "सूचना",
    apply_loan: "कर्जासाठी अर्ज",
    add_student: "विद्यार्थी जोडा",
    add_card: "कार्ड जोडा",
    security: "सुरक्षा",
    two_factor: "दुहेरी प्रमाणीकरण",
    biometric: "बायोमेट्रिक",
    language: "भाषा",
    save_changes: "बदल जतन करा",
    pay_now: "आत्ता पैसे द्या",
    transfer: "पैसे पाठवा",
    limit_control: "मर्यादा नियंत्रण",
    membership: "सदस्यत्व",
    basic: "साधं",
    pro: "प्रो",
    elite: "एलिट"
  }
};

type Language = keyof typeof translations;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // --- Real-time Data States ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [calendarNotes, setCalendarNotes] = useState<CalendarNote[]>([]);

  // --- Modal States ---
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isApplyingLoan, setIsApplyingLoan] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddingSub, setIsAddingSub] = useState(false);

  // --- Form States ---
  const [txForm, setTxForm] = useState({ type: 'expense' as TransactionType, amount: '', category: '', description: '' });
  const [studentForm, setStudentForm] = useState({ name: '', studentId: '', balance: '' });
  const [loanForm, setLoanForm] = useState({ type: 'personal' as Loan['type'], amount: '', bankName: '', tenure: '12' });
  const [cardForm, setCardForm] = useState({ holder: '', number: '', type: 'debit' as Card['cardType'], bank: '', balance: '' });

  // --- Effects for Data ---
  useEffect(() => {
    if (!user) return;

    const unsubTx = onSnapshot(
      query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(50)),
      (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
    );

    const unsubSubs = onSnapshot(
      query(collection(db, 'subscriptions'), where('userId', '==', user.uid)),
      (snap) => setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions')
    );

    const unsubStudents = onSnapshot(
      query(collection(db, 'students'), where('userId', '==', user.uid)),
      (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentAccount))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'students')
    );

    const unsubCards = onSnapshot(
      query(collection(db, 'cards'), where('userId', '==', user.uid)),
      (snap) => setCards(snap.docs.map(d => ({ id: d.id, ...d.data() } as Card))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'cards')
    );

    const unsubLoans = onSnapshot(
      query(collection(db, 'loans'), where('userId', '==', user.uid)),
      (snap) => setLoans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Loan))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'loans')
    );

    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          if (data.language) setLang(data.language);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'users')
    );

    const unsubNotifications = onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20)),
      (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationType))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    return () => {
      unsubTx();
      unsubSubs();
      unsubStudents();
      unsubCards();
      unsubLoans();
      unsubProfile();
      unsubNotifications();
    };
  }, [user]);

  // --- Handlers ---
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        ...txForm,
        amount: Number(txForm.amount),
        date: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setIsAddingTransaction(false);
      setTxForm({ type: 'expense', amount: '', category: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'students'), {
        userId: user.uid,
        ...studentForm,
        balance: Number(studentForm.balance)
      });
      setIsAddingStudent(false);
      setStudentForm({ name: '', studentId: '', balance: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'students');
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'loans'), {
        userId: user.uid,
        ...loanForm,
        amount: Number(loanForm.amount),
        interestRate: 8.5, // Default for demo
        tenure: Number(loanForm.tenure),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsApplyingLoan(false);
      setLoanForm({ type: 'personal', amount: '', bankName: '', tenure: '12' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'loans');
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'cards'), {
        userId: user.uid,
        cardHolderName: cardForm.holder,
        cardNumber: cardForm.number,
        cardType: cardForm.type,
        bankName: cardForm.bank,
        balance: Number(cardForm.balance),
        expiryDate: '12/28'
      });
      setIsAddingCard(false);
      setCardForm({ holder: '', number: '', type: 'debit', bank: '', balance: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'cards');
    }
  };

  // --- Derived Data ---
  const totalBalance = useMemo(() => {
      const cardBal = cards.reduce((acc, c) => acc + c.balance, 0);
      const studentBal = students.reduce((acc, s) => acc + s.balance, 0);
      return cardBal + studentBal;
  }, [cards, students]);

  const chartData = useMemo(() => {
    // Basic aggregation for demonstration
    return [
      { name: 'Mon', income: 400, expense: 240 },
      { name: 'Tue', income: 300, expense: 139 },
      { name: 'Wed', income: 200, expense: 980 },
      { name: 'Thu', income: 278, expense: 390 },
      { name: 'Fri', income: 189, expense: 480 },
      { name: 'Sat', income: 239, expense: 380 },
      { name: 'Sun', income: 349, expense: 430 },
    ];
  }, [transactions]);

  // --- UI Components ---
  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex w-full items-center gap-4 px-6 py-4 transition-all duration-300 relative group",
        activeTab === id ? "text-white" : "text-text-sub hover:text-white"
      )}
    >
      {activeTab === id && (
        <motion.div 
          layoutId="active-nav"
          className="absolute left-0 w-1 h-8 bg-accent rounded-r-full"
        />
      )}
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        activeTab === id ? "bg-accent/20" : "group-hover:bg-card-bg"
      )}>
        <Icon size={20} />
      </div>
      <span className="font-display font-black tracking-tight uppercase text-xs">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-text-main overflow-hidden font-sans">
      {/* --- Sidebar --- */}
      <aside className="w-72 bg-card-bg border-r border-border flex flex-col z-50">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-accent/20">
              <span className="text-xl font-black italic">V.</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase font-display italic">VexoPay</span>
          </div>
          <div className="px-1">
             <div className="h-[1px] w-12 bg-accent/30 rounded-full" />
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem id="overview" icon={LayoutDashboard} label={t.dashboard} />
          <NavItem id="wallet" icon={Wallet} label={t.wallet} />
          <NavItem id="students" icon={Users} label={t.students} />
          <NavItem id="subscriptions" icon={Repeat} label={t.subscriptions} />
          <NavItem id="loans" icon={Briefcase} label={t.loans} />
          <NavItem id="settings" icon={SettingsIcon} label={t.settings} />
        </nav>

        <div className="mt-auto p-6 space-y-6">
          {profile?.membershipPlan && (
            <div className="glass-card p-5 border-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                <Shield size={48} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent font-mono mb-1">{t.membership}</h4>
              <p className="font-display font-black text-lg tracking-tight uppercase">
                 {t[profile.membershipPlan]}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-text-sub font-black tracking-widest uppercase">
                <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                Live Status
              </div>
            </div>
          )}

          <button 
            onClick={() => logout()}
            className="flex items-center gap-4 w-full px-4 py-3 text-danger hover:bg-danger/10 rounded-2xl transition-all duration-300 font-black tracking-tight uppercase text-xs"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-6 flex items-center justify-between">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Manifest your destiny..." 
              className="bg-card-bg border border-border rounded-2xl pl-12 pr-6 py-3 w-80 outline-none focus:ring-2 ring-accent/20 focus:border-accent transition-all font-medium text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Currency Rates Placeholder */}
            <div className="hidden lg:flex items-center gap-6 px-4 py-2 border-x border-border">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-text-sub">USD/INR</span>
                  <span className="text-sm font-mono font-bold text-success">₹83.24</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-text-sub">BTC/USD</span>
                  <span className="text-sm font-mono font-bold text-danger">$64.2k</span>
               </div>
            </div>

            <div className="relative">
              <button className="p-3 bg-card-bg border border-border rounded-2xl text-text-sub hover:text-white transition-all relative">
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && (
                   <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-card-bg" />
                )}
              </button>
            </div>

            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 p-1.5 pr-4 bg-card-bg border border-border rounded-2xl hover:border-accent/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-accent/20 flex items-center justify-center border border-accent/20 group-hover:rotate-6 transition-transform">
                {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <UserIcon size={20} />}
              </div>
              <div className="flex flex-col items-start translate-y-[-1px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-sub leading-none mb-1">Human ID</span>
                <span className="text-xs font-black tracking-tight">{user?.displayName || 'Unknown Body'}</span>
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-10 max-w-7xl w-full mx-auto space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-10">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-card p-8 border-accent/10 relative group overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                          <DollarSign size={80} />
                       </div>
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-sub mb-4">{t.total_balance}</h4>
                       <p className="text-4xl font-display font-black tracking-tight mb-4 stats-value">₹{totalBalance.toLocaleString()}</p>
                       <div className="flex items-center gap-2 text-xs font-black text-success tracking-tight uppercase">
                          <ArrowUpRight size={14} />
                          <span>+12.4% Impulse</span>
                       </div>
                    </div>

                    <div className="glass-card p-8 border-success/10 group overflow-hidden">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-sub mb-4">{t.income}</h4>
                       <p className="text-4xl font-display font-black tracking-tight mb-4 stats-value text-success">₹84,200</p>
                       <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-success w-[70%]" />
                       </div>
                    </div>

                    <div className="glass-card p-8 border-danger/10 group overflow-hidden">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-sub mb-4">{t.expenses}</h4>
                       <p className="text-4xl font-display font-black tracking-tight mb-4 stats-value text-danger">₹32,150</p>
                       <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-danger w-[45%]" />
                       </div>
                    </div>

                    <div className="glass-card p-8 border-highlight/10 group overflow-hidden">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-sub mb-4">{t.budget_status}</h4>
                       <p className="text-4xl font-display font-black tracking-tight mb-4 stats-value text-highlight">68%</p>
                       <div className="flex items-center gap-2 text-xs font-black text-text-sub tracking-widest uppercase">
                          <Clock size={14} />
                          <span>12 Days Left</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Chart */}
                    <div className="lg:col-span-2 glass-card p-8 border-border">
                        <div className="flex items-center justify-between mb-10">
                           <h3 className="text-xl font-black uppercase tracking-tight italic">Flux Capacity</h3>
                           <div className="flex gap-2">
                              {['D', 'W', 'M'].map(p => (
                                <button key={p} className={cn(
                                  "px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                  p === 'W' ? "bg-accent text-white" : "bg-border text-text-sub hover:text-white"
                                )}>{p}</button>
                              ))}
                           </div>
                        </div>
                        <div className="h-[400px] w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                 <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#5c67ff" stopOpacity={0.3}/>
                                       <stop offset="95%" stopColor="#5c67ff" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1d212d" />
                                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                                 <Tooltip 
                                    contentStyle={{backgroundColor: '#14161f', border: '1px solid #1d212d', borderRadius: '16px'}}
                                    itemStyle={{color: '#fff', fontSize: '12px', fontWeight: 'bold'}}
                                 />
                                 <Area type="monotone" dataKey="income" stroke="#5c67ff" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                                 <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} fillOpacity={0} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions & Recent */}
                    <div className="space-y-10">
                       <div className="glass-card p-8 border-border">
                          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-accent mb-8">{t.quick_actions}</h3>
                          <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setIsAddingTransaction(true)}
                                className="flex flex-col items-center justify-center p-6 bg-accent/10 border border-accent/20 rounded-[2rem] hover:bg-accent transition-all group gap-4"
                             >
                                <div className="p-4 bg-accent/20 rounded-[1.5rem] group-hover:bg-white/20 transition-colors">
                                   <Plus className="text-accent group-hover:text-white" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight group-hover:text-white">Record</span>
                             </button>
                             <button 
                                onClick={() => setIsAddingStudent(true)}
                                className="flex flex-col items-center justify-center p-6 bg-card-bg border border-border rounded-[2rem] hover:border-accent transition-all group gap-4"
                             >
                                <div className="p-4 bg-border rounded-[1.5rem] group-hover:bg-accent/20 transition-colors">
                                   <Users className="text-text-sub group-hover:text-accent" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-text-sub group-hover:text-white">Heir</span>
                             </button>
                             <button className="flex flex-col items-center justify-center p-6 bg-card-bg border border-border rounded-[2rem] hover:border-accent transition-all group gap-4">
                                <div className="p-4 bg-border rounded-[1.5rem] group-hover:bg-accent/20 transition-colors">
                                   <ArrowUpRight className="text-text-sub group-hover:text-accent" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-text-sub group-hover:text-white">Send</span>
                             </button>
                             <button className="flex flex-col items-center justify-center p-6 bg-card-bg border border-border rounded-[2rem] hover:border-accent transition-all group gap-4">
                                <div className="p-4 bg-border rounded-[1.5rem] group-hover:bg-accent/20 transition-colors">
                                   <LayoutDashboard className="text-text-sub group-hover:text-accent" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-text-sub group-hover:text-white">Report</span>
                             </button>
                          </div>
                       </div>

                       <div className="glass-card p-8 border-border">
                          <div className="flex items-center justify-between mb-8">
                             <h3 className="text-sm font-black uppercase tracking-[0.25em] text-text-sub">{t.recent_transactions}</h3>
                             <button className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:gap-2 transition-all">
                                VIEW ALL <ChevronRight size={12} />
                             </button>
                          </div>
                          
                          <div className="space-y-6">
                             {transactions.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                   <Clock className="mx-auto text-border mb-4" size={40} />
                                   <p className="text-xs font-black uppercase tracking-widest text-text-sub">Void State</p>
                                </div>
                             ) : transactions.slice(0, 4).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between group">
                                   <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "p-3 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-6",
                                        tx.type === 'income' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                                      )}>
                                         {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                      </div>
                                      <div>
                                         <p className="text-xs font-black tracking-tight">{tx.category}</p>
                                         <p className="text-[9px] font-black text-text-sub uppercase tracking-widest mt-0.5">
                                            {tx.date instanceof Timestamp ? tx.date.toDate().toLocaleDateString() : 'Present'}
                                         </p>
                                      </div>
                                   </div>
                                   <p className={cn(
                                      "text-sm font-mono font-black",
                                      tx.type === 'income' ? "text-success" : "text-text-main"
                                   )}>
                                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                   </p>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Vault Assets</h2>
                         <p className="text-text-sub font-black text-[10px] uppercase tracking-[0.3em]">Hardware & digital instruments</p>
                      </div>
                      <button 
                        onClick={() => setIsAddingCard(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-accent/40 hover:scale-105 transition-transform"
                      >
                         <Plus size={20} />
                         {t.add_card}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                         {cards.map(card => (
                            <div key={card.id} className="glass-card p-8 border-accent/20 bg-gradient-to-br from-card-bg to-accent/5 relative group h-64 flex flex-col justify-between overflow-hidden">
                               <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full" />
                                <div className="relative flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md">
                                         <CardIcon className="text-accent" size={24} />
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-black uppercase tracking-widest text-text-sub">{card.bankName}</p>
                                         <h4 className="text-sm font-black uppercase tracking-tight italic">{card.cardType} Card</h4>
                                      </div>
                                   </div>
                                   <div className="w-12 h-8 bg-white/10 rounded-lg" />
                                </div>

                                <div className="mt-8 flex flex-col justify-center items-center">
                                    <p className="text-2xl font-mono tracking-[0.3em] font-black opacity-80 mb-2">
                                       •••• •••• •••• {card.cardNumber.slice(-4)}
                                    </p>
                                    <div className="flex items-center gap-12 mt-4 text-[10px] font-black uppercase tracking-widest text-text-sub">
                                       <div className="flex flex-col items-center gap-1">
                                          <span>HOLDER</span>
                                          <span className="text-white">{card.cardHolderName}</span>
                                       </div>
                                       <div className="flex flex-col items-center gap-1">
                                          <span>EXPIRY</span>
                                          <span className="text-white">12/28</span>
                                       </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-between items-end">
                                   <div>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-text-sub mb-1">AVAILABLE LIQUIDITY</p>
                                      <p className="text-3xl font-display font-black tracking-tight italic">₹{card.balance.toLocaleString()}</p>
                                   </div>
                                   <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-accent transition-all">
                                      <SettingsIcon size={18} />
                                   </button>
                                </div>
                            </div>
                         ))}
                         {cards.length === 0 && (
                            <button 
                              onClick={() => setIsAddingCard(true)}
                              className="dash-border-card h-64 flex flex-col items-center justify-center p-10 group bg-card-bg/30"
                            >
                               <div className="p-6 bg-accent/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
                                  <Plus className="text-accent" size={32} />
                               </div>
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub">{t.add_card}</p>
                            </button>
                         )}
                      </div>

                      <div className="glass-card p-8 border-border h-fit">
                         <h3 className="text-sm font-black uppercase tracking-[0.25em] text-accent mb-8">Vault Efficiency</h3>
                         <div className="space-y-8">
                            <div>
                               <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-4">
                                  <span className="text-text-sub">Credit Utilization</span>
                                  <span className="text-accent">42%</span>
                               </div>
                               <div className="h-2 w-full bg-border rounded-full">
                                  <div className="h-full bg-accent w-[42%]" />
                               </div>
                            </div>
                            <div>
                               <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-4">
                                  <span className="text-text-sub">Liquidity Reserve</span>
                                  <span className="text-success">78%</span>
                               </div>
                               <div className="h-2 w-full bg-border rounded-full">
                                  <div className="h-full bg-success w-[78%]" />
                               </div>
                            </div>
                         </div>

                         <div className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-3xl">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-accent rounded-xl">
                                   <Smartphone className="text-white" size={18} />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-tight italic">NFC Pulse active</h4>
                             </div>
                             <p className="text-[10px] text-text-sub font-black uppercase tracking-wider leading-relaxed">
                                Your biometry-secured NFC pulse is broadcasting to near-field terminals.
                             </p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Lineage Control</h2>
                         <p className="text-text-sub font-black text-[10px] uppercase tracking-[0.3em]">Oversee next-gen capital</p>
                      </div>
                      <button 
                         onClick={() => setIsAddingStudent(true)}
                         className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-accent/40 hover:scale-105 transition-transform"
                      >
                         <Plus size={20} />
                         {t.add_student}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {students.map(s => (
                        <div key={s.id} className="glass-card p-8 border-border relative group overflow-hidden">
                           <div className="flex items-center justify-between mb-8">
                              <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/20 flex items-center justify-center">
                                 {s.avatarUrl ? <img src={s.avatarUrl} className="w-full h-full object-cover rounded-2xl" alt="" /> : <UserIcon size={24} className="text-accent" />}
                              </div>
                              <div className="text-right">
                                 <h4 className="text-sm font-black tracking-tight uppercase">{s.name}</h4>
                                 <p className="text-[10px] text-text-sub font-black tracking-[0.2em]">{s.studentId}</p>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-center justify-center py-6 border-y border-border mb-8">
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-sub mb-2">HEIR LIQUIDITY</p>
                              <p className="text-4xl font-display font-black tracking-tight italic">₹{s.balance.toLocaleString()}</p>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <button className="px-4 py-3 bg-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent/20">
                                 {t.transfer}
                              </button>
                              <button className="px-4 py-3 bg-card-bg border border-border text-text-sub rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-white transition-all">
                                 {t.limit_control}
                              </button>
                           </div>
                        </div>
                      ))}
                      {students.length === 0 && (
                         <div className="lg:col-span-3 py-20 text-center glass-card border-dashed border-border flex flex-col items-center">
                            <Users size={64} className="text-border mb-6" />
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-text-sub mb-8">Lineage empty</p>
                            <button 
                               onClick={() => setIsAddingStudent(true)}
                               className="px-10 py-4 border border-accent text-accent rounded-3xl font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
                            >
                               Initialize First Heir
                            </button>
                         </div>
                      )}
                   </div>
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Automated Streams</h2>
                         <p className="text-text-sub font-black text-[10px] uppercase tracking-[0.3em]">Recurring neural outflows</p>
                      </div>
                      <button 
                        onClick={() => setIsAddingSub(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-accent/40 hover:scale-105 transition-transform"
                      >
                         <Plus size={20} />
                         Initiate Stream
                      </button>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {subscriptions.map(sub => (
                        <div key={sub.id} className="glass-card p-6 border-border flex items-center justify-between group hover:border-accent/40 transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-[2rem] bg-card-bg border border-border flex items-center justify-center p-3 group-hover:rotate-6 transition-transform">
                                 {/* Mock icons for common providers */}
                                 {sub.provider.toLowerCase().includes('netflix') ? <CardIcon className="text-danger" /> : <Repeat className="text-accent" />}
                              </div>
                              <div>
                                 <h4 className="text-lg font-black tracking-tight uppercase">{sub.provider}</h4>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className={cn(
                                       "px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                       sub.status === 'paid' ? "bg-success/10 text-success" : 
                                       sub.status === 'overdue' ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                                    )}>
                                       {sub.status || 'Active'}
                                    </span>
                                    <span className="text-[10px] text-text-sub font-black uppercase tracking-widest">
                                       Renewal: {sub.nextRenewal instanceof Timestamp ? sub.nextRenewal.toDate().toLocaleDateString() : 'N/A'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <p className="text-2xl font-display font-black tracking-tight italic">₹{sub.amount.toLocaleString()}</p>
                              {sub.status !== 'paid' && (
                                <button className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1 hover:gap-2 transition-all">
                                   SETTLE <ArrowUpRight size={14} />
                                </button>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'loans' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Manifest Leverage</h2>
                         <p className="text-text-sub font-black text-[10px] uppercase tracking-[0.3em]">Temporal capital acquisition</p>
                      </div>
                      <button 
                        onClick={() => setIsApplyingLoan(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-accent/40 hover:scale-105 transition-transform"
                      >
                         <Briefcase size={20} />
                         {t.apply_loan}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {loans.map(loan => (
                        <div key={loan.id} className="glass-card p-6 border-border flex flex-col justify-between h-72">
                           <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="p-2.5 bg-accent/20 rounded-xl">
                                    {loan.type === 'housing' && <LayoutDashboard size={18} className="text-accent" />}
                                    {loan.type === 'travel' && <Plane size={18} className="text-accent" />}
                                    {loan.type === 'vehicle' && <Car size={18} className="text-accent" />}
                                    {loan.type === 'education' && <GraduationCap size={18} className="text-accent" />}
                                    {loan.type === 'personal' && <PiggyBank size={18} className="text-accent" />}
                                 </div>
                                 <h4 className="text-xs font-black uppercase tracking-tight">{loan.type} Leverage</h4>
                              </div>
                              <div className={cn(
                                "p-1.5 rounded-full",
                                loan.status === 'active' ? "bg-success/20 text-success" :
                                loan.status === 'pending' ? "bg-warning/20 text-warning" : "bg-danger/20 text-danger"
                              )}>
                                 {loan.status === 'active' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                              </div>
                           </div>

                           <div className="py-6">
                              <p className="text-[9px] font-black tracking-widest text-text-sub uppercase mb-1">{loan.bankName}</p>
                              <p className="text-3xl font-display font-black tracking-tight italic">₹{loan.amount.toLocaleString()}</p>
                           </div>

                           <div className="space-y-3 pt-4 border-t border-border">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-text-sub">Interest</span>
                                 <span className="text-white">{loan.interestRate}% APR</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-text-sub">Tenure</span>
                                 <span className="text-accent">{loan.tenure} Months</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-12">
                   <div>
                      <h2 className="text-4xl font-black tracking-tight italic uppercase mb-2">Neural Controls</h2>
                      <p className="text-text-sub font-black text-[10px] uppercase tracking-[0.3em]">Calibrate your interface</p>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Security */}
                      <div className="glass-card p-10 border-border">
                         <div className="flex items-center gap-4 mb-10">
                            <Shield className="text-accent" size={28} />
                            <h3 className="text-xl font-black tracking-tight italic uppercase">{t.security}</h3>
                         </div>
                         
                         <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-card-bg/50 border border-border rounded-3xl">
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-accent/10 rounded-2xl">
                                     <Smartphone className="text-accent" size={20} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black tracking-tight uppercase">{t.two_factor}</p>
                                     <p className="text-[10px] text-text-sub font-black uppercase tracking-widest mt-1">Shield your login</p>
                                  </div>
                               </div>
                               <button className="w-16 h-8 bg-border rounded-full p-1 relative transition-colors hover:bg-success/20">
                                  <div className="w-6 h-6 bg-text-sub rounded-full" />
                               </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-card-bg/50 border border-border rounded-3xl">
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-highlight/10 rounded-2xl">
                                     <UserIcon className="text-highlight" size={20} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black tracking-tight uppercase">{t.biometric}</p>
                                     <p className="text-[10px] text-text-sub font-black uppercase tracking-widest mt-1">Finger/Iris scan</p>
                                  </div>
                               </div>
                               <button className="w-16 h-8 bg-success rounded-full p-1 relative shadow-inner">
                                  <div className="w-6 h-6 bg-white rounded-full ml-auto" />
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Language & Dialect */}
                      <div className="glass-card p-10 border-border">
                         <div className="flex items-center gap-4 mb-10">
                            <Languages className="text-accent" size={28} />
                            <h3 className="text-xl font-black tracking-tight italic uppercase">{t.language}</h3>
                         </div>

                         <div className="grid grid-cols-3 gap-4">
                            {[
                               { id: 'en', label: 'English', sub: 'Latin script' },
                               { id: 'hi', label: 'हिंदी', sub: 'Devanagari' },
                               { id: 'mr', label: 'मराठी', sub: 'Regional' }
                            ].map(l => (
                              <button 
                                key={l.id}
                                onClick={() => setLang(l.id as Language)}
                                className={cn(
                                  "p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4",
                                  lang === l.id ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" : "bg-card-bg border-border text-text-sub hover:border-accent/40"
                                )}
                              >
                                 <span className="text-lg font-black">{l.label}</span>
                                 <span className={cn("text-[9px] font-black uppercase tracking-widest", lang === l.id ? "text-white/80" : "text-text-sub")}>{l.sub}</span>
                              </button>
                            ))}
                         </div>

                         <div className="mt-12">
                            <button className="w-full py-5 bg-card-bg border border-border rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:border-accent transition-all flex items-center justify-center gap-3 group">
                               <LogOut size={18} className="text-danger group-hover:scale-110 transition-transform" />
                               TERMINATE SENSION
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* --- Modals --- */}
      <AnimatePresence>
        {isAddingTransaction && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddingTransaction(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase italic tracking-tight uppercase">Record manifestation</h3>
                 <button onClick={() => setIsAddingTransaction(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       type="button"
                       onClick={() => setTxForm({...txForm, type: 'income'})}
                       className={cn(
                          "py-4 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all",
                          txForm.type === 'income' ? "bg-success border-success text-white" : "bg-card-bg border-border text-text-sub"
                       )}
                    >Harvest</button>
                    <button 
                       type="button"
                       onClick={() => setTxForm({...txForm, type: 'expense'})}
                       className={cn(
                          "py-4 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all",
                          txForm.type === 'expense' ? "bg-danger border-danger text-white" : "bg-card-bg border-border text-text-sub"
                       )}
                    >Outflow</button>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Magnitude (INR)</label>
                    <input 
                       type="number" 
                       value={txForm.amount}
                       onChange={e => setTxForm({...txForm, amount: e.target.value})}
                       className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 text-2xl font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all" 
                       placeholder="0.00" 
                       required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Category</label>
                       <select 
                          value={txForm.category}
                          onChange={e => setTxForm({...txForm, category: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest outline-none focus:border-accent transition-all appearance-none"
                       >
                          <option value="">Sphere</option>
                          <option value="Food">Nourishment</option>
                          <option value="Transport">Mobility</option>
                          <option value="Rent">Settlement</option>
                          <option value="Salary">Harvest</option>
                          <option value="Other">Entropy</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Description</label>
                       <input 
                          type="text" 
                          value={txForm.description}
                          onChange={e => setTxForm({...txForm, description: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-accent transition-all" 
                          placeholder="Memo..." 
                       />
                    </div>
                 </div>

                 <button className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/40 hover:scale-[1.02] transition-transform">
                    Seal Record
                 </button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddingStudent && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddingStudent(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight">Enlist new heir</h3>
                 <button onClick={() => setIsAddingStudent(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Human Name</label>
                    <input 
                       type="text" 
                       value={studentForm.name}
                       onChange={e => setStudentForm({...studentForm, name: e.target.value})}
                       className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:border-accent transition-all" 
                       placeholder="Full Identity..." 
                       required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Institutional ID</label>
                       <input 
                          type="text" 
                          value={studentForm.studentId}
                          onChange={e => setStudentForm({...studentForm, studentId: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all uppercase" 
                          placeholder="ID-0000" 
                          required
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Initial Liquidity</label>
                       <input 
                          type="number" 
                          value={studentForm.balance}
                          onChange={e => setStudentForm({...studentForm, balance: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all font-display" 
                          placeholder="₹0.00" 
                          required
                       />
                    </div>
                 </div>

                 <button className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/40 hover:scale-[1.02] transition-transform">
                    Initialize Heir
                 </button>
              </form>
            </motion.div>
          </div>
        )}

        {isApplyingLoan && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsApplyingLoan(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight">Acquire leverage</h3>
                 <button onClick={() => setIsApplyingLoan(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleApplyLoan} className="space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Type of Capital</label>
                       <select 
                          value={loanForm.type}
                          onChange={e => setLoanForm({...loanForm, type: e.target.value as Loan['type']})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest outline-none focus:border-accent transition-all appearance-none"
                       >
                          <option value="housing">Housing</option>
                          <option value="education">Education</option>
                          <option value="vehicle">Vehicle</option>
                          <option value="travel">Travel</option>
                          <option value="personal">Personal</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Instition Name</label>
                       <input 
                          type="text" 
                          value={loanForm.bankName}
                          onChange={e => setLoanForm({...loanForm, bankName: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-accent transition-all uppercase tracking-widest" 
                          placeholder="Federal Bank..." 
                          required
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Quantity (INR)</label>
                       <input 
                          type="number" 
                          value={loanForm.amount}
                          onChange={e => setLoanForm({...loanForm, amount: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all" 
                          placeholder="₹0.00" 
                          required
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Tenure (Months)</label>
                       <input 
                          type="number" 
                          value={loanForm.tenure}
                          onChange={e => setLoanForm({...loanForm, tenure: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all" 
                          placeholder="12" 
                          required
                       />
                    </div>
                 </div>

                 <button className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/40 hover:scale-[1.02] transition-transform">
                    Manifest Loan
                 </button>
              </form>
            </motion.div>
          </div>
        )}

        {isAddingCard && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddingCard(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight">Forge hardware card</h3>
                 <button onClick={() => setIsAddingCard(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Manifested Name</label>
                    <input 
                       type="text" 
                       value={cardForm.holder}
                       onChange={e => setCardForm({...cardForm, holder: e.target.value})}
                       className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:border-accent transition-all uppercase tracking-tight" 
                       placeholder="FULL IDENTITY" 
                       required
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Card Digits</label>
                    <input 
                       type="text" 
                       value={cardForm.number}
                       onChange={e => setCardForm({...cardForm, number: e.target.value})}
                       className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all tracking-[0.3em]" 
                       placeholder="XXXX-XXXX-XXXX-XXXX" 
                       maxLength={19}
                       required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Instrument Type</label>
                       <select 
                          value={cardForm.type}
                          onChange={e => setCardForm({...cardForm, type: e.target.value as Card['cardType']})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-black uppercase text-xs tracking-widest outline-none focus:border-accent transition-all appearance-none"
                       >
                          <option value="debit">Debit</option>
                          <option value="credit">Credit</option>
                          <option value="other">Digital</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Institution</label>
                       <input 
                          type="text" 
                          value={cardForm.bank}
                          onChange={e => setCardForm({...cardForm, bank: e.target.value})}
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-xs uppercase tracking-widest outline-none focus:border-accent transition-all" 
                          placeholder="CITI BANK" 
                          required
                       />
                    </div>
                 </div>

                 <button className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/40 hover:scale-[1.02] transition-transform">
                    Authorize Card
                 </button>
              </form>
            </motion.div>
          </div>
        )}

        {isProfileOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight">Identity Calibration</h3>
                 <button onClick={() => setIsProfileOpen(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center gap-8 p-6 bg-accent/5 border border-accent/20 rounded-3xl">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden bg-accent/20 border border-accent/20 flex items-center justify-center">
                       {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <UserIcon size={48} className="text-accent" />}
                    </div>
                    <div>
                       <h4 className="text-xl font-black tracking-tight">{user?.displayName}</h4>
                       <p className="text-sm font-bold text-text-sub mt-1">{user?.email}</p>
                       <span className="inline-block mt-3 px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                          Sovereign Tier
                       </span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-card-bg border border-border rounded-3xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-sub mb-2">CURRENCY</p>
                       <p className="text-xl font-black italic">INR (₹)</p>
                    </div>
                    <div className="p-6 bg-card-bg border border-border rounded-3xl">
                       <p className="text-[10px] font-black uppercase tracking-widest text-text-sub mb-2">REPUTATION</p>
                       <p className="text-xl font-black italic">942 / 1000</p>
                    </div>
                 </div>

                 <button className="w-full py-6 bg-card-bg border border-border rounded-[2rem] font-black uppercase tracking-[0.2em] hover:border-accent transition-all">
                    Update Metadata
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {isAddingSub && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddingSub(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="glass-card w-full max-w-xl p-10 border-accent/20 relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black italic uppercase tracking-tight">Initiate stream</h3>
                 <button onClick={() => setIsAddingSub(false)} className="p-2 text-text-sub hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <form onSubmit={async (e: any) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 try {
                    await addDoc(collection(db, 'subscriptions'), {
                       userId: user?.uid,
                       provider: formData.get('provider'),
                       amount: Number(formData.get('amount')),
                       nextRenewal: Timestamp.fromDate(new Date(formData.get('date') as string)),
                       status: 'pending',
                       active: true
                    });
                    setIsAddingSub(false);
                 } catch (err) {
                    handleFirestoreError(err, OperationType.CREATE, 'subscriptions');
                 }
              }} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Service Provider</label>
                    <input 
                       name="provider"
                       type="text" 
                       className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-bold text-lg outline-none focus:border-accent transition-all" 
                       placeholder="Amazon Prime, Netflix, etc..." 
                       required
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Flux Amount</label>
                       <input 
                          name="amount"
                          type="number" 
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black border-accent/20 outline-none focus:ring-2 ring-accent/20 transition-all" 
                          placeholder="₹0.00" 
                          required
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-sub ml-2">Next Occurence</label>
                       <input 
                          name="date"
                          type="date" 
                          className="w-full bg-card-bg border border-border rounded-2xl px-6 py-4 font-mono font-black outline-none focus:border-accent transition-all" 
                          required
                       />
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-accent/40 hover:scale-[1.02] transition-transform">
                    Stabilize Stream
                 </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChat />
    </div>
  );
}
