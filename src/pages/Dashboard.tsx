import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Ticket, User } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Activity,
  Ticket as TicketIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets');
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'investigating': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'pending': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle size={14} className="text-red-500" />;
      case 'high': return <AlertCircle size={14} className="text-orange-500" />;
      case 'medium': return <Activity size={14} className="text-amber-500" />;
      case 'low': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: TicketIcon, color: 'bg-blue-500' },
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Critical', value: tickets.filter(t => t.priority === 'critical').length, icon: AlertCircle, color: 'bg-red-500' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight italic serif">Overview</h1>
          <p className="text-[#141414]/60 mt-1">Welcome back, {user.name}. Here's what's happening.</p>
        </div>
        {user.role === 'customer' && (
          <Link 
            to="/tickets/new"
            className="bg-[#141414] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center space-x-2 hover:bg-[#141414]/90 transition-all"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-[#141414]/10 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg text-white", stat.color)}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-[#141414]/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white border border-[#141414]/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#141414]/10 flex items-center justify-between">
          <h2 className="text-xl font-bold italic serif">Recent Activity</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" />
              <input 
                type="text" 
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 bg-[#F5F5F0] border-none rounded-lg text-sm focus:ring-2 focus:ring-[#141414] outline-none w-64"
              />
            </div>
            <button className="p-2 hover:bg-[#F5F5F0] rounded-lg text-[#141414]/60">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F0]/50 text-xs font-bold uppercase tracking-widest text-[#141414]/40">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Issue Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {tickets.slice(0, 10).map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F5F5F0]/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-[#141414]/40">#SD-{ticket.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{ticket.title}</div>
                    <div className="text-xs text-[#141414]/40 truncate max-w-xs">{ticket.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-[#141414]/5 rounded capitalize">{ticket.category.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs font-medium capitalize">
                      {getPriorityIcon(ticket.priority)}
                      <span>{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border", getStatusColor(ticket.status))}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#141414]/40">
                    {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/tickets/${ticket.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#141414] hover:text-white transition-all text-[#141414]/40"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#141414]/40 italic">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
