import React, { useState } from 'react';
import { User as UserIcon, Mail, Book, Save, CheckCircle, AlertCircle, ArrowLeft, Calendar, Shield } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { formatDate } from '../utils';

interface ProfileViewProps {
  currentUser: User | null;
  onProfileUpdate: (updated: User) => void;
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

export default function ProfileView({ currentUser, onProfileUpdate, onNavigate }: ProfileViewProps) {
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-gray-500">
        <p>Please log in to manage your profile settings.</p>
        <button
          onClick={() => onNavigate('login')}
          className="mt-4 rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800"
        >
          Sign In
        </button>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser.avatarUrl && PRESET_AVATARS.includes(currentUser.avatarUrl)
      ? currentUser.avatarUrl
      : currentUser.avatarUrl || PRESET_AVATARS[0]
  );
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Author name cannot be left blank.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updated = await api.updateProfile({
        name,
        bio,
        avatarUrl: selectedAvatar
      });

      // Update local storage representation
      localStorage.setItem('blog_user', JSON.stringify(updated));
      onProfileUpdate(updated);
      setSuccess(true);
      
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('[PROFILE] Update profile details failed:', err);
      setError(err.message || 'Failed making adjustments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 select-none animate-[fade-in_0.2s_ease-out]">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return Explore</span>
      </button>

      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage public biography, avatar designs, and publisher details</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 flex items-start gap-2.5 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-650" />
          <span>Profile configuration updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-red-750 flex items-start gap-2 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row matching visual card details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
          <img
            src={selectedAvatar}
            alt={name}
            className="h-20 w-20 rounded-full border border-gray-200 bg-gray-50 object-cover shrink-0"
          />
          <div className="text-center sm:text-left space-y-1 flex-1">
            <h3 className="font-bold text-lg text-gray-950">{currentUser.name}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {currentUser.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Seeding {formatDate(currentUser.createdAt)}
              </span>
              <span className="flex items-center gap-1 font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 border border-gray-100 rounded-md">
                <Shield className="h-3.5 w-3.5" /> {currentUser.role === 'admin' ? 'Curator' : 'Writer'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Avatar Pick Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5">
            Modify Profile Avatar
          </label>
          <div className="flex flex-wrap gap-2.5 justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            {PRESET_AVATARS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedAvatar(url)}
                className={`h-12 w-12 rounded-full overflow-hidden border-2 bg-white transition cursor-pointer hover:scale-105 ${
                  selectedAvatar === url ? 'border-gray-950 scale-110 ring-2 ring-gray-990/10' : 'border-gray-200'
                }`}
              >
                <img src={url} alt="Avatar template" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Simple Input Cards */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="prof-name" className="block text-sm font-semibold text-gray-750 mb-1.5">
              Display Publicity Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="prof-name"
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
            <label htmlFor="prof-bio" className="block text-sm font-semibold text-gray-750 mb-1.5">
              Author Biography (Displayed under articles)
            </label>
            <div className="relative">
              <Book className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
              <textarea
                id="prof-bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your personal writing goals, engineering focus or daily motivations..."
                className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans resize-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons line */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="rounded-xl border border-gray-200 py-3 px-5 text-sm font-semibold text-gray-750 transition hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving updates...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
