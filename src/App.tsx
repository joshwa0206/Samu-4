import { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './api';

// Components
import NavBar from './components/NavBar';

// Views
import HomeView from './views/HomeView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DashboardView from './views/DashboardView';
import CreatePostView from './views/CreatePostView';
import EditPostView from './views/EditPostView';
import BlogDetailsView from './views/BlogDetailsView';
import ProfileView from './views/ProfileView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check for active logged-in session on application load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setLoadingSession(false);
        return;
      }

      try {
        // Fetch fresh metadata from API
        const user = await api.getMe();
        setCurrentUser(user);
        localStorage.setItem('blog_user', JSON.stringify(user));
      } catch (err) {
        console.warn('[SESSION] Stale or expired token. Clearing cache.', err);
        api.logout();
        setCurrentUser(null);
      } finally {
        setLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  // View Router callback handler
  const handleNavigate = (view: string, params: any = null) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-950 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-gray-500 tracking-wider uppercase">
            Restoring login session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/30 overflow-x-hidden font-sans">
      {/* Dynamic Global Header Navigation */}
      <NavBar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Single-View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onSelectPost={(id) => handleNavigate('post-details', id)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'register' && (
          <RegisterView
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onEditPost={(id) => handleNavigate('edit-post', id)}
          />
        )}

        {currentView === 'create-post' && (
          <CreatePostView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'edit-post' && (
          <EditPostView
            postId={viewParams}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'post-details' && (
          <BlogDetailsView
            postId={viewParams}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onProfileUpdate={handleProfileUpdate}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footnote credit line */}
      <footer className="border-t border-gray-100 bg-white py-8 select-none">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} BlogVerse Publishing Platform. Built with full-stack TypeScript, Express, and React.
          </p>
        </div>
      </footer>
    </div>
  );
}
