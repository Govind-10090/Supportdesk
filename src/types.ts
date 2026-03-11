export type Role = 'customer' | 'engineer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'pending' | 'resolved';
  product_module: string;
  customer_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  engineer_name?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_role: Role;
}

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  created_at: string;
  author_name: string;
}

export interface Log {
  id: string;
  severity: string;
  message: string;
  stack_trace: string;
  timestamp: string;
}
