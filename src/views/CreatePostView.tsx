import React, { useState, useRef } from 'react';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { BlogCategory } from '../types';
import MarkdownEditor from '../components/MarkdownEditor';

interface CreatePostProps {
  onNavigate: (view: string) => void;
}

const CATEGORIES: BlogCategory[] = [
  'Technology',
  'Design',
  'Programming',
  'Lifestyle',
  'Business',
  'Other'
];

export default function CreatePostView({ onNavigate }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BlogCategory>('Technology');
  const [excerpt, setExcerpt] = useState('');
  
  // Handlers for image source selection (URL vs Local Upload file)
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse files and update Base64 state
  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload a valid image (PNG, JPG, WEBP).');
      return;
    }
    // Limit to 4MB for optimal base64 serialization limits
    if (file.size > 4 * 1024 * 1024) {
      setError('Image file is too large. Must be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedBase64(reader.result as string);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed reading local image file.');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Article Title and Markdown Content are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Resolve final featured image payload
      const finalImage = imageType === 'upload' ? uploadedBase64 : imageUrlInput;

      await api.createPost({
        title,
        content,
        excerpt: excerpt.trim() || undefined,
        category,
        featuredImage: finalImage || undefined
      });

      onNavigate('dashboard');
    } catch (err: any) {
      console.error('[CREATE POST] Submit error:', err);
      setError(err.message || 'Failed creating new blog draft. Please verify authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to navigation button */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Write New Article</h1>
          <p className="text-sm text-gray-500 mt-1">Express your coding guides, product summaries or design views</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 flex items-start gap-2 text-sm leading-relaxed">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Title text input */}
        <div>
          <label htmlFor="post-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Post Title
          </label>
          <input
            id="post-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type full title..."
            className="block w-full rounded-xl border border-gray-200 py-3 px-4 text-base placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-sans"
          />
        </div>

        {/* Row categories and summary excerpt */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Categories select dropdown */}
          <div>
            <label htmlFor="post-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category Tag
            </label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="block w-full cursor-pointer rounded-xl border border-gray-200 py-3 px-4 text-sm bg-white outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt summaries text fields */}
          <div className="sm:col-span-2">
            <label htmlFor="post-excerpt" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Excerpt Summary (Optional)
            </label>
            <input
              id="post-excerpt"
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short one-sentence summary for post cards (auto-generated if empty)..."
              className="block w-full rounded-xl border border-gray-200 py-3 px-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Image Upload Panel */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <label className="text-sm font-bold text-gray-800">Featured Post Image</label>
            <div className="flex items-center bg-gray-150 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setImageType('url')}
                className={`py-1 px-3 text-xs font-semibold rounded-md transition ${
                  imageType === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                External URL
              </button>
              <button
                type="button"
                onClick={() => setImageType('upload')}
                className={`py-1 px-3 text-xs font-semibold rounded-md transition ${
                  imageType === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Local Upload
              </button>
            </div>
          </div>

          {imageType === 'url' ? (
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-example..."
                className="block w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all"
              />
            </div>
          ) : (
            <div>
              {uploadedBase64 ? (
                <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedBase64}
                      alt="Uploaded preview"
                      className="h-14 w-20 rounded-lg object-cover bg-white"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-gray-800">Local post image ready</p>
                      <p className="text-gray-400">Successfully serialized base64 payload</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedBase64(null)}
                    className="p-1.5 hover:bg-gray-250 text-gray-400 hover:text-gray-950 rounded-lg transition mr-1"
                    title="Remove local draft image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    dragActive
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Drag & drop your post cover, or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP under 4MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Interactive Markdown / visual Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Markdown Text Content
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Type your markdown article here... Use headings (#/##), bullet points (-), bold text (**text**), blocks (>), or formatted code blocks (```code```)!"
          />
        </div>

        {/* Submit handle line */}
        <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl border border-gray-200 py-3 px-5 text-sm font-semibold text-gray-750 transition hover:bg-gray-50"
          >
            Cancel Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 text-white px-6 py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating Publishing...' : 'Save & Publish Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
