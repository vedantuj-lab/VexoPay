import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-border">
        {/* Left Side - Branding */}
        <div className="ai-gradient p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Wallet className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">◈</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">SmartFinance AI</span>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold leading-tight mb-6"
            >
              Geometric Balance <br />
              <span className="text-accent-light text-6xl">For Your Wealth.</span>
            </motion.h1>
            <p className="text-white/80 text-lg max-w-md">
              Experience a new standard of financial tracking with AI-powered geometric precision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <Feature icon={<Sparkles />} text="AI Insights" />
            <Feature icon={<TrendingUp />} text="Real-time Tracking" />
            <Feature icon={<ShieldCheck />} text="Secure Data" />
            <Feature icon={<Wallet />} text="Smart Budgeting" />
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="p-12 flex flex-col justify-center items-center text-center">
          <div className="max-w-sm w-full">
            <h2 className="text-3xl font-bold text-text-main mb-2">Welcome Back</h2>
            <p className="text-text-sub mb-12">Sign in to access your financial dashboard.</p>

            <button 
              onClick={signIn}
              className="w-full flex items-center justify-center gap-4 bg-white border border-border p-4 rounded-xl hover:bg-background transition-all group shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              <span className="font-bold text-text-main">Continue with Google</span>
            </button>

            <div className="mt-12 pt-12 border-t border-border">
              <p className="text-xs text-text-sub">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
      <div className="text-white">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
}
