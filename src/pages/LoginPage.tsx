import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Navigation,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Truck,
  Key,
  X,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('dispatcher@routemind.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(result.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('dispatcher@routemind.ai');
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] dark:bg-[#090d16] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-800 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Bar with Back Link & Theme Switcher */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-xl shadow-cyan-500/20 mb-1">
            <Navigation className="w-6 h-6 fill-current transform -rotate-45" />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-black tracking-tight text-white dark:text-white light:text-slate-900">
              RouteMind
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 border border-cyan-500/30">
              AI
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
            Logistics Intelligence & Fleet Command Platform
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 dark:bg-[#0f172a]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl backdrop-blur-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
              Dispatcher Sign In
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">
              Enter authorized credentials to access telemetry and routing.
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 dark:text-rose-300 light:text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider block">
                Operator Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dispatcher@routemind.ai"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-cyan-400 dark:text-cyan-400 light:text-cyan-600 hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400 font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 dark:text-slate-300 light:text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>Remember session</span>
              </label>

              <span className="text-[10px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> TLS Encrypted
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 fill-current" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Reviewer / Dispatcher Quick Access */}
          <div className="pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
            <span>Demo Dispatcher Access:</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 border border-slate-700 dark:border-slate-700 light:border-slate-300 font-mono text-[10px] font-bold cursor-pointer transition-colors"
            >
              Auto-fill Credentials
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-500">
          RouteMind AI Platform • Authorized logistics personnel only
        </p>
      </div>

      {/* Footer */}
      <div className="py-2 text-center text-[10px] text-slate-500">
        © 2026 RouteMind AI • All India Logistics Intelligence
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 shadow-2xl text-slate-100 dark:text-slate-100 light:text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-200">
              <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">
                Reset Dispatcher Password
              </h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSent(false);
                }}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 dark:text-emerald-300 light:text-emerald-700 text-xs space-y-2">
                <span className="font-bold block">Reset instructions transmitted!</span>
                <p className="text-[11px]">
                  Password recovery link has been dispatched to <strong>{resetEmail}</strong>.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (resetEmail) setResetSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Enter your registered dispatch email. We will issue a secure authentication reset token.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@routemind.ai"
                  className="w-full px-3 py-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-50 border border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
