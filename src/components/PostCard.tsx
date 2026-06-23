import React from 'react';
import { Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';
import { getCategoryStyles, formatDate } from '../utils';

interface PostCardProps {
  key?: string | number;
  post: BlogPost;
  onSelect: (id: string) => void;
  onLikeToggle?: (id: string, e: React.MouseEvent) => void;
}

export default function PostCard({ post, onSelect, onLikeToggle }: PostCardProps) {
  const badgeStyles = getCategoryStyles(post.category);

  return (
    <article 
      onClick={() => onSelect(post.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      {/* Post Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <img
          src={post.featuredImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category Badge overlay on image */}
        <span className={`absolute top-4 left-4 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles.bg} ${badgeStyles.text} ${badgeStyles.ring}`}>
          {post.category}
        </span>
      </div>

      {/* Post Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span>{Math.max(1, Math.ceil(post.content.split(' ').length / 200))} min read</span>
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        <p className="text-sm leading-relaxed text-gray-500 line-clamp-3 mb-4 flex-1">
          {post.excerpt}
        </p>

        {/* Post Footer Info */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-2">
            <img
              src={post.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorName)}`}
              alt={post.authorName}
              className="h-7 w-7 rounded-full bg-gray-100 object-cover border border-gray-100"
            />
            <span className="text-xs font-medium text-gray-700 truncate max-w-[110px]">
              {post.authorName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Likes */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onLikeToggle) onLikeToggle(post.id, e);
              }}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                post.likedByMe ? 'text-red-500' : ''
              }`}
              title={post.likedByMe ? 'Unlike post' : 'Like post'}
            >
              <Heart 
                className={`h-4 w-4 transition-transform duration-200 active:scale-125 ${
                  post.likedByMe ? 'fill-current' : ''
                }`} 
              />
              <span>{post.likesCount}</span>
            </button>

            {/* Comments count */}
            <div className="flex items-center gap-1" title="Comments">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
