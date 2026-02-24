export type Priority = 'low' | 'medium' | 'high';

export interface Board {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  assignee_id: string | null;
  assignee?: {
    id: string;
    email: string;
  };
  position: number;
  created_at: string;
}


export interface BoardMember {
  board_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  user?: {
    id: string;
    email: string;
  };
}

export interface Tag {
  id: string;
  board_id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
  };
}

