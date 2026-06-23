import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User as UserIcon, Book, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface RegisterViewProps {
  onRegisterSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Anya',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Nora',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Zane'
];

export default function RegisterView({ onRegisterSuccess, onNavigate }: RegisterViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.register({
        name,
        email,
        password,
        bio,
        avatarUrl: selectedAvatar
      });
      api.setToken(res.token);
      localStorage.setItem('blog_user', JSON.stringify(res.user));
      onRegisterSuccess(res.user);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm ring-4 ring-gray-900/10">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Create writer account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Already have accounts?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-semibold text-gray-900 hover:underline transition-colors"
          >
            Access login credentials
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 rounded-3xl">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pick avatar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Author Avatar
              </label>
              <div className="flex flex-wrap gap-2.5 justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {PRESET_AVATARS.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`h-11 w-11 rounded-full overflow-hidden border-2 bg-white transition cursor-pointer hover:scale-105 ${
                      selectedAvatar === url ? 'border-gray-900 scale-110 ring-2 ring-gray-900/10' : 'border-gray-200'
                    }`}
                  >
                    <img src={url} alt="Avatar option" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-gray-700">
                Writer Name
              </label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Coleman"
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="writer@example.com"
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-bio" className="block text-sm font-semibold text-gray-700">
                Short Bio (Optional)
              </label>
              <div className="relative mt-1">
                <Book className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                <textarea
                  id="reg-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Passionate about UI, coding systems, and simple design aesthetics..."
                  className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-gray-900 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition cursor-pointer"
            >
              <span>{loading ? 'Creating profile...' : 'Complete Register'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
