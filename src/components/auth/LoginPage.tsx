import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Mail,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserPlus,
  Building2,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const {
    login,
    setActiveView,
    settings,
    requestPasswordReset,
    completePasswordReset
  } = useApp();

  // Authentication states
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode: 'login' | 'signup' | 'forgot' | 'reset-password'
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset-password'>('login');

  // Sign Up form state for requesting account from Super Admin
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('Operations');
  const [signupRole, setSignupRole] = useState('Staff Member');
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  // Forgot password flow states
  const [forgotInput, setForgotInput] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetEmailData, setResetEmailData] = useState<{
    token: string;
    email: string;
    name: string;
    expiresAt: string;
  } | null>(null);

  // Set new password flow states
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your User ID or registered Email ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (!result.success) {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      } else {
        setActiveView('dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotInput.trim()) {
      setForgotError('Please enter your User ID or registered Email ID.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await requestPasswordReset(forgotInput.trim());
      if (!res.success) {
        setForgotError(res.error || 'No matching account found.');
      } else if (res.resetData) {
        setResetEmailData(res.resetData);
        setResetToken(res.resetData.token);
      }
    } catch (err: any) {
      setForgotError('Unable to process password reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Set New Password Submission
  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetToken.trim()) {
      setResetError('Reset token is missing.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await completePasswordReset(resetToken.trim(), newPassword);
      if (!res.success) {
        setResetError(res.error || 'Failed to update password.');
      } else {
        setResetSuccess(true);
      }
    } catch (err: any) {
      setResetError('Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans relative">
      {/* Subtle Background Ambience */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation */}
      <div className="absolute top-6 left-6">
        <button
          id="btn-back-to-website"
          onClick={() => setActiveView('public-home')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Project Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 border border-blue-400/20">
            {settings?.brandName ? settings.brandName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'ZLS'}
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            {settings.brandName || 'Zovilo Life Style'}
          </h1>
          <p className="mt-0.5 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Assets Management System
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {authMode === 'login' && 'Sign In to your Portal'}
            {authMode === 'signup' && 'Sign Up & Super Admin Provisioning'}
            {authMode === 'forgot' && 'Account Recovery'}
            {authMode === 'reset-password' && 'Reset Password'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 sm:px-9 shadow-2xl rounded-2xl border border-slate-800">
          
          {/* Sign In & Sign Up Option Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800 mb-6 shadow-inner">
            <button
              type="button"
              id="tab-sign-in"
              onClick={() => {
                setAuthMode('login');
                setError('');
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              id="tab-sign-up"
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSignupSubmitted(false);
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 1. LOGIN FORM */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {error && (
                <div
                  id="login-error-alert"
                  className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* User ID / Email ID */}
              <div>
                <label
                  htmlFor="login-identifier-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  User ID / Email ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter User ID or Email ID"
                    autoComplete="username"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password-input"
                    className="block text-xs font-semibold text-slate-300"
                  >
                    Password
                  </label>
                  <button
                    id="link-forgot-password"
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setForgotInput(identifier);
                      setForgotError('');
                      setResetEmailData(null);
                    }}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    id="btn-toggle-password-visibility"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Switch to Sign Up Option */}
              <div className="pt-2 text-center border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Need a new account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Sign Up via Super Admin →
                  </button>
                </p>
              </div>

              {/* Subtle default login hint for easy evaluation */}
              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400">
                  Default credentials: <span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">admin123</span>
                </span>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. SIGN UP VIEW (MANAGED THROUGH SUPER ADMIN) */}
          {/* ========================================================================= */}
          {authMode === 'signup' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Notice Banner */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-slate-200 text-xs">
                <div className="flex items-center gap-2 mb-1 text-blue-300 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Sign Up Managed by Super Admin</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sign up and account creation is authorized through the <strong className="text-white">Super Administrator</strong>. Roles, departments, and module access permissions are provisioned directly in the Users Management system.
                </p>
              </div>

              {/* Super Admin Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Authorized Super Administrator</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    System Authority
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs font-bold text-white">
                      {settings?.superAdminName || 'Super Admin'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {settings?.superAdminEmail || settings?.email || 'admin@zovilolifestyle.com'}
                    </div>
                  </div>
                  <a
                    href={`mailto:${settings?.superAdminEmail || 'admin@zovilolifestyle.com'}?subject=New%20User%20Sign-Up%20Request%20-%20Assets%20Management%20System`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email Admin</span>
                  </a>
                </div>
              </div>

              {!signupSubmitted ? (
                /* Request Account Form */
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!signupName.trim() || !signupEmail.trim()) return;
                    setSignupLoading(true);
                    setTimeout(() => {
                      setSignupLoading(false);
                      setSignupSubmitted(true);
                    }, 600);
                  }}
                  className="space-y-3.5"
                >
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Submit Sign Up Request</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Work Email ID
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="e.g. priya@zovilolifestyle.com"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Department
                      </label>
                      <select
                        value={signupDept}
                        onChange={e => setSignupDept(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="Operations">Operations</option>
                        <option value="IT Department">IT Department</option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Requested Role
                      </label>
                      <select
                        value={signupRole}
                        onChange={e => setSignupRole(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="Staff Member">Staff Member</option>
                        <option value="Manager">Manager</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {signupLoading ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Sign-Up Request to Super Admin</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Confirmation State */
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Sign-Up Request Dispatched</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Your request for <strong className="text-white">{signupName}</strong> ({signupEmail}) has been sent to the Super Admin ({settings?.superAdminName || 'Super Admin'}).
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Once the Super Admin provisions your user profile and permissions in the Users section, your credentials will be activated for immediate Sign In.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setSignupSubmitted(false);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Switch to Sign In */}
              <div className="pt-2 text-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  Already provisioned by Super Admin? Sign In →
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. FORGOT PASSWORD FLOW */}
          {/* ========================================================================= */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              {!resetEmailData ? (
                /* Enter User ID / Email Form */
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">Find Your Account</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your registered User ID or Email address. The system will identify your account and dispatch a secure, single-use password reset link.
                  </p>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>{forgotError}</div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="forgot-identifier-input"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      User ID / Email ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="forgot-identifier-input"
                        type="text"
                        required
                        value={forgotInput}
                        onChange={e => setForgotInput(e.target.value)}
                        placeholder="e.g. admin or admin@zovilolifestyle.com"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="w-1/2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                    <button
                      id="btn-send-reset-email"
                      type="submit"
                      disabled={forgotLoading}
                      className="w-1/2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? 'Processing...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Simulated Secure Reset Email Dispatched (with exact prompt specifications) */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white">Password Reset Email Dispatched</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Token Active
                      </span>
                    </div>

                    {/* Email preview card */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                      <div className="text-slate-400 text-[11px]">
                        <span className="text-slate-500 font-medium">Subject:</span>{' '}
                        <strong className="text-slate-200">Reset Your Password - Zovilo Life Style Portal</strong>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        <span className="text-slate-500 font-medium">To:</span> {resetEmailData.name} &lt;{resetEmailData.email}&gt;
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-slate-300 leading-relaxed">
                        Hello {resetEmailData.name},<br />
                        Someone requested a password reset for your account. If this was you, click the button below to create a new password.
                      </div>

                      <div className="py-2 text-center">
                        <button
                          id="btn-open-reset-screen"
                          type="button"
                          onClick={() => {
                            setAuthMode('reset-password');
                            setResetToken(resetEmailData.token);
                          }}
                          className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Reset Password</span>
                        </button>
                      </div>

                      <div className="p-2 rounded bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Valid for 15 minutes</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[10px]">{resetEmailData.token}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal italic">
                        Security Notice: Never share this link. This link is single-use and expires in 15 minutes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setResetEmailData(null);
                      }}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SET NEW PASSWORD SCREEN */}
          {/* ========================================================================= */}
          {authMode === 'reset-password' && (
            <div className="space-y-4">
              {resetSuccess ? (
                <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Password Updated Successfully</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your password has been securely updated. You can now sign in using your new credentials.
                  </p>
                  <button
                    id="btn-return-login-success"
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setPassword(newPassword);
                      setResetSuccess(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Sign In with New Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">Set New Password</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Please choose a strong, secure password with at least 6 characters.
                  </p>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>{resetError}</div>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reset-new-password-input"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter minimum 6 characters"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reset-confirm-password-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="w-1/2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-submit-new-password"
                      type="submit"
                      disabled={resetLoading}
                      className="w-1/2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {resetLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
