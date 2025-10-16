/**
 * Content Formatter Utility
 * Converts plain text or markdown-like content into properly formatted HTML
 */

export interface FormattedContent {
  html: string;
  wordCount: number;
  readingTime: number;
}

export function formatBlogContent(content: string): FormattedContent {
  if (!content) {
    return { html: '', wordCount: 0, readingTime: 0 };
  }

  // Clean up the content
  let formatted = content.trim();

  // Convert markdown-like syntax to HTML
  formatted = formatted
    // Headers (must come before other formatting)
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Code blocks (triple backticks)
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    .replace(/^\*\*\*$/gm, '<hr>');

  // Handle lists
  formatted = formatLists(formatted);

  // Handle paragraphs (must come after other formatting)
  formatted = formatParagraphs(formatted);

  // Calculate word count and reading time
  const wordCount = formatted.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

  return {
    html: formatted,
    wordCount,
    readingTime
  };
}

function formatLists(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Unordered list items
    if (trimmedLine.match(/^[-*+]\s+/)) {
      if (!inUnorderedList) {
        result.push('<ul>');
        inUnorderedList = true;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      const listItem = trimmedLine.replace(/^[-*+]\s+/, '');
      result.push(`<li>${listItem}</li>`);
    }
    // Ordered list items
    else if (trimmedLine.match(/^\d+\.\s+/)) {
      if (!inOrderedList) {
        result.push('<ol>');
        inOrderedList = true;
      }
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      const listItem = trimmedLine.replace(/^\d+\.\s+/, '');
      result.push(`<li>${listItem}</li>`);
    }
    // Not a list item
    else {
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      result.push(line);
    }
  }

  // Close any open lists
  if (inUnorderedList) {
    result.push('</ul>');
  }
  if (inOrderedList) {
    result.push('</ol>');
  }

  return result.join('\n');
}

function formatParagraphs(content: string): string {
  // Split content into blocks
  const blocks = content.split(/\n\s*\n/);
  
  return blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    
    // Skip if it's already wrapped in HTML tags
    if (trimmed.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|div|section|article)/i)) {
      return trimmed;
    }
    
    // Skip if it's a list item or header
    if (trimmed.match(/^([-*+]|\d+\.)\s+/) || trimmed.match(/^#{1,6}\s+/)) {
      return trimmed;
    }
    
    // Wrap in paragraph tags
    return `<p>${trimmed}</p>`;
  }).join('\n\n');
}

// Alternative function for simple line break conversion
export function formatSimpleContent(content: string): string {
  if (!content) return '';
  
  return content
    .trim()
    .split('\n\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => {
      const trimmed = paragraph.trim();
      
      // Check if it's already wrapped in HTML
      if (trimmed.match(/^<[^>]+>/)) {
        return trimmed;
      }
      
      // Check for headers
      if (trimmed.startsWith('# ')) {
        return `<h1>${trimmed.substring(2)}</h1>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.substring(3)}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.substring(4)}</h3>`;
      }
      
      // Check for lists
      if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter(line => line.trim().startsWith('- '));
        const listItems = items.map(item => `<li>${item.substring(2).trim()}</li>`).join('\n');
        return `<ul>\n${listItems}\n</ul>`;
      }
      
      // Regular paragraph
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n\n');
}
