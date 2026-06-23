import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { Db, DbUser } from './server/db.js';

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'blog-platform-super-secret-key-2026';

// Request parsing with high limit for Base64 image payloads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// --- Authentication Middleware ---
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
}

// --- RESTful API Endpoints ---

// 1. Auth Endpoints
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, avatarUrl, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = Db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: DbUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      bio: bio || '',
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    Db.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = Db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = Db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const userId = req.user!.id;

    const updates: Partial<DbUser> = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const updatedUser = Db.updateUser(userId, updates);
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Profile update failed' });
  }
});

// 2. Posts CRUD Endpoints
app.get('/api/posts', (req: Request, res: Response) => {
  try {
    const { search, category, authorId, page = '1', limit = '6' } = req.query;

    let posts = Db.getPosts();

    // Filter by author
    if (authorId) {
      posts = posts.filter(p => p.authorId === authorId);
    }

    // Filter by category
    if (category && category !== 'All') {
      posts = posts.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    // Search filter (in title, content, or excerpt)
    if (search) {
      const q = (search as string).toLowerCase();
      posts = posts.filter(
        p => p.title.toLowerCase().includes(q) ||
             p.content.toLowerCase().includes(q) ||
             p.excerpt.toLowerCase().includes(q)
      );
    }

    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Map authors, likes and comments count
    const populatedPosts = posts.map(p => {
      const author = Db.getUserById(p.authorId);
      const comments = Db.getCommentsForPost(p.id);
      const likesCount = Db.getPostLikesCount(p.id);

      // Check current user like status if header is present
      let likedByMe = false;
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          likedByMe = Db.isLiked(p.id, decoded.id);
        } catch (_) {}
      }

      return {
        ...p,
        authorName: author ? author.name : 'Unknown Author',
        authorAvatar: author ? author.avatarUrl : undefined,
        likesCount,
        commentsCount: comments.length,
        likedByMe,
      };
    });

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;

    const paginated = populatedPosts.slice(startIndex, endIndex);

    res.json({
      posts: paginated,
      pagination: {
        totalPosts: populatedPosts.length,
        totalPages: Math.ceil(populatedPosts.length / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/posts/:id', (req: Request, res: Response) => {
  try {
    const post = Db.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const author = Db.getUserById(post.authorId);
    const likesCount = Db.getPostLikesCount(post.id);
    const comments = Db.getCommentsForPost(post.id);

    // Map comment authors
    const populatedComments = comments.map(c => {
      const commentAuthor = Db.getUserById(c.authorId);
      return {
        ...c,
        authorName: commentAuthor ? commentAuthor.name : 'Unknown User',
        authorAvatar: commentAuthor ? commentAuthor.avatarUrl : undefined,
      };
    });

    // Sort comments by oldest first (standard chronological comment stream)
    populatedComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Check if liked by me
    let likedByMe = false;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        likedByMe = Db.isLiked(post.id, decoded.id);
      } catch (_) {}
    }

    res.json({
      post: {
        ...post,
        authorName: author ? author.name : 'Unknown Author',
        authorAvatar: author ? author.avatarUrl : undefined,
        authorBio: author ? author.bio : undefined,
        likesCount,
        commentsCount: comments.length,
        likedByMe,
      },
      comments: populatedComments,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, featuredImage, category } = req.body;
    const authorId = req.user!.id;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // High quality draft placeholder if no image provided
    const defaultImages = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800'
    ];
    const computedImage = featuredImage || defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const id = `post-${Date.now()}`;
    const newPost = {
      id,
      title,
      content,
      excerpt: excerpt || (content.substring(0, 150).replace(/[#*`_]/g, '') + '...'),
      featuredImage: computedImage,
      category,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Db.createPost(newPost);
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/posts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, featuredImage, category } = req.body;
    const post = Db.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only post owner or admin can edit
    if (post.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to modify this post' });
    }

    const updates: any = {};
    if (title) updates.title = title;
    if (content) {
      updates.content = content;
      if (!excerpt) {
        updates.excerpt = content.substring(0, 150).replace(/[#*`_]/g, '') + '...';
      }
    }
    if (excerpt) updates.excerpt = excerpt;
    if (featuredImage) updates.featuredImage = featuredImage;
    if (category) updates.category = category;

    const updated = Db.updatePost(req.params.id, updates);
    res.json({ message: 'Post updated successfully', post: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const post = Db.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only post owner or admin can delete
    if (post.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    const success = Db.deletePost(req.params.id);
    if (success) {
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete post' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Comments Endpoints
app.post('/api/posts/:id/comments', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const authorId = req.user!.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment text content cannot be empty' });
    }

    const post = Db.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Db.createComment(newComment);

    const author = Db.getUserById(authorId);
    const populated = {
      ...newComment,
      authorName: author ? author.name : 'Unknown User',
      authorAvatar: author ? author.avatarUrl : undefined,
    };

    res.status(201).json({ message: 'Comment added', comment: populated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/comments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const comment = Db.getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to modify this comment' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment text content cannot be empty' });
    }

    const updated = Db.updateComment(req.params.id, content);
    const author = Db.getUserById(comment.authorId);

    res.json({
      message: 'Comment updated successfully',
      comment: {
        ...updated,
        authorName: author ? author.name : 'Unknown User',
        authorAvatar: author ? author.avatarUrl : undefined,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/comments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const comment = Db.getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    const success = Db.deleteComment(req.params.id);
    if (success) {
      res.json({ message: 'Comment deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Post Like Endpoint
app.post('/api/posts/:id/like', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = Db.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const result = Db.toggleLike(postId, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Dashboard Stats Endpoint
app.get('/api/dashboard/stats', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const posts = Db.getPosts().filter(p => p.authorId === userId);
    const comments = Db.getCommentsForPost(''); // Just to read all comments

    // Gather own posts
    const ownPostIds = posts.map(p => p.id);

    // Calculate total likes received across user's own posts
    const allLikes = Db.getLikes();
    const likesReceived = allLikes.filter(l => ownPostIds.includes(l.postId)).length;

    // Calculate total comments received
    const allDbComments = Db.getCommentsForPost('__all__'); // Let's write a small helper or filter manually
    // Since Db.getCommentsForPost filters by postId, let's filter the internal comments array manually or fetch per post
    let commentsReceived = 0;
    ownPostIds.forEach(pid => {
      commentsReceived += Db.getCommentsForPost(pid).length;
    });

    // Posts count by category
    const categoryCount: Record<string, number> = {};
    posts.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    const postsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));

    // Recent posts returned as stats preview
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(p => {
        const commentStream = Db.getCommentsForPost(p.id);
        const likeCountByPost = Db.getPostLikesCount(p.id);
        return {
          ...p,
          likesCount: likeCountByPost,
          commentsCount: commentStream.length,
        };
      });

    res.json({
      totalPosts: posts.length,
      totalLikes: likesReceived,
      totalComments: commentsReceived,
      postsByCategory,
      recentPosts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- Vite Middleware Injection & Server Start ---

async function startServer() {
  // Vite dev or static asset middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app._router.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running full-stack blog platform on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SERVER] Critical crash during initialization:', err);
});
