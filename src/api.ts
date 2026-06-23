import { BlogPost, Comment, User, DashboardStats, BlogCategory } from './types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('blog_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  setToken(token: string) {
    localStorage.setItem('blog_jwt_token', token);
  },

  getToken() {
    return localStorage.getItem('blog_jwt_token');
  },

  logout() {
    localStorage.removeItem('blog_jwt_token');
    localStorage.removeItem('blog_user');
  },

  async register(data: { name: string; email: string; password?: string; avatarUrl?: string; bio?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  async login(data: { email: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch active session');
    return result.user;
  },

  async updateProfile(data: { name?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result.user;
  },

  // Posts
  async getPosts(params: { search?: string; category?: string; authorId?: string; page?: number; limit?: number }): Promise<{
    posts: BlogPost[];
    pagination: { totalPosts: number; totalPages: number; currentPage: number; limit: number };
  }> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.authorId) query.append('authorId', params.authorId);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/posts?${query.toString()}`, {
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch posts');
    return result;
  },

  async getPost(id: string): Promise<{ post: BlogPost & { authorBio?: string }; comments: Comment[] }> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch post details');
    return result;
  },

  async createPost(data: { title: string; content: string; excerpt?: string; featuredImage?: string; category: BlogCategory }): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create post');
    return result.post;
  },

  async updatePost(id: string, data: { title?: string; content?: string; excerpt?: string; featuredImage?: string; category?: BlogCategory }): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update post');
    return result.post;
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to delete post');
    }
  },

  // Likes
  async toggleLike(postId: string): Promise<{ liked: boolean; count: number }> {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle reaction');
    return result;
  },

  // Comments
  async addComment(postId: string, content: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to post comment');
    return result.comment;
  },

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update comment');
    return result.comment;
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const result = await res.json();
      throw new Error(result.error || 'Failed to delete comment');
    }
  },

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch dashboard metrics');
    return result;
  }
};
