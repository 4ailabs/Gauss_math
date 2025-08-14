export interface ParsedContent {
  type: 'text' | 'heading' | 'list' | 'code' | 'formula';
  content: string;
  level?: number;
  items?: string[];
}

export const parseMarkdown = (text: string): ParsedContent[] => {
  const lines = text.split('\n');
  const result: ParsedContent[] = [];
  let currentList: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      if (currentList.length > 0) {
        result.push({ type: 'list', content: '', items: [...currentList] });
        currentList = [];
      }
      continue;
    }
    
    // Headings (###, ##, #)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentList.length > 0) {
        result.push({ type: 'list', content: '', items: [...currentList] });
        currentList = [];
      }
      result.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length
      });
      continue;
    }
    
    // List items (-, *, •)
    const listMatch = line.match(/^[-*•]\s+(.+)$/);
    if (listMatch) {
      currentList.push(listMatch[1]);
      continue;
    }
    
    // Code blocks (```)
    if (line.startsWith('```')) {
      if (currentList.length > 0) {
        result.push({ type: 'list', content: '', items: [...currentList] });
        currentList = [];
      }
      // Find closing ```
      let codeContent = '';
      i++; // Skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent += lines[i] + '\n';
        i++;
      }
      result.push({ type: 'code', content: codeContent.trim() });
      continue;
    }
    
    // Math formulas ($...$)
    const formulaMatch = line.match(/\$(.+)\$/);
    if (formulaMatch) {
      if (currentList.length > 0) {
        result.push({ type: 'list', content: '', items: [...currentList] });
        currentList = [];
      }
      result.push({ type: 'formula', content: formulaMatch[1] });
      continue;
    }
    
    // Regular text
    if (currentList.length > 0) {
      result.push({ type: 'list', content: '', items: [...currentList] });
      currentList = [];
    }
    
    // Clean bold/italic markers
    const cleanText = line
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
      .replace(/`(.*?)`/g, '$1');       // Remove `code`
    
    result.push({ type: 'text', content: cleanText });
  }
  
  // Add remaining list if any
  if (currentList.length > 0) {
    result.push({ type: 'list', content: '', items: currentList });
  }
  
  return result;
};