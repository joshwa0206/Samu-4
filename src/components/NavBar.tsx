import { BookOpen, User, LogIn, LogOut, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';
import { User as UserType } from '../types';

interface NavBarProps {
  currentUser: UserType | null;
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onLogout: () => void;
}

export default function NavBar({ currentUser, currentView, onNavigate, onLogout }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span>Blog<span className="font-semibold text-gray-500">Verse</span></span>
        </button>

        {/* Global Navigation links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-medium transition-colors hover:text-gray-900 ${
              currentView === 'home' ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            Explore
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-gray-900 ${
                  currentView === 'dashboard' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <button
                onClick={() => onNavigate('create-post')}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-gray-900 ${
                  currentView === 'create-post' ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Write Post</span>
              </button>

              {/* User Dropdown Profile Action Menu */}
              <div className="flex items-center gap-3 border-l border-gray-100 pl-4 sm:pl-6">
                <button
                  onClick={() => onNavigate('profile')}
                  className="group flex items-center gap-2 rounded-full outline-none"
                  title="View Profile"
                >
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full border border-gray-200 bg-gray-50 object-cover group-hover:border-gray-400 group-hover:scale-105 transition-all duration-200"
                  />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 group-hover:text-gray-900 sm:inline">
                    {currentUser.name}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-red-600 transition"
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4 sm:pl-6">
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onNavigate('register')}
                className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-gray-900 transition hover:bg-gray-800"
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
