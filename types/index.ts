export interface Memo {
  id: number;
  title: string;
  content: string;
  category: 'bug' | 'feature' | 'idea' | 'note' | 'todo';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoInput {
  title: string;
  content: string;
  category: Memo['category'];
  priority: Memo['priority'];
  tags: string[];
}