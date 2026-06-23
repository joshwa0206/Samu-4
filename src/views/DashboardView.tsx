import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Heart, MessageSquare, PlusCircle, Edit, Trash, AlertCircle, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { DashboardStats, BlogPost } from '../types';
import { api } from '../api';
import { formatDate } from '../utils';

interface DashboardViewProps {
  onNavigate: (view: string, data?: any) => void;
  onEditPost: (id: string) => void;
}

export default function DashboardView({ onNavigate, onEditPost }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('[DASHBOARD] Fetch stats error:', err);
      setError('Failed to fetch dashboard metrics. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.deletePost(deleteId);
      // Refresh stats
      await fetchStats();
      setDeleteId(null);
    } catch (err: any) {
      console.error('[DASHBOARD] Delete post error:', err);
      alert(err.message || 'Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Assembled writer analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Dashboard Access Restricted</h3>
            <p className="text-sm mt-1">{error || 'Please log in to manage your posts and view stats.'}</p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-3 rounded-lg bg-red-650 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-750"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 select-none">
      {/* Welcome header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Author Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your writings, content feedback and analytics</p>
        </div>
        <button
          onClick={() => onNavigate('create-post')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Write Brand New Post</span>
        </button>
      </div>

      {/* Grid count cards */}
      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        {/* Posts Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Posts</span>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">{stats.totalPosts}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Likes Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Post Likes</span>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">{stats.totalLikes}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <Heart className="h-5 w-5 fill-current" />
          </div>
        </div>

        {/* Comments Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Feedback Comments</span>
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">{stats.totalComments}</h3>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Post Listings list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Your Published Articles</span>
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {stats.recentPosts.length} drafted
              </span>
            </div>

            {stats.recentPosts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium">You haven't written any posts yet.</p>
                <button
                  onClick={() => onNavigate('create-post')}
                  className="mt-3 text-xs font-semibold text-gray-900 hover:underline inline-flex items-center gap-1"
                >
                  Write your first article <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onNavigate('post-details', post.id)}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 cursor-pointer transition"
                  >
                    <div className="flex items-start gap-3.5 max-w-lg">
                      <img
                        src={post.featuredImage}
                        alt=""
                        className="h-14 w-20 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0 hidden sm:block"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                          {post.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="font-semibold bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 text-[10px]">
                            {post.category}
                          </span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" /> {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-indigo-500" /> {post.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto border-t border-gray-50 pt-3 sm:pt-0 sm:border-0 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPost(post.id);
                        }}
                        className="p-2 border border-gray-150 rounded-xl hover:bg-white text-gray-500 hover:text-gray-900 hover:shadow-sm transition"
                        title="Edit Article"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(post.id, e)}
                        className="p-2 border border-gray-150 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                        title="Delete Article"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Simple Stats visualizations category */}
        <div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-6">
            <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span>Category Distribution</span>
            </h3>

            {stats.postsByCategory.length === 0 ? (
              <span className="text-xs text-gray-400 italic block py-4 text-center">No categories mapped yet</span>
            ) : (
              <div className="space-y-3.5">
                {stats.postsByCategory.map(({ category, count }) => {
                  const maxCount = Math.max(...stats.postsByCategory.map(c => c.count));
                  const percentage = Math.round((count / (maxCount || 1)) * 100);

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{category}</span>
                        <span>{count} {count === 1 ? 'post' : 'posts'}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick instructions widget */}
          <div className="rounded-2xl bg-gray-950 text-white p-6 shadow-sm">
            <h4 className="font-semibold mb-2">Publishing Ethics</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ensure proper attribution when using code snippets or outside images. High-contrast grids and simple paragraphs deliver the finest visual retention. Keep writing!
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]">
          <div className="bg-white rounded-3xl border border-gray-100 w-full max-w-sm p-6 shadow-xl relative animate-[scale-up_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Article?</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              This will permanently delete this published article along with all associated comments and reaction metrics. This operation cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
