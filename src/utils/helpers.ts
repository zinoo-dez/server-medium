export const calculateReadingTime = (content: any): number => {
  if (!content) return 1;
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (content.blocks) {
    text = content.blocks.map((block: any) => {
      if (block.type === 'paragraph' || block.type === 'header') return block.data.text;
      return '';
    }).join(' ');
  } else {
    text = JSON.stringify(content);
  }

  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
  return readingTime > 0 ? readingTime : 1;
};

export const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const hash = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${hash}`;
};
