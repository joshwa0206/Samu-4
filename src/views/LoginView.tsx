import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export default function LoginView({ onLoginSuccess, onNavigate }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login({ email, password });
      api.setToken(res.token);
      localStorage.setItem('blog_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      // Demo password is seeded as 'password123' inside database
      const res = await api.login({ email: demoEmail, password: 'password123' });
      api.setToken(res.token);
      localStorage.setItem('blog_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onNavigate('home');
    } catch (err: any) {
      setError('Demo Sign-In went wrong. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm ring-4 ring-gray-900/10">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Sign in component
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Or{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-semibold text-gray-900 hover:underline transition-colors"
          >
            register a free author profile
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 rounded-3xl">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2 text-sm leading-relaxed">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 transition cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Prompt quick access demo users */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3 text-center">
              Quick Dev Demo Log-In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSignIn('sarah@blogverse.com')}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 hover:bg-gray-50 transition text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-800">Sarah Coleman</span>
                <span className="text-[10px] text-gray-500 font-mono">Editor / Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('marcus@devmail.com')}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 p-2.5 hover:bg-gray-50 transition text-left cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-800">Marcus Chen</span>
                <span className="text-[10px] text-gray-500 font-mono">Author / Dev</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
