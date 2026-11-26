import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { getSupabaseClient } from '../../services/supabaseClient';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ArrowRight,
} from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    if (!supabase) {
      setSessionError('Supabase is not configured. Please check your environment settings.');
      setCheckingSession(false);
      return;
    }

    // Listen for Supabase PASSWORD_RECOVERY or SIGNED_IN event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
        setSessionError('');
        setCheckingSession(false);
      }
    });

    const initRecoverySession = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        // Check for error in URL (e.g. expired or already-used link)
        const urlErrorDesc =
          searchParams.get('error_description') || hashParams.get('error_description');
        const urlError = searchParams.get('error') || hashParams.get('error');
        if (urlError || urlErrorDesc) {
          if (mounted) {
            setSessionError(
              urlErrorDesc || 'This password reset link is invalid or has expired. Please request a new one.'
            );
            setCheckingSession(false);
          }
          return;
        }

        // 1. Handle PKCE flow (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) throw exchangeErr;
          if (data?.session && mounted) {
            setSessionReady(true);
            setCheckingSession(false);
            return;
          }
        }

        // 2. Handle token_hash flow (?token_hash=...&type=recovery)
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        if (tokenHash && type === 'recovery') {
          const { data, error: otpErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (otpErr) throw otpErr;
          if (data?.session && mounted) {
            setSessionReady(true);
            setCheckingSession(false);
            return;
          }
        }

        // 3. Check if Supabase detectSessionInUrl already established a session
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        if (sessionData?.session && mounted) {
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }

        // Small grace period for hash-fragment processing
        setTimeout(async () => {
          if (!mounted) return;
          const { data: retryData } = await supabase.auth.getSession();
          if (!mounted) return;
          if (retryData?.session) {
            setSessionReady(true);
          } else {
            setSessionError(
              'No active password recovery session found. Your reset link may have expired or already been used.'
            );
          }
          setCheckingSession(false);
        }, 700);
      } catch (err) {
        if (mounted) {
          setSessionError(
            err.message || 'Could not verify your password recovery link. Please request a new one.'
          );
          setCheckingSession(false);
        }
      }
    };

    initRecoverySession();

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword(password);
      // Clear recovery session so user signs in cleanly with their new password
      await authService.signOut();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not update password. Please try requesting a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white">LUXE</span>
                <span className="text-2xl font-light tracking-widest text-amber-500">ESTATE</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Account Security
              </p>
            </div>
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <KeyRound className="w-4 h-4" />
            <span>Password Recovery</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="mt-1 text-xs text-slate-400">
            Create a strong new password for your LUXE ESTATE account.
          </p>
        </div>

        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          {checkingSession ? (
            <div className="py-8 flex flex-col items-center gap-3 text-slate-300">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Verifying Recovery Token...
              </p>
            </div>
          ) : success ? (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Password Updated Successfully</h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Your password has been changed. Select your portal below to sign in with your new credentials.
                </p>
              </div>
              <div className="space-y-2.5 pt-2">
                <Link
                  to="/buyer/login"
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Return to Buyer Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/owner/login"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl text-center transition-colors"
                  >
                    Owner Login
                  </Link>
                  <Link
                    to="/admin/login"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded-xl text-center transition-colors"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          ) : !sessionReady && sessionError ? (
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{sessionError}</div>
              </div>
              <div className="space-y-2.5">
                <Link
                  to="/buyer/login"
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Back to Buyer Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center justify-center gap-4 text-xs pt-2">
                  <Link to="/owner/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                    Owner Login
                  </Link>
                  <span className="text-slate-600">•</span>
                  <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-semibold">
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={6}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
