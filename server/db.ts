import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types for internal DB
export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface DbPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbLike {
  postId: string;
  userId: string;
  createdAt: string;
}

interface DbSchema {
  users: DbUser[];
  posts: DbPost[];
  comments: DbComment[];
  likes: DbLike[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initial seed data
const getInitialData = (): DbSchema => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const adminId = 'user-admin-1';
  const author1Id = 'user-author-1';
  const author2Id = 'user-author-2';

  const users: DbUser[] = [
    {
      id: adminId,
      name: 'Sarah Coleman',
      email: 'sarah@blogverse.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Lead Architect & Tech Blogger. Passionate about beautiful UI, scalable systems, and simple design systems.',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: author1Id,
      name: 'Marcus Chen',
      email: 'marcus@devmail.com',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Software engineer by day, writer by night. Crafting readable code and sharing my React & TypeScript journey.',
      role: 'user',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: author2Id,
      name: 'Elena Rostova',
      email: 'elena@designhq.org',
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      bio: 'Product Designer at DesignHQ. Living inside typography pairings, minimal layouts, and high-contrast styling guides.',
      role: 'user',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const posts: DbPost[] = [
    {
      id: 'post-1',
      title: 'The Art of Minimalist Website Engineering',
      content: 'As software developers, our instinct is to build. We see a blank workspace and want to add states, configure custom animation rails, integrate background jobs, and structure secondary visual charts. BUT true craftsmanship is the absolute discipline of restraint.\n\n### Why Less is More\nIn modern web development, speed and comprehension are the ultimate products. An over-engineered system with flickering interactions, unrequested secondary sidebars, and persistent log boxes degrades trust. When you build a single-view, highly-polished focus tool, you allow the user’s mind to settle. \n\n### Typography Hierarchy\nIf your font weights, line-heights, tracking, and font selections are clean, you don\'t need colored gradients, badges, or shadows to attract attention. Try limiting your layout to two fonts:\n- **Inter**: For clean, crisp body copy.\n- **Space Grotesk**: For modern, tech-forward displays.\n\nKeep paragraph lines bound by a max-width of `max-w-3xl` so that the reader’s eye doesn\'t travel too far on large desktops. Embrace negative space. It isn\'t empty space; it\'s breathing room.',
      excerpt: 'Discover why true software craftsmanship lies in the absolute discipline of restraint, clean typography, and spacious layouts.',
      featuredImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      category: 'Design',
      authorId: adminId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-2',
      title: 'Mastering Modern React 19 State Managers',
      content: 'React 19 is officially here, and with it, a series of improvements to action states, server interactions, and resource loading. While the ecosystem continues to produce complex visual playgrounds, mastering clean, locally-scoped hooks is still the most valuable skill you can possess.\n\n### Form Actions & `useActionState`\nForget standard onSubmit event handlers with tedious loading states and manual error resets. React 19 Form Actions allow you to link form submissions directly with async transitions. Here\'s how you can model asynchronous interactions using natural hook callbacks:\n\n1. Define simple server action handles.\n2. Bind form state using `useActionState`.\n3. Implement lightweight, loading feedback loops.\n\nLet\'s build with simplicity. Try avoiding global stores or heavyweight middleware until the local component hierarchy is absolutely strained. You will save bandwidth and reduce runtime complexity.',
      excerpt: 'Learn how to leverage React 19\'s new form actions, state flows, and hooks to build fast, lightweight, and robust user experiences.',
      featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
      category: 'Programming',
      authorId: author1Id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-3',
      title: 'Building a Scaling SaaS: The Boring Path',
      content: 'Everyone wants to talk about Kubernetes, Microservice Meshes, and complex global caching strategies. But if you talk to founders of profitable, self-sustained SaaS products, they\'ll tell you a completely different story: they built with monolithic frameworks, stored state in single reliable databases, and ran on basic Cloud Run containers.\n\n### The Superpower of Boring Tech\nWhen you use boring, widely-supported technologies, you minimize debugging overhead. You stay in front of your IDE crafting core value instead of editing configuration files or battling dependency incompatibilities. \n\nChoose PostgreSQL or robust local-first SQLite nodes over hyper-hyped distributed databases. Code in clean TypeScript. Server-side render your pages or use structured client React bundles. The fastest code to deploy is the code that works flawlessly on standard engines.',
      excerpt: 'Forget the hype. Profitable scale comes from choosing boring, standard technology and focusing on user interactions.',
      featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      category: 'Business',
      authorId: adminId,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'post-4',
      title: 'Visual Hierarchy in High-Contrast Typography',
      content: 'High-contrast layouts are dominating professional SaaS overlays and visual portfolios. By utilizing deep charcoal (#1e1e24) on warm white (#fdfbf7), you give interfaces a tangible, editorial weight resembling editorial print media.\n\n### Rules for High-Contrast Grid Elements:\n- **Contrast Ratio**: Aim for 7:1 or higher for display elements.\n- **Border Lines**: Keep standard container borders wafer-thin (`border-gray-200` or `border-zinc-800`), avoiding thick shadowed cards.\n- **Padding Rhythm**: Ensure visual headings have twice the padding of subheadings. Consistent default padding everywhere looks uninspired; intentional variation introduces rhythm.\n\nNext time you open a project, delete your gradients and start with pure typography.',
      excerpt: 'Analyze the mechanics of warm editorial dark-on-light grids, typographic pairings, and crisp structural border design.',
      featuredImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800',
      category: 'Technology',
      authorId: author2Id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const comments: DbComment[] = [
    {
      id: 'comment-1',
      postId: 'post-1',
      authorId: author1Id,
      content: 'This speaks to my soul. I have spent the last week fighting Webpack and complex loaders for a project that only needs one visual viewport. Taking this restraint back to my day job tomorrow.',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'comment-2',
      postId: 'post-1',
      authorId: author2Id,
      content: 'The note about typography rhythm is exactly right. If the editorial structure is solid, you can strip everything else away. Excellent article!',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'comment-3',
      postId: 'post-2',
      authorId: adminId,
      content: 'Excellent guide, Marcus. React 19 is an incredible leap forward for making form handlers standard and readable directly in-line.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const likes: DbLike[] = [
    { postId: 'post-1', userId: author1Id, createdAt: new Date().toISOString() },
    { postId: 'post-1', userId: author2Id, createdAt: new Date().toISOString() },
    { postId: 'post-2', userId: adminId, createdAt: new Date().toISOString() }
  ];

  return { users, posts, comments, likes };
};

export class Db {
  private static data: DbSchema | null = null;

  private static init() {
    if (this.data) return;

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[DB] File database loaded successfully!');
      } catch (err) {
        console.error('[DB] Failed parsing DB file, creating fresh...');
        this.data = getInitialData();
        this.save();
      }
    } else {
      console.log('[DB] DB file not found, seeding fresh initial data...');
      this.data = getInitialData();
      this.save();
    }
  }

  private static save() {
    if (!this.data) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed writing to database:', err);
    }
  }

  // User Operations
  static getUsers(): DbUser[] {
    this.init();
    return this.data?.users || [];
  }

  static getUserById(id: string): DbUser | undefined {
    this.init();
    return this.data?.users.find(u => u.id === id);
  }

  static getUserByEmail(email: string): DbUser | undefined {
    this.init();
    return this.data?.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static createUser(user: DbUser): DbUser {
    this.init();
    this.data?.users.push(user);
    this.save();
    return user;
  }

  static updateUser(id: string, updates: Partial<Omit<DbUser, 'id' | 'role' | 'createdAt'>>): DbUser {
    this.init();
    const idx = this.data?.users.findIndex(u => u.id === id) ?? -1;
    if (idx === -1) throw new Error('User not found');
    const user = this.data!.users[idx];
    const updated = { ...user, ...updates };
    this.data!.users[idx] = updated;
    this.save();
    return updated;
  }

  // Post Operations
  static getPosts(): DbPost[] {
    this.init();
    return this.data?.posts || [];
  }

  static getPostById(id: string): DbPost | undefined {
    this.init();
    return this.data?.posts.find(p => p.id === id);
  }

  static createPost(post: DbPost): DbPost {
    this.init();
    this.data?.posts.push(post);
    this.save();
    return post;
  }

  static updatePost(id: string, updates: Partial<Omit<DbPost, 'id' | 'authorId' | 'createdAt'>>): DbPost {
    this.init();
    const idx = this.data?.posts.findIndex(p => p.id === id) ?? -1;
    if (idx === -1) throw new Error('Post not found');
    const post = this.data!.posts[idx];
    const updated = { ...post, ...updates, updatedAt: new Date().toISOString() };
    this.data!.posts[idx] = updated;
    this.save();
    return updated;
  }

  static deletePost(id: string): boolean {
    this.init();
    const initialLen = this.data?.posts.length || 0;
    if (this.data) {
      this.data.posts = this.data.posts.filter(p => p.id !== id);
      // Clean up likes & comments related to post
      this.data.comments = this.data.comments.filter(c => c.postId !== id);
      this.data.likes = this.data.likes.filter(l => l.postId !== id);
      this.save();
      return this.data.posts.length < initialLen;
    }
    return false;
  }

  // Comment Operations
  static getCommentsForPost(postId: string): DbComment[] {
    this.init();
    return (this.data?.comments || []).filter(c => c.postId === postId);
  }

  static getCommentById(id: string): DbComment | undefined {
    this.init();
    return this.data?.comments.find(c => c.id === id);
  }

  static createComment(comment: DbComment): DbComment {
    this.init();
    this.data?.comments.push(comment);
    this.save();
    return comment;
  }

  static updateComment(id: string, content: string): DbComment {
    this.init();
    const idx = this.data?.comments.findIndex(c => c.id === id) ?? -1;
    if (idx === -1) throw new Error('Comment not found');
    const comment = this.data!.comments[idx];
    const updated = { ...comment, content, updatedAt: new Date().toISOString() };
    this.data!.comments[idx] = updated;
    this.save();
    return updated;
  }

  static deleteComment(id: string): boolean {
    this.init();
    const initialLen = this.data?.comments.length || 0;
    if (this.data) {
      this.data.comments = this.data.comments.filter(c => c.id !== id);
      this.save();
      return this.data.comments.length < initialLen;
    }
    return false;
  }

  // Like Operations
  static getLikes(): DbLike[] {
    this.init();
    return this.data?.likes || [];
  }

  static toggleLike(postId: string, userId: string): { liked: boolean; count: number } {
    this.init();
    if (!this.data) return { liked: false, count: 0 };
    const idx = this.data.likes.findIndex(l => l.postId === postId && l.userId === userId);
    let liked = false;
    if (idx !== -1) {
      // Unlike
      this.data.likes.splice(idx, 1);
    } else {
      // Like
      this.data.likes.push({ postId, userId, createdAt: new Date().toISOString() });
      liked = true;
    }
    this.save();

    const count = this.data.likes.filter(l => l.postId === postId).length;
    return { liked, count };
  }

  static isLiked(postId: string, userId: string): boolean {
    this.init();
    return (this.data?.likes || []).some(l => l.postId === postId && l.userId === userId);
  }

  static getPostLikesCount(postId: string): number {
    this.init();
    return (this.data?.likes || []).filter(l => l.postId === postId).length;
  }
}
