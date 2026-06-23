import { useState } from 'react';
import { Eye, Edit3, Heading1, Heading2, Bold, Italic, Quote, Code, List, ListOrdered } from 'lucide-react';
import { parseMarkdown } from '../utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ value, onChange, placeholder = 'Write your article here using markdown...', rows = 12 }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertHelper = (syntax: string, placeholderText: string = '') => {
    setActiveTab('edit');
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || placeholderText;

    let replacement = '';
    if (syntax === 'h1') replacement = `# ${selectedText}\n`;
    else if (syntax === 'h2') replacement = `## ${selectedText}\n`;
    else if (syntax === 'bold') replacement = `**${selectedText}**`;
    else if (syntax === 'italic') replacement = `*${selectedText}*`;
    else if (syntax === 'quote') replacement = `> ${selectedText}\n`;
    else if (syntax === 'code') replacement = `\`\`\`javascript\n${selectedText}\n\`\`\``;
    else if (syntax === 'list') replacement = `- ${selectedText}\n`;
    else if (syntax === 'ordered') replacement = `1. ${selectedText}\n`;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Refocus and place cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900/30 transition-all duration-200">
      {/* Editor toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 bg-gray-50/50 p-2">
        {/* Helper short-keys */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertHelper('h1', 'Header 1')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Heading 1 (#)"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHelper('h2', 'Header 2')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Heading 2 (##)"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={() => insertHelper('bold', 'bold text')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition font-bold"
            title="Bold (**text**)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHelper('italic', 'italic text')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition italic"
            title="Italic (*text*)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={() => insertHelper('quote', 'Quote text')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Blockquote (>)"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHelper('code', '// write code')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Code Block (```)"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHelper('list', 'List item')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Bullet List (-)"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHelper('ordered', 'List item')}
            className="p-1.5 text-gray-500 rounded-lg hover:bg-white hover:text-gray-900 hover:shadow-sm transition"
            title="Ordered List (1.)"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === 'edit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Format MD</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview Post</span>
          </button>
        </div>
      </div>

      {/* Editor Content Fields */}
      <div className="relative">
        {activeTab === 'edit' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full block border-0 p-4 font-mono text-sm leading-relaxed text-gray-800 bg-white placeholder-gray-400 focus:ring-0 outline-none resize-y"
          />
        ) : (
          <div 
            className="w-full prose max-w-none p-6 bg-white overflow-y-auto block select-text"
            style={{ height: `${rows * 24}px` }}
          >
            {value.trim() ? (
              <div 
                className="markdown-body text-gray-800 leading-relaxed text-base break-words"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
              />
            ) : (
              <span className="italic text-gray-400 text-sm">Nothing to preview yet. Start typing to see results!</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
