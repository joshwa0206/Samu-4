export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export type BlogCategory = 'Technology' | 'Design' | 'Programming' | 'Lifestyle' | 'Business' | 'Other';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: BlogCategory;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  postsByCategory: { category: BlogCategory; count: number }[];
  recentPosts: BlogPost[];
}
