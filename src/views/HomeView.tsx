import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { BlogPost, BlogCategory } from '../types';
import { api } from '../api';
import PostCard from '../components/PostCard';

interface HomeViewProps {
  onSelectPost: (id: string) => void;
  onNavigate: (view: string) => void;
}

const CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Technology',
  'Design',
  'Programming',
  'Lifestyle',
  'Business',
  'Other'
];

export default function HomeView({ onSelectPost, onNavigate }: HomeViewProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | BlogCategory>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPosts({
        search,
        category: selectedCategory,
        page: currentPage,
        limit: 6,
      });
      setPosts(res.posts);
      setTotalPages(res.pagination.totalPages);
      setTotalPostsCount(res.pagination.totalPosts);
    } catch (err: any) {
      console.error('[HOME] Failed fetching posts:', err);
      setError('Failed to fetch articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, selectedCategory, currentPage]);

  const handleLikeToggle = async (id: string, e: React.MouseEvent) => {
    try {
      // Check if logged in first
      const token = api.getToken();
      if (!token) {
        onNavigate('login');
        return;
      }
      const res = await api.toggleLike(id);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              likedByMe: res.liked,
              likesCount: res.count,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('[HOME] Like error:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Editorial Header Hero */}
      <section className="relative overflow-hidden bg-gray-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 mb-12 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200 backdrop-blur-sm mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Blogging & Core Creative Writing
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 select-text">
            Publish your insights, write with purpose.
          </h1>
          <p className="text-gray-400 sm:text-lg mb-6 leading-relaxed select-text">
            Join a modern writing collective where code, designs, and stories meet. Share modular articles, receive active comments, and explore top-tier software perspectives.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const token = api.getToken();
                if (token) onNavigate('create-post');
                else onNavigate('register');
              }}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 shadow-sm"
            >
              Start Writing Now
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('explore-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
            >
              Explore Blogs
            </button>
          </div>
        </div>
      </section>

      {/* Main Explore Section */}
      <section id="explore-section" className="scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Articles Collection</h2>
            <p className="text-sm text-gray-500 mt-1">Showing {totalPostsCount} publishings on our directory</p>
          </div>

          {/* Search container */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset to page 1 on search
              }}
              placeholder="Search posts, summaries..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all"
            />
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0 hidden sm:block mr-2" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1); // reset to page 1
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error Handling */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2 max-w-lg mx-auto my-8">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state placeholders */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col overflow-hidden rounded-2xl border border-gray-150 animate-pulse">
                <div className="bg-gray-200 aspect-video w-full" />
                <div className="p-5 flex-1 space-y-3 bg-white">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">No publishings found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              There are no matching articles under '{selectedCategory}' category. Feel free to draft the very first one!
            </p>
            <button
              onClick={() => onNavigate('create-post')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Create Blog Post
            </button>
          </div>
        ) : (
          <>
            {/* Posts Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSelect={onSelectPost}
                  onLikeToggle={handleLikeToggle}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <span className="text-sm text-gray-500">
                  Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                  <span className="font-semibold text-gray-950">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
