import { BlogCategory } from './types';

/**
 * Super lightweight, performant, and secure markdown parser that converts core 
 * markdown elements to safe HTML strings for displaying beautiful blog posts.
 */
export function parseMarkdown(md: string = ''): string {
  if (!md) return '';

  let html = md
    // Escape HTML characters to protect against XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code Blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-gray-50 border border-gray-100 text-sm font-mono text-gray-800 p-4 rounded-lg my-4 overflow-x-auto block"><code>${code.trim()}</code></pre>`;
  });

  // Headers (### Header)
  html = html.replace(/### (.*?)\n/g, '<h3 class="text-xl font-sans font-semibold tracking-tight text-gray-900 mt-6 mb-2">$1</h3>');
  html = html.replace(/## (.*?)\n/g, '<h2 class="text-2xl font-sans font-semibold tracking-tight text-gray-900 mt-8 mb-3 border-b border-gray-100 pb-1">$1</h2>');
  html = html.replace(/# (.*?)\n/g, '<h1 class="text-3xl font-sans font-bold tracking-tight text-gray-900 mt-10 mb-4">$1</h1>');

  // Bold (**bold**) & Italic (*italic*)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Blockquotes (> Blockquote)
  html = html.replace(/^\s*&gt;\s+(.*?)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>');

  // Ordered list (1. Item)
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="list-decimal ml-6 pl-1 my-1">$1</li>');

  // Unordered list (- Item or * Item)
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="list-disc ml-6 pl-1 my-1">$1</li>');

  // Paragraphs - group sections of plain lines into paragraphs, excluding lists, headers, etc.
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';
    // Skip if it is already wrapped in block elements
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<pre') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<li')
    ) {
      return trimmed;
    }
    return `<p class="leading-relaxed mb-4 text-gray-700">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

/**
 * Tailwind badges for category tags.
 */
export function getCategoryStyles(category: BlogCategory): { bg: string; text: string; ring: string } {
  switch (category) {
    case 'Technology':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/10' };
    case 'Design':
      return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/10' };
    case 'Programming':
      return { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-600/10' };
    case 'Lifestyle':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-600/10' };
    case 'Business':
      return { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-600/10' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-600/10' };
  }
}

/**
 * Format timestamp into pleasant human-readable date.
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    return dateString;
  }
}
