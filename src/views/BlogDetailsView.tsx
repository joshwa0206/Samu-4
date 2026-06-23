import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageSquare, Edit, Trash, Send, AlertCircle, PlusCircle, Calendar, User as UserIcon } from 'lucide-react';
import { BlogPost, Comment, User } from '../types';
import { api } from '../api';
import { parseMarkdown, formatDate, getCategoryStyles } from '../utils';

interface BlogDetailsViewProps {
  postId: string;
  currentUser: User | null;
  onNavigate: (view: string) => void;
}

export default function BlogDetailsView({ postId, currentUser, onNavigate }: BlogDetailsViewProps) {
  const [post, setPost] = useState<(BlogPost & { authorBio?: string }) | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments handlers
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Comment editing structures
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPost(postId);
      setPost(res.post);
      setComments(res.comments);
    } catch (err: any) {
      console.error('[DETAILS] Load blog details failed:', err);
      setError('Failed to load article. The post may have been deleted or archived.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    if (!post) return;

    try {
      const res = await api.toggleLike(post.id);
      setPost(prev => prev ? {
        ...prev,
        likedByMe: res.liked,
        likesCount: res.count
      } : null);
    } catch (err) {
      console.error('[DETAILS] Toggle like error:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    if (!commentInput.trim() || !post) return;

    try {
      setSubmittingComment(true);
      const newComment = await api.addComment(post.id, commentInput);
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
      
      // Increment comment count in title bar
      setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
    } catch (err) {
      console.error('[DETAILS] Add comment error:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditClick = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingCommentContent(c.content);
  };

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    try {
      setSavingComment(true);
      const updated = await api.updateComment(commentId, editingCommentContent);
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      setEditingCommentId(null);
    } catch (err) {
      console.error('[DETAILS] Save comment edit error:', err);
      alert('Failed to update comment.');
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPost(prev => prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : null);
    } catch (err) {
      console.error('[DETAILS] Delete comment error:', err);
      alert('Failed to delete comment.');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Downloading publishing segments...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Article not found</h3>
            <p className="text-sm mt-1">{error || 'This publishing could not be parsed.'}</p>
            <button
              onClick={() => onNavigate('home')}
              className="mt-3 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const badgeStyles = getCategoryStyles(post.category);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 select-none">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return Explore</span>
      </button>

      {/* Main Publishing layout Container */}
      <article className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm overflow-hidden mb-8">
        {/* Header Metadata */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles.bg} ${badgeStyles.text} ${badgeStyles.ring}`}>
              {post.category}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(post.createdAt)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-6 select-text leading-tight">
            {post.title}
          </h1>

          {/* Author avatar and title information */}
          <div className="flex items-center gap-3.5 border-t border-b border-gray-50 py-4.5">
            <img
              src={post.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorName)}`}
              alt={post.authorName}
              className="h-11 w-11 rounded-full object-cover border border-gray-100 bg-gray-50 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
              <p className="text-xs text-gray-500">Blogger / Verified Creator</p>
            </div>
          </div>
        </header>

        {/* Big Cover Image */}
        <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content text body block */}
        <div className="prose max-w-3xl mx-auto select-text font-serif text-lg text-gray-800 leading-relaxed border-b border-gray-50 pb-8 mb-8 break-words">
          <div 
            className="markdown-body text-gray-800 leading-relaxed text-base break-words"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }}
          />
        </div>

        {/* Actions bar: reaction like block */}
        <footer className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Reaction Like Button */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 rounded-xl border border-gray-150 py-2.5 px-4 text-sm font-semibold transition cursor-pointer hover:bg-gray-50 ${
                post.likedByMe
                  ? 'border-red-100 bg-red-50/50 text-red-650'
                  : 'text-gray-700'
              }`}
            >
              <Heart 
                className={`h-5 w-5 transition-transform active:scale-125 ${
                  post.likedByMe ? 'fill-current text-red-500' : ''
                }`} 
              />
              <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </footer>

        {/* Display Author Biography panel */}
        {post.authorBio && (
          <div className="mt-10 bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
            <img
              src={post.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorName)}`}
              alt={post.authorName}
              className="h-10 w-10 rounded-full object-cover shrink-0 hidden sm:block border border-gray-200"
            />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">About the Author</h4>
              <p className="text-sm font-semibold text-gray-900 mb-1.5">{post.authorName}</p>
              <p className="text-xs text-gray-600 leading-relaxed select-text">{post.authorBio}</p>
            </div>
          </div>
        )}
      </article>

      {/* Structured Chronological Feedback Commenting Section */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>Discussion stream</span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        </h3>

        {/* Comments Feed Stream */}
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-150 mb-8">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">No discussions yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the very first writer to share thoughts on this post!</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8 divide-y divide-gray-50">
            {comments.map((comment, index) => {
              const isOwner = currentUser && (currentUser.id === comment.authorId || currentUser.role === 'admin');
              const isEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className={`flex gap-3.5 pt-6 ${index === 0 ? 'pt-0' : ''}`}>
                  <img
                    src={comment.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(comment.authorName)}`}
                    alt={comment.authorName}
                    className="h-9 w-9 rounded-full object-cover border border-gray-100 bg-gray-50 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-900">{comment.authorName}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>

                      {/* Comment actions (only for owners) */}
                      {isOwner && !isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleEditClick(comment)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition"
                            title="Edit Comment"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition"
                            title="Delete Comment"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          className="w-full text-sm block rounded-xl border border-gray-200 p-3 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            disabled={savingComment}
                            onClick={() => setEditingCommentId(null)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={savingComment}
                            onClick={() => handleSaveCommentEdit(comment.id)}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold"
                          >
                            {savingComment ? 'Saving...' : 'Save Feedback'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-gray-600 select-text break-words">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Comment input form */}
        <div className="border-t border-gray-50 pt-6">
          {currentUser ? (
            <form onSubmit={handleAddComment}>
              <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Leave your comment
              </label>
              <div className="flex gap-3">
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-gray-100 hidden sm:block shrink-0"
                />
                <div className="flex-1 relative">
                  <textarea
                    id="comment"
                    rows={3}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write your creative remarks or constructive review..."
                    className="w-full text-sm block rounded-xl border border-gray-200 p-3.5 pr-12 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentInput.trim()}
                    className="absolute bottom-3.5 right-3.5 aspect-square h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-30 transition cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500 font-medium">Please log in or sign up to join the active feedback panel.</p>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
