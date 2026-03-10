export type Role = 'customer' | 'engineer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'pending' | 'resolved';
  product_module: string;
  customer_id: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  engineer_name?: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_role: Role;
}

export interface KBArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  author_id: number;
  created_at: string;
  author_name: string;
}

export interface Log {
  id: number;
  severity: string;
  message: string;
  stack_trace: string;
  timestamp: string;
}
